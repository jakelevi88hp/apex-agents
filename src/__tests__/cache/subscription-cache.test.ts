/**
 * Unit Tests for Subscription Cache
 * 
 * Tests caching behavior, TTL expiration, and cache invalidation.
 */

import {
  getCachedSubscription,
  setCachedSubscription,
  invalidateSubscriptionCache,
  clearSubscriptionCache,
} from '@/lib/cache/subscription-cache';
import type { Subscription } from '@/lib/db/schema/subscriptions';

const mockSubscription: Subscription = {
  id: 'sub-123',
  userId: 'user-123',
  plan: 'premium',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  trialStartedAt: null,
  trialEndsAt: null,
  stripeSubscriptionId: 'stripe-123',
  stripePriceId: 'price-123',
  stripeCustomerId: 'customer-123',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(),
  cancelAtPeriodEnd: false,
  canceledAt: null,
};

describe('Subscription Cache', () => {
  beforeEach(() => {
    clearSubscriptionCache();
  });

  describe('getCachedSubscription', () => {
    it('should return undefined for non-existent cache entry', () => {
      expect(getCachedSubscription('user-123')).toBeUndefined();
    });

    it('should return cached subscription', () => {
      setCachedSubscription('user-123', mockSubscription);
      const cached = getCachedSubscription('user-123');
      
      expect(cached).toEqual(mockSubscription);
    });

    it('should return null when null is cached', () => {
      setCachedSubscription('user-123', null);
      const cached = getCachedSubscription('user-123');
      
      expect(cached).toBeNull();
    });

    it('should return undefined for expired cache entry', () => {
      setCachedSubscription('user-123', mockSubscription);
      
      // Mock time to be 6 minutes later (past TTL)
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 6 * 60 * 1000);
      
      expect(getCachedSubscription('user-123')).toBeUndefined();
      
      Date.now = originalNow;
    });

    it('should return cached entry within TTL', () => {
      setCachedSubscription('user-123', mockSubscription);
      
      // Mock time to be 4 minutes later (within TTL)
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 4 * 60 * 1000);
      
      expect(getCachedSubscription('user-123')).toEqual(mockSubscription);
      
      Date.now = originalNow;
    });
  });

  describe('setCachedSubscription', () => {
    it('should cache subscription', () => {
      setCachedSubscription('user-123', mockSubscription);
      expect(getCachedSubscription('user-123')).toEqual(mockSubscription);
    });

    it('should cache null value', () => {
      setCachedSubscription('user-123', null);
      expect(getCachedSubscription('user-123')).toBeNull();
    });

    it('should overwrite existing cache entry', () => {
      setCachedSubscription('user-123', mockSubscription);
      const updated = { ...mockSubscription, plan: 'pro' as const };
      setCachedSubscription('user-123', updated);
      
      expect(getCachedSubscription('user-123')).toEqual(updated);
    });
  });

  describe('invalidateSubscriptionCache', () => {
    it('should remove cache entry for user', () => {
      setCachedSubscription('user-123', mockSubscription);
      invalidateSubscriptionCache('user-123');
      
      expect(getCachedSubscription('user-123')).toBeUndefined();
    });

    it('should not affect other users cache', () => {
      setCachedSubscription('user-123', mockSubscription);
      setCachedSubscription('user-456', mockSubscription);
      
      invalidateSubscriptionCache('user-123');
      
      expect(getCachedSubscription('user-123')).toBeUndefined();
      expect(getCachedSubscription('user-456')).toEqual(mockSubscription);
    });
  });

  describe('clearSubscriptionCache', () => {
    it('should clear all cache entries', () => {
      setCachedSubscription('user-123', mockSubscription);
      setCachedSubscription('user-456', mockSubscription);
      
      clearSubscriptionCache();
      
      expect(getCachedSubscription('user-123')).toBeUndefined();
      expect(getCachedSubscription('user-456')).toBeUndefined();
    });
  });
});
