import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const connections = await locals.pb.collection('meta_connections').getList(1, 20, {
    filter: `client = "${params.id}"`,
    requestKey: null
  });
  return { connections: connections.items };
};

export const actions: Actions = {
  disconnect: async ({ request, locals }) => {
    const data = await request.formData();
    const connectionId = data.get('connection_id')?.toString();
    if (!connectionId) return fail(400, { error: 'ID inválido' });
    try {
      await locals.pb.collection('meta_connections').delete(connectionId);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao remover conexão' });
    }
  }
};
