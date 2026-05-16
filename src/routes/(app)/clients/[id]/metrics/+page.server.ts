import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const connections = await locals.pb.collection('meta_connections').getList(1, 20, {
    filter: `client = "${params.id}"`,
    requestKey: null
  });
  return {
    connections: connections.items,
    clientId: params.id
  };
};
