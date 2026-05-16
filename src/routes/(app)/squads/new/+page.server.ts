import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const clients = await locals.pb.collection('clients').getList(1, 100, {
    sort: 'name', requestKey: null
  });
  return { clients: clients.items };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString() ?? '';
    const description = data.get('description')?.toString() ?? '';
    const client = data.get('client')?.toString() ?? '';

    if (!name.trim()) return fail(400, { error: 'Nome é obrigatório' });

    try {
      await locals.pb.collection('squads').create({
        name,
        description,
        client: client || null,
        config: {},
        created_by: locals.user?.id
      });
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao criar squad' });
    }
    redirect(302, '/squads');
  }
};
