/**
 * Test Database Helpers
 * 
 * Utilities for setting up and tearing down test database state.
 */

import { db } from '@/lib/db';
import { users, subscriptions, usageTracking } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Create a test user
 */
export async function createTestUser(overrides?: Partial<typeof users.$inferInsert>) {
  const [user] = await db.insert(users).values({
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    passwordHash: 'hashed-password',
    role: 'user',
    ...overrides,
  }).returning();

  return user;
}

/**
 * Create a test subscription
 */
export async function createTestSubscription(
  userId: string,
  overrides?: Partial<typeof subscriptions.$inferInsert>
) {
  const [subscription] = await db.insert(subscriptions).values({
    userId,
    plan: 'trial',
    status: 'active',
    ...overrides,
  }).returning();

  return subscription;
}

/**
 * Create test usage tracking
 */
export async function createTestUsageTracking(
  userId: string,
  feature: string,
  overrides?: Partial<typeof usageTracking.$inferInsert>
) {
  const [usage] = await db.insert(usageTracking).values({
    userId,
    feature,
    count: 0,
    limit: 100,
    resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ...overrides,
  }).returning();

  return usage;
}

/**
 * Clean up test user and related data
 */
export async function cleanupTestUser(userId: string) {
  await db.delete(usageTracking).where(eq(usageTracking.userId, userId));
  await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Reset database state for tests
 */
export async function resetTestDatabase() {
  // In a real scenario, you might truncate tables or use transactions
  // For now, this is a placeholder
}
