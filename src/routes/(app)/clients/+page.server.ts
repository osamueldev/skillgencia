import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const clients = await locals.pb.collection('clients').getList(1, 100, {
    sort: 'name',
    requestKey: null
  });
  return { clients: clients.items };
};
