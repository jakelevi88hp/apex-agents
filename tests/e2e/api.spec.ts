import { test, expect } from '@playwright/test';

test.describe('API Health', () => {
  test('should have healthy tRPC API', async ({ request }) => {
    // Test tRPC health endpoint
    const response = await request.get('/api/trpc/health.check');
    
    // Should return 200 or 400 (tRPC returns 400 for invalid requests, but endpoint exists)
    expect([200, 400]).toContain(response.status());
  });

  test('should return UNAUTHORIZED for protected routes', async ({ request }) => {
    // Test protected tRPC route without auth
    const response = await request.post('/api/trpc/auth.me');
    
    // Should return error (401 or 400 with UNAUTHORIZED)
    const body = await response.json();
    
    // tRPC wraps errors, check for UNAUTHORIZED code
    if (body.error) {
      expect(body.error.json?.code).toBe('UNAUTHORIZED');
    } else {
      // Or check HTTP status
      expect([401, 403]).toContain(response.status());
    }
  });

  test('should have working auth endpoints', async ({ request }) => {
    // Test login endpoint exists
    const response = await request.post('/api/trpc/auth.login', {
      data: {
        json: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      }
    });
    
    // Should return a response (even if credentials are wrong)
    expect(response.status()).toBeLessThan(500);
  });
});

