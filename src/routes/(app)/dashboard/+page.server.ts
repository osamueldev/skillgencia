import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [clients, scheduledPosts, recentPosts] = await Promise.all([
    locals.pb.collection('clients').getList(1, 50, { sort: 'name' }),
    locals.pb.collection('posts').getList(1, 10, {
      filter: `status = "scheduled" && scheduled_at >= "${new Date().toISOString()}"`,
      sort: 'scheduled_at',
      expand: 'client'
    }),
    locals.pb.collection('posts').getList(1, 5, {
      filter: 'status = "published" || status = "failed"',
      sort: '-updated',
      expand: 'client'
    })
  ]);

  return {
    clientCount: clients.totalItems,
    scheduledPosts: scheduledPosts.items,
    recentPosts: recentPosts.items
  };
};
