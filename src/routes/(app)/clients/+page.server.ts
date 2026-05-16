import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const clients = await locals.pb.collection('clients').getList(1, 100, {
      sort: 'name',
      requestKey: null
    });
    return { clients: clients.items };
  } catch (e) {
    console.error('[clients load]', e);
    return { clients: [] };
  }
};
