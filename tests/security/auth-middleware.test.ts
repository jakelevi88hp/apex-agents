/**
 * Authentication Middleware Tests
 * 
 * Tests for JWT verification, token extraction, and auth middleware
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { 
  extractToken, 
  verifyRequestToken, 
  requireAuth, 
  requireAdmin,
  isAuthenticated,
  getUserId 
} from '@/lib/middleware/auth-middleware';
import { signToken, verifyToken } from '@/lib/auth';

describe('Authentication Middleware', () => {
  describe('extractToken', () => {
    it('should extract token from Authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer test-token-123',
        },
      });

      const token = extractToken(request);
      expect(token).toBe('test-token-123');
    });

    it('should return null if Authorization header is missing', () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const token = extractToken(request);
      expect(token).toBeNull();
    });

    it('should return null if Authorization header does not start with Bearer', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Basic test-token-123',
        },
      });

      const token = extractToken(request);
      expect(token).toBeNull();
    });
  });

  describe('verifyRequestToken', () => {
    it('should verify valid JWT token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com', role: 'user' };
      const token = signToken(payload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = verifyRequestToken(request);
      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for invalid token', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      const result = verifyRequestToken(request);
      expect(result).toBeNull();
    });

    it('should return null if no Authorization header', () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const result = verifyRequestToken(request);
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated request', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = signToken(payload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(isAuthenticated(request)).toBe(true);
    });

    it('should return false for unauthenticated request', () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      expect(isAuthenticated(request)).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should extract userId from valid token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = signToken(payload);

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(getUserId(request)).toBe('user-123');
    });

    it('should return null if no valid token', () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      expect(getUserId(request)).toBeNull();
    });
  });
});
