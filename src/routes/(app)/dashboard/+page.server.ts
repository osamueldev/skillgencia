import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const [clients, scheduledPosts, recentPosts] = await Promise.all([
      locals.pb.collection('clients').getList(1, 50, { sort: 'name', requestKey: null }),
      locals.pb.collection('posts').getList(1, 10, {
        filter: 'status = "scheduled"',
        sort: 'scheduled_at',
        requestKey: null
      }),
      locals.pb.collection('posts').getList(1, 5, {
        filter: 'status = "published" || status = "failed"',
        sort: '-updated',
        requestKey: null
      })
    ]);

    return {
      clientCount: clients.totalItems,
      scheduledPosts: scheduledPosts.items,
      recentPosts: recentPosts.items
    };
  } catch (e) {
    console.error('[dashboard load]', e);
    return { clientCount: 0, scheduledPosts: [], recentPosts: [] };
  }
};
