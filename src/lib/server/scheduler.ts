import cron from 'node-cron';
import { createPocketBase } from './pocketbase';
import { decrypt } from './crypto';
import { publishPhoto } from './meta';

export async function findDueScheduledPosts() {
  const pb = createPocketBase();
  const now = new Date().toISOString();
  const result = await pb.collection('posts').getList(1, 50, {
    filter: pb.filter('status = {:s} && scheduled_at <= {:now}', { s: 'scheduled', now }),
    requestKey: null
  });
  return result.items;
}

async function processPost(postId: string): Promise<void> {
  const pb = createPocketBase();

  const post = await pb.collection('posts').getOne(postId).catch(() => null);
  if (!post || post.status !== 'scheduled') return;

  const connections = await pb.collection('meta_connections').getList(1, 1, {
    filter: pb.filter('client = {:c} && platform = {:p}', { c: post.client, p: post.platform })
  });

  if (connections.totalItems === 0) {
    await pb.collection('posts').update(postId, { status: 'failed' });
    return;
  }

  const connection = connections.items[0];
  const accessToken = decrypt(connection.access_token);

  try {
    const pbUrl = process.env.POCKETBASE_URL ?? 'http://localhost:8090';
    const mediaUrl = post.media?.[0]
      ? `${pbUrl}/api/files/posts/${postId}/${post.media[0]}`
      : null;

    if (!mediaUrl) throw new Error('No media attached to post');

    const metaPostId = await publishPhoto(
      connection.account_id,
      accessToken,
      mediaUrl,
      post.content
    );

    await pb.collection('posts').update(postId, {
      status: 'published',
      published_at: new Date().toISOString(),
      meta_post_id: metaPostId
    });
  } catch {
    await pb.collection('posts').update(postId, { status: 'failed' });
  }
}

export function initScheduler(): void {
  cron.schedule('* * * * *', async () => {
    try {
      const posts = await findDueScheduledPosts();
      await Promise.allSettled(posts.map((p) => processPost(p.id)));
    } catch {
      // scheduler keeps running even if a tick fails
    }
  });
}
