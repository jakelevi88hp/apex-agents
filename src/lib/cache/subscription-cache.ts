/**
 * Subscription Cache
 * 
 * In-memory cache for subscription data to reduce database queries.
 * Cache expires after 5 minutes or on subscription updates.
 */

import type { Subscription } from '@/lib/db/schema/subscriptions';

interface CacheEntry {
  data: Subscription | null;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Get cached subscription or null if expired/missing
 */
export function getCachedSubscription(userId: string): Subscription | null | undefined {
  const entry = cache.get(userId);
  if (!entry) return undefined;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(userId);
    return undefined;
  }
  
  return entry.data;
}

/**
 * Set subscription in cache
 */
export function setCachedSubscription(userId: string, subscription: Subscription | null): void {
  cache.set(userId, {
    data: subscription,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cache for a user
 */
export function invalidateSubscriptionCache(userId: string): void {
  cache.delete(userId);
}

/**
 * Clear all cache
 */
export function clearSubscriptionCache(): void {
  cache.clear();
}
