import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const [connections, sessionId] = await Promise.all([
    locals.pb.collection('meta_connections').getList(1, 20, {
      filter: `client = "${params.id}"`,
      requestKey: null
    }).then(r => r.items),
    Promise.resolve(url.searchParams.get('select'))
  ]);

  let selectAccounts: any[] = [];
  let selectSessionId: string | null = null;

  if (sessionId) {
    try {
      const session = await locals.pb.collection('meta_oauth_sessions').getOne(sessionId);
      const expired = session.expires_at && new Date(session.expires_at) < new Date();
      if (!expired && session.client === params.id) {
        selectAccounts = JSON.parse(session.accounts ?? '[]');
        selectSessionId = sessionId;
      }
    } catch { /* session not found or expired */ }
  }

  return { connections, selectAccounts, selectSessionId };
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
  },

  select_account: async ({ request, locals, params }) => {
    const data = await request.formData();
    const sessionId = data.get('session_id')?.toString();
    const accountIndex = parseInt(data.get('account_index')?.toString() ?? '-1');

    if (!sessionId || accountIndex < 0) return fail(400, { error: 'Seleção inválida' });

    try {
      const session = await locals.pb.collection('meta_oauth_sessions').getOne(sessionId);
      const accounts = JSON.parse(session.accounts ?? '[]');
      const acc = accounts[accountIndex];
      if (!acc) return fail(400, { error: 'Conta não encontrada' });

      await locals.pb.collection('meta_connections').create({
        client: params.id,
        platform: acc.type,
        access_token: acc.token_encrypted,
        page_id: acc.page_id,
        account_id: acc.account_id,
        page_name: acc.name,
        expires_at: acc.expires_at
      });

      await locals.pb.collection('meta_oauth_sessions').delete(sessionId);
    } catch (e: any) {
      return fail(400, { error: e?.message ?? 'Erro ao salvar conexão' });
    }
  }
};
