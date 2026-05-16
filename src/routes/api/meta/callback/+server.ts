import { redirect, error } from '@sveltejs/kit';
import { exchangeCodeForToken, getPages } from '$lib/server/meta';
import { encrypt } from '$lib/server/crypto';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401, 'Unauthorized');
  const code = url.searchParams.get('code');
  const rawState = url.searchParams.get('state') ?? '';
  // state format: "clientId:type" (type = facebook | instagram | both)
  const [clientId, connectionType = 'both'] = rawState.split(':');

  if (!code || !clientId) error(400, 'Parâmetros inválidos');

  try {
    const { access_token, expires_in } = await exchangeCodeForToken(code!);
    const pages = await getPages(access_token);

    for (const page of pages) {
      const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000).toISOString()
        : null;

      if (connectionType !== 'instagram') {
        await locals.pb.collection('meta_connections').create({
          client: clientId,
          platform: 'facebook',
          access_token: encrypt(page.access_token),
          page_id: page.id,
          account_id: page.id,
          page_name: page.name,
          expires_at: expiresAt
        });
      }

      if (page.instagram_business_account?.id && connectionType !== 'facebook') {
        await locals.pb.collection('meta_connections').create({
          client: clientId,
          platform: 'instagram',
          access_token: encrypt(page.access_token),
          page_id: page.id,
          account_id: page.instagram_business_account.id,
          page_name: page.instagram_business_account.username ?? page.name,
          expires_at: expiresAt
        });
      }
    }
  } catch (e: any) {
    error(500, `Erro ao conectar Meta: ${e.message}`);
  }

  redirect(302, `/clients/${clientId}/settings?connected=true`);
};
