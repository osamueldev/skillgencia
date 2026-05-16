import { describe, it, expect, vi } from 'vitest';
import { buildOAuthUrl, exchangeCodeForToken } from '../../src/lib/server/meta';

process.env.META_APP_ID = 'test_app_id';
process.env.META_APP_SECRET = 'test_app_secret';
process.env.META_REDIRECT_URI = 'http://localhost:5173/api/meta/callback';

describe('meta OAuth', () => {
  it('builds OAuth URL with required params', () => {
    const url = buildOAuthUrl('client-123');
    expect(url).toContain('https://www.facebook.com/dialog/oauth');
    expect(url).toContain('client_id=test_app_id');
    expect(url).toContain('redirect_uri=');
    expect(url).toContain('state=client-123');
    expect(url).toContain('pages_manage_posts');
  });

  it('exchangeCodeForToken calls Meta token endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'test_token',
        token_type: 'bearer',
        expires_in: 5183944
      })
    }) as any;

    const result = await exchangeCodeForToken('test_code');
    expect(result.access_token).toBe('test_token');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('oauth/access_token'),
      expect.any(Object)
    );
  });
});
