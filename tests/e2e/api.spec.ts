import { test, expect, apiLogin, hasTestUser, NO_TEST_USER_REASON } from '../fixtures/auth';

test.describe('API Health', () => {
  test('should report healthy from /api/health', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    expect((await response.json()).status).toBe('healthy');
  });

  test('should return UNAUTHORIZED for protected routes', async ({ request }) => {
    // auth.me is a tRPC query, so it is a GET; no token -> 401 UNAUTHORIZED
    const response = await request.get('/api/trpc/auth.me');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.json.data.code).toBe('UNAUTHORIZED');
  });

  test('should reject wrong credentials with 401, not a server error', async ({ request }) => {
    const response = await request.post('/api/trpc/auth.login', {
      data: { json: { email: 'nobody@apex-ai-agent.test', password: 'wrong-password' } },
    });
    expect(response.status()).toBe(401);
    expect((await response.json()).error.json.data.code).toBe('UNAUTHORIZED');
  });

  test('should return the current user for a valid token', async ({ request }) => {
    test.skip(!hasTestUser, NO_TEST_USER_REASON);
    const token = await apiLogin(request);
    const response = await request.get('/api/trpc/auth.me', { headers: { authorization: `Bearer ${token}` } });
    expect(response.status()).toBe(200);
    const me = (await response.json()).result.data.json;
    expect(me.email).toBe(process.env.TEST_USER_EMAIL!.toLowerCase());
    expect(me.role).toBe('user');
  });
});
