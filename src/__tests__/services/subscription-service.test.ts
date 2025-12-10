/**
 * Integration Tests for Subscription Service
 * 
 * Tests subscription management, caching, and usage tracking.
 * Note: These tests require a test database connection.
 */

import { SubscriptionService } from '@/lib/subscription/service';
import { db } from '@/lib/db';
import { subscriptions, usageTracking, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { clearSubscriptionCache } from '@/lib/cache/subscription-cache';

// Mock database functions for unit testing
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/lib/cache/subscription-cache', () => ({
  getCachedSubscription: jest.fn(),
  setCachedSubscription: jest.fn(),
  invalidateSubscriptionCache: jest.fn(),
  clearSubscriptionCache: jest.fn(),
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearSubscriptionCache();
  });

  describe('getNextResetDate', () => {
    it('should return first day of next month', () => {
      const date = SubscriptionService.getNextResetDate();
      const now = new Date();
      const expected = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      expect(date.getDate()).toBe(1);
      expect(date.getMonth()).toBe(expected.getMonth());
      expect(date.getFullYear()).toBe(expected.getFullYear());
    });
  });

  describe('getUserSubscription', () => {
    it('should return cached subscription if available', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        plan: 'premium',
        status: 'active',
      };
      
      getCachedSubscription.mockReturnValue(mockSubscription);
      
      const result = await SubscriptionService.getUserSubscription('user-123');
      
      expect(result).toEqual(mockSubscription);
      expect(db.select).not.toHaveBeenCalled();
    });

    it('should fetch from database if not cached', async () => {
      const { getCachedSubscription, setCachedSubscription } = require('@/lib/cache/subscription-cache');
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        plan: 'premium',
      };
      
      getCachedSubscription.mockReturnValue(undefined);
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockSubscription]),
          }),
        }),
      });
      
      const result = await SubscriptionService.getUserSubscription('user-123');
      
      expect(result).toEqual(mockSubscription);
      expect(setCachedSubscription).toHaveBeenCalledWith('user-123', mockSubscription);
    });
  });

  describe('isTrialExpired', () => {
    it('should return false for non-trial plan', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      getCachedSubscription.mockReturnValue({
        plan: 'premium',
        trialEndsAt: null,
      });
      
      const result = await SubscriptionService.isTrialExpired('user-123');
      expect(result).toBe(false);
    });

    it('should return false for active trial', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      getCachedSubscription.mockReturnValue({
        plan: 'trial',
        trialEndsAt: futureDate,
      });
      
      const result = await SubscriptionService.isTrialExpired('user-123');
      expect(result).toBe(false);
    });

    it('should return true for expired trial', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      getCachedSubscription.mockReturnValue({
        plan: 'trial',
        trialEndsAt: pastDate,
      });
      
      const result = await SubscriptionService.isTrialExpired('user-123');
      expect(result).toBe(true);
    });
  });

  describe('canUseFeature', () => {
    it('should return true when usage is below limit', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      getCachedSubscription.mockReturnValue({ plan: 'premium' });
      
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              count: 5,
              limit: 10,
            }]),
          }),
        }),
      });
      
      const result = await SubscriptionService.canUseFeature('user-123', 'agents');
      expect(result).toBe(true);
    });

    it('should return false when usage exceeds limit', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      getCachedSubscription.mockReturnValue({ plan: 'premium' });
      
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              count: 10,
              limit: 10,
            }]),
          }),
        }),
      });
      
      const result = await SubscriptionService.canUseFeature('user-123', 'agents');
      expect(result).toBe(false);
    });

    it('should return details when includeDetails is true', async () => {
      const { getCachedSubscription } = require('@/lib/cache/subscription-cache');
      getCachedSubscription.mockReturnValue({ plan: 'premium' });
      
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{
              count: 5,
              limit: 10,
            }]),
          }),
        }),
      });
      
      const result = await SubscriptionService.canUseFeature('user-123', 'agents', true);
      
      expect(result).toEqual({
        allowed: true,
        current: 5,
        limit: 10,
      });
    });
  });
});
