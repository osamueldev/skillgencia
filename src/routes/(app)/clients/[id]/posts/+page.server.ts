import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const posts = await locals.pb.collection('posts').getList(1, 50, {
    filter: `client = "${params.id}"`,
    sort: '-created',
    requestKey: null
  });
  return { posts: posts.items };
};
