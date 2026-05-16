import { json, error } from '@sveltejs/kit';
import { decrypt } from '$lib/server/crypto';
import { getInsights } from '$lib/server/meta';
import type { RequestHandler } from './$types';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401);

  const clientId = url.searchParams.get('client_id');
  const platform = url.searchParams.get('platform') ?? 'instagram';
  const since = url.searchParams.get('since') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const until = url.searchParams.get('until') ?? new Date().toISOString().split('T')[0];

  if (!clientId) error(400, 'client_id required');

  // Check cache
  const cached = await locals.pb.collection('metrics_cache').getList(1, 1, {
    filter: locals.pb.filter('client = {:cid} && platform = {:p} && period_start = {:s} && period_end = {:u}', { cid: clientId, p: platform, s: since, u: until }),
    requestKey: null
  });

  if (cached.totalItems > 0) {
    const entry = cached.items[0];
    const age = Date.now() - new Date(entry.fetched_at).getTime();
    if (age < CACHE_TTL_MS) {
      return json(entry.data);
    }
  }

  // Fetch fresh data
  const connections = await locals.pb.collection('meta_connections').getList(1, 1, {
    filter: locals.pb.filter('client = {:cid} && platform = {:p}', { cid: clientId, p: platform })
  });

  if (connections.totalItems === 0) error(400, `No ${platform} connection for this client`);

  const connection = connections.items[0];
  const accessToken = decrypt(connection.access_token);

  try {
    const data = await getInsights(connection.account_id, accessToken, since, until);

    if (cached.totalItems > 0) {
      await locals.pb.collection('metrics_cache').update(cached.items[0].id, {
        data, fetched_at: new Date().toISOString()
      });
    } else {
      await locals.pb.collection('metrics_cache').create({
        client: clientId, platform, period_start: since, period_end: until,
        data, fetched_at: new Date().toISOString()
      });
    }

    return json(data);
  } catch (e: any) {
    error(500, `Failed to fetch metrics: ${e.message}`);
  }
};
