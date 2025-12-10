/**
 * Database Query Optimization Utilities
 * 
 * Provides optimized query patterns and batch operations.
 */

import { db } from '@/lib/db';
import { eq, and, inArray } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

/**
 * Batch fetch multiple users by IDs (prevents N+1 queries)
 */
export async function batchFetchUsers(userIds: string[]) {
  if (userIds.length === 0) return [];
  
  const { users } = await import('@/lib/db/schema');
  return await db.select().from(users).where(inArray(users.id, userIds));
}

/**
 * Batch fetch subscriptions for multiple users
 */
export async function batchFetchSubscriptions(userIds: string[]) {
  if (userIds.length === 0) return [];
  
  const { subscriptions } = await import('@/lib/db/schema/subscriptions');
  return await db.select().from(subscriptions).where(inArray(subscriptions.userId, userIds));
}

/**
 * Optimized query with select only needed fields
 */
export async function selectFields<T>(
  table: any,
  fields: (keyof T)[],
  where?: SQL
) {
  // This is a placeholder - actual implementation depends on Drizzle API
  // The idea is to select only needed columns instead of SELECT *
  return db.select().from(table).where(where);
}
