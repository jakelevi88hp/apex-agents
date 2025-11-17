/**
 * Test Authentication Helpers
 * 
 * Utilities for creating test tokens and authenticated requests.
 */

import { signToken } from '@/lib/auth/jwt';
import type { JWTPayload } from '@/lib/auth/jwt';

/**
 * Create a test JWT token
 */
export function createTestToken(payload: Partial<JWTPayload> = {}): string {
  const defaultPayload: JWTPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user',
    ...payload,
  };

  return signToken(defaultPayload);
}

/**
 * Create test headers with authentication
 */
export function createAuthHeaders(token?: string): Record<string, string> {
  const testToken = token || createTestToken();
  return {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create test admin token
 */
export function createAdminToken(): string {
  return createTestToken({ role: 'admin' });
}

/**
 * Create test owner token
 */
export function createOwnerToken(): string {
  return createTestToken({ role: 'owner' });
}
