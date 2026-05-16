import { redirect, error } from '@sveltejs/kit';
import { buildOAuthUrl } from '$lib/server/meta';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401, 'Unauthorized');
  const clientId = url.searchParams.get('client_id');
  if (!clientId) redirect(302, '/clients');
  redirect(302, buildOAuthUrl(clientId!));
};
