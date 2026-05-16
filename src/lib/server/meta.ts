import { META_APP_ID, META_APP_SECRET, META_REDIRECT_URI } from '$env/static/private';

const GRAPH_BASE = 'https://graph.facebook.com/v19.0';
const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish'
].join(',');

export function buildOAuthUrl(clientId: string): string {
  const redirectUri = encodeURIComponent(META_REDIRECT_URI);
  const state = encodeURIComponent(clientId);
  return `https://www.facebook.com/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(SCOPES)}&state=${state}&response_type=code`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in?: number;
}> {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    redirect_uri: META_REDIRECT_URI,
    code
  });
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token`, {
    method: 'POST',
    body: params
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? 'Meta token exchange failed');
  }
  return res.json();
}

export async function getPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}>> {
  const res = await fetch(
    `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error('Failed to fetch pages');
  const data = await res.json();
  return data.data ?? [];
}

export async function publishPhoto(
  igAccountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<string> {
  const containerRes = await fetch(`${GRAPH_BASE}/${igAccountId}/media`, {
    method: 'POST',
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: accessToken })
  });
  if (!containerRes.ok) throw new Error('Failed to create media container');
  const { id: creationId } = await containerRes.json();

  const publishRes = await fetch(`${GRAPH_BASE}/${igAccountId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({ creation_id: creationId, access_token: accessToken })
  });
  if (!publishRes.ok) throw new Error('Failed to publish media');
  const { id } = await publishRes.json();
  return id;
}

export async function getInsights(
  accountId: string,
  accessToken: string,
  since: string,
  until: string
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    metric: 'reach,impressions,profile_views,follower_count',
    period: 'day',
    since,
    until,
    access_token: accessToken
  });
  const res = await fetch(`${GRAPH_BASE}/${accountId}/insights?${params}`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}
