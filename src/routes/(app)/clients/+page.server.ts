import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const clientId = data.get('client_id')?.toString();
    if (!clientId) return fail(400, { error: 'ID inválido' });
    try {
      await locals.pb.collection('clients').delete(clientId);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao deletar cliente' });
    }
  }
};
