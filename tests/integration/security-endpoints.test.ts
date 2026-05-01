/**
 * Security Endpoints Integration Tests
 * 
 * Tests for secured API endpoints with authentication and rate limiting
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { signToken } from '@/lib/auth';

describe('Security Endpoints Integration Tests', () => {
  let validToken: string;
  let adminToken: string;

  beforeEach(() => {
    // Create test tokens
    validToken = signToken({
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'user',
    });

    adminToken = signToken({
      userId: 'admin-user-123',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 for health check without auth', async () => {
      // Health check should be public
      const response = await fetch('http://localhost:3000/api/health');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    it('should include security headers', async () => {
      const response = await fetch('http://localhost:3000/api/health');

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.has('Strict-Transport-Security')).toBe(true);
    });

    it('should include rate limit headers', async () => {
      const response = await fetch('http://localhost:3000/api/health');

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
    });
  });

  describe('Database Health Check Endpoint', () => {
    it('should return 200 for database health check', async () => {
      const response = await fetch('http://localhost:3000/api/health/db');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.database).toBeDefined();
    });

    it('should return JSON response', async () => {
      const response = await fetch('http://localhost:3000/api/health/db');
      const contentType = response.headers.get('Content-Type');
      expect(contentType).toContain('application/json');
    });
  });

  describe('AI Admin Stream Endpoint', () => {
    it('should return 401 without authentication', async () => {
      const response = await fetch('http://localhost:3000/api/ai-admin/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: 'test-conv',
          message: 'test',
          userId: 'test-user',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await fetch('http://localhost:3000/api/ai-admin/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing conversationId, message, userId
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should accept valid request with authentication', async () => {
      const response = await fetch('http://localhost:3000/api/ai-admin/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: 'test-conv-123',
          message: 'Hello AI',
          userId: 'test-user-123',
          mode: 'chat',
        }),
      });

      // Should return 200 or stream response
      expect([200, 206]).toContain(response.status);
    });

    it('should return 403 if user ID does not match token', async () => {
      const response = await fetch('http://localhost:3000/api/ai-admin/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: 'test-conv-123',
          message: 'Hello AI',
          userId: 'different-user-id', // Doesn't match token
          mode: 'chat',
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Monitoring Endpoints', () => {
    it('should return 403 for metrics without admin auth', async () => {
      const response = await fetch('http://localhost:3000/api/monitoring/metrics', {
        headers: {
          'Authorization': `Bearer ${validToken}`, // Regular user token
        },
      });

      expect(response.status).toBe(403);
    });

    it('should return 200 for metrics with admin auth', async () => {
      const response = await fetch('http://localhost:3000/api/monitoring/metrics', {
        headers: {
          'Authorization': `Bearer ${adminToken}`, // Admin token
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('success');
    });

    it('should return 403 for security monitoring without admin auth', async () => {
      const response = await fetch('http://localhost:3000/api/monitoring/security', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after exceeding rate limit', async () => {
      const limit = 5;
      let rateLimited = false;

      for (let i = 0; i < limit + 5; i++) {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }

      expect(rateLimited).toBe(true);
    });

    it('should include Retry-After header on rate limit', async () => {
      // Make requests to trigger rate limit
      for (let i = 0; i < 1005; i++) {
        await fetch('http://localhost:3000/api/health');
      }

      const response = await fetch('http://localhost:3000/api/health');
      if (response.status === 429) {
        expect(response.headers.has('Retry-After')).toBe(true);
      }
    });
  });

  describe('Security Headers', () => {
    it('should include all required security headers', async () => {
      const response = await fetch('http://localhost:3000/api/health');

      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
      ];

      for (const header of requiredHeaders) {
        expect(response.headers.has(header)).toBe(true);
      }
    });

    it('should not expose server information', async () => {
      const response = await fetch('http://localhost:3000/api/health');

      expect(response.headers.get('X-Powered-By')).toBeFalsy();
      expect(response.headers.get('Server')).toBeFalsy();
    });
  });

  describe('CORS Handling', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.status).toBe(204);
    });
  });
});
