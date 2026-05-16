import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const squads = await locals.pb.collection('squads').getList(1, 100, {
    sort: '-id',
    requestKey: null
  });
  return { squads: squads.items };
};
