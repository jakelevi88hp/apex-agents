/**
 * Unit Tests for JWT Utilities
 * 
 * Tests JWT token parsing, admin checks, and user ID extraction.
 */

import {
  parseJWTPayload,
  getTokenPayload,
  isAdmin,
  getUserId,
} from '@/lib/utils/jwt';

// Mock JWT token structure: header.payload.signature
const createMockToken = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const signature = 'mock-signature';
  return `${header}.${encodedPayload}.${signature}`;
};

describe('JWT Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('parseJWTPayload', () => {
    it('should parse valid JWT token', () => {
      const payload = { userId: 'user-123', role: 'user' };
      const token = createMockToken(payload);
      const result = parseJWTPayload(token);
      
      expect(result).toEqual(payload);
    });

    it('should return null for invalid token format', () => {
      expect(parseJWTPayload('invalid-token')).toBeNull();
      expect(parseJWTPayload('header.payload')).toBeNull();
      expect(parseJWTPayload('header')).toBeNull();
    });

    it('should return null for invalid base64 payload', () => {
      expect(parseJWTPayload('header.invalid-base64.signature')).toBeNull();
    });

    it('should handle malformed JSON in payload', () => {
      const invalidPayload = btoa('invalid-json')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const token = `header.${invalidPayload}.signature`;
      
      expect(parseJWTPayload(token)).toBeNull();
    });
  });

  describe('getTokenPayload', () => {
    it('should return null when no token in localStorage', () => {
      expect(getTokenPayload()).toBeNull();
    });

    it('should return null in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      delete global.window;
      
      expect(getTokenPayload()).toBeNull();
      
      global.window = originalWindow;
    });

    it('should parse token from localStorage', () => {
      const payload = { userId: 'user-123', role: 'user' };
      const token = createMockToken(payload);
      localStorage.setItem('token', token);
      
      expect(getTokenPayload()).toEqual(payload);
    });

    it('should return null for invalid token', () => {
      localStorage.setItem('token', 'invalid-token');
      expect(getTokenPayload()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const token = createMockToken({ userId: 'user-123', role: 'admin' });
      localStorage.setItem('token', token);
      
      expect(isAdmin()).toBe(true);
    });

    it('should return true for owner role', () => {
      const token = createMockToken({ userId: 'user-123', role: 'owner' });
      localStorage.setItem('token', token);
      
      expect(isAdmin()).toBe(true);
    });

    it('should return false for user role', () => {
      const token = createMockToken({ userId: 'user-123', role: 'user' });
      localStorage.setItem('token', token);
      
      expect(isAdmin()).toBe(false);
    });

    it('should return false when no token', () => {
      expect(isAdmin()).toBe(false);
    });

    it('should return false when role is missing', () => {
      const token = createMockToken({ userId: 'user-123' });
      localStorage.setItem('token', token);
      
      expect(isAdmin()).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should extract user ID from token', () => {
      const token = createMockToken({ userId: 'user-123', role: 'user' });
      localStorage.setItem('token', token);
      
      expect(getUserId()).toBe('user-123');
    });

    it('should return null when no token', () => {
      expect(getUserId()).toBeNull();
    });

    it('should return null when userId is missing', () => {
      const token = createMockToken({ role: 'user' });
      localStorage.setItem('token', token);
      
      expect(getUserId()).toBeNull();
    });
  });
});
