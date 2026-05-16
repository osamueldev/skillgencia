import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const squads = await locals.pb.collection('squads').getList(1, 100, {
      sort: '-created',
      requestKey: null
    });
    return { squads: squads.items };
  } catch (e) {
    console.error('[squads load]', e);
    return { squads: [] };
  }
};
