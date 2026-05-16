import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const connections = await locals.pb.collection('meta_connections').getList(1, 10, {
    filter: locals.pb.filter('client = {:id}', { id: params.id }),
    requestKey: null
  });
  return { connections: connections.items };
};
