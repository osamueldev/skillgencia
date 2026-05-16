import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const connections = await locals.pb.collection('meta_connections').getList(1, 10, {
    filter: `client = "${params.id}"`,
    requestKey: null
  });
  return { hasConnections: connections.totalItems > 0, clientId: params.id };
};
