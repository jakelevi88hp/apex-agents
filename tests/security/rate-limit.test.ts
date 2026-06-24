/**
 * Rate Limiting Tests
 * 
 * Tests for rate limiting middleware and algorithms
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  checkRateLimit, 
  getRemainingRequests, 
  getResetTime,
  RATE_LIMITS 
} from '@/lib/middleware/rate-limit';

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const key = 'test-user-1';
      const config = { limit: 5, window: 60 * 1000 };

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(key, config);
        expect(result).toBe(true);
      }
    });

    it('should reject requests exceeding limit', () => {
      const key = 'test-user-2';
      const config = { limit: 3, window: 60 * 1000 };

      // Allow first 3 requests
      for (let i = 0; i < 3; i++) {
        expect(checkRateLimit(key, config)).toBe(true);
      }

      // Reject 4th request
      expect(checkRateLimit(key, config)).toBe(false);
    });

    it('should reset count after window expires', (done) => {
      const key = 'test-user-3';
      const config = { limit: 2, window: 100 }; // 100ms window

      // Use up limit
      checkRateLimit(key, config);
      checkRateLimit(key, config);
      expect(checkRateLimit(key, config)).toBe(false);

      // Wait for window to expire
      setTimeout(() => {
        expect(checkRateLimit(key, config)).toBe(true);
        done();
      }, 150);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', () => {
      const key = 'test-user-4';
      const config = { limit: 5, window: 60 * 1000 };

      checkRateLimit(key, config);
      checkRateLimit(key, config);

      expect(getRemainingRequests(key, config)).toBe(3);
    });

    it('should return full limit if no requests made', () => {
      const key = 'test-user-5';
      const config = { limit: 10, window: 60 * 1000 };

      expect(getRemainingRequests(key, config)).toBe(10);
    });

    it('should return 0 if limit exceeded', () => {
      const key = 'test-user-6';
      const config = { limit: 2, window: 60 * 1000 };

      checkRateLimit(key, config);
      checkRateLimit(key, config);
      checkRateLimit(key, config); // This will fail

      expect(getRemainingRequests(key, config)).toBe(0);
    });
  });

  describe('Predefined Rate Limits', () => {
    it('should have auth rate limit', () => {
      expect(RATE_LIMITS.auth).toBeDefined();
      expect(RATE_LIMITS.auth.limit).toBe(5);
      expect(RATE_LIMITS.auth.window).toBe(15 * 60 * 1000);
    });

    it('should have api rate limit', () => {
      expect(RATE_LIMITS.api).toBeDefined();
      expect(RATE_LIMITS.api.limit).toBe(100);
      expect(RATE_LIMITS.api.window).toBe(60 * 1000);
    });

    it('should have public rate limit', () => {
      expect(RATE_LIMITS.public).toBeDefined();
      expect(RATE_LIMITS.public.limit).toBe(1000);
      expect(RATE_LIMITS.public.window).toBe(60 * 1000);
    });

    it('should have webhook rate limit', () => {
      expect(RATE_LIMITS.webhook).toBeDefined();
      expect(RATE_LIMITS.webhook.limit).toBe(50);
      expect(RATE_LIMITS.webhook.window).toBe(60 * 1000);
    });
  });

  describe('Multiple Users', () => {
    it('should track rate limits per user independently', () => {
      const config = { limit: 2, window: 60 * 1000 };

      // User 1
      checkRateLimit('user-1', config);
      checkRateLimit('user-1', config);

      // User 2
      checkRateLimit('user-2', config);

      // User 1 should be limited
      expect(checkRateLimit('user-1', config)).toBe(false);

      // User 2 should not be limited
      expect(checkRateLimit('user-2', config)).toBe(true);
    });
  });
});
