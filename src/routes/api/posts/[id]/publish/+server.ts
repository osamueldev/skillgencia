import { error, redirect } from '@sveltejs/kit';
import { decrypt } from '$lib/server/crypto';
import { publishPhoto } from '$lib/server/meta';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) error(401, 'Unauthorized');

  let post: any;
  try {
    post = await locals.pb.collection('posts').getOne(params.id, { expand: 'client' });
  } catch {
    error(404, 'Post não encontrado');
  }

  if (post.status === 'published') error(400, 'Post já publicado');

  const connections = await locals.pb.collection('meta_connections').getList(1, 1, {
    filter: `client = "${post.client}" && platform = "${post.platform}"`
  });

  if (connections.totalItems === 0) {
    error(400, `Nenhuma conta ${post.platform} conectada para este cliente`);
  }

  const connection = connections.items[0];
  const accessToken = decrypt(connection.access_token);

  try {
    const pbUrl = process.env.POCKETBASE_URL ?? 'http://localhost:8090';
    const mediaUrl = post.media?.[0]
      ? `${pbUrl}/api/files/posts/${post.id}/${post.media[0]}`
      : null;

    if (!mediaUrl) error(400, 'Post sem mídia — Instagram requer pelo menos uma imagem');

    const metaPostId = await publishPhoto(
      connection.account_id,
      accessToken,
      mediaUrl,
      post.content
    );

    await locals.pb.collection('posts').update(params.id, {
      status: 'published',
      published_at: new Date().toISOString(),
      meta_post_id: metaPostId
    });
  } catch (e: any) {
    await locals.pb.collection('posts').update(params.id, { status: 'failed' });
    error(500, `Falha ao publicar: ${e.message}`);
  }

  const referer = request.headers.get('referer') ?? `/clients/${post.client}/posts`;
  redirect(302, referer);
};
