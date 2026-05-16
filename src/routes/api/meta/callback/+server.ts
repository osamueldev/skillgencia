import { redirect, error } from '@sveltejs/kit';
import { exchangeCodeForToken, getPages } from '$lib/server/meta';
import { encrypt } from '$lib/server/crypto';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401, 'Unauthorized');
  const code = url.searchParams.get('code');
  const rawState = url.searchParams.get('state') ?? '';
  const [clientId, connectionType = 'both'] = rawState.split(':');

  if (!code || !clientId) error(400, 'Parâmetros inválidos');

  try {
    const { access_token, expires_in } = await exchangeCodeForToken(code!);
    const pages = await getPages(access_token);

    // Build list of available accounts for user to choose from
    const accounts: Array<{
      type: string;
      page_id: string;
      account_id: string;
      name: string;
      token_encrypted: string;
      expires_at: string | null;
    }> = [];

    for (const page of pages) {
      const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000).toISOString()
        : null;
      const tokenEncrypted = encrypt(page.access_token);

      if (connectionType !== 'instagram') {
        accounts.push({
          type: 'facebook',
          page_id: page.id,
          account_id: page.id,
          name: page.name,
          token_encrypted: tokenEncrypted,
          expires_at: expiresAt
        });
      }

      if (page.instagram_business_account?.id && connectionType !== 'facebook') {
        accounts.push({
          type: 'instagram',
          page_id: page.id,
          account_id: page.instagram_business_account.id,
          name: page.instagram_business_account.username ?? page.name,
          token_encrypted: tokenEncrypted,
          expires_at: expiresAt
        });
      }
    }

    if (accounts.length === 0) {
      error(400, 'Nenhuma conta encontrada para este tipo de conexão.');
    }

    // If only 1 account, save directly without selection step
    if (accounts.length === 1) {
      const acc = accounts[0];
      await locals.pb.collection('meta_connections').create({
        client: clientId,
        platform: acc.type,
        access_token: acc.token_encrypted,
        page_id: acc.page_id,
        account_id: acc.account_id,
        page_name: acc.name,
        expires_at: acc.expires_at
      });
      redirect(302, `/clients/${clientId}/settings?connected=true`);
    }

    // Multiple accounts: save session and redirect to selection
    const session = await locals.pb.collection('meta_oauth_sessions').create({
      client: clientId,
      connection_type: connectionType,
      accounts: JSON.stringify(accounts),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min
    });

    redirect(302, `/clients/${clientId}/settings?select=${session.id}`);
  } catch (e: any) {
    if (e?.status) throw e;
    error(500, `Erro ao conectar Meta: ${e.message}`);
  }
};
