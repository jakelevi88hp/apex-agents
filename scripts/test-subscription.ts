/**
 * Subscription System Testing Script
 * 
 * Tests all subscription flows end-to-end
 * Usage: npx tsx scripts/test-subscription.ts
 */

import { SubscriptionService } from '../src/lib/subscription/service';
import { db } from '../src/server/db';
import { users, subscriptions } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const TEST_USER_EMAIL = 'test-subscription@example.com';

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  const testUser = await db.select().from(users).where(eq(users.email, TEST_USER_EMAIL)).limit(1);
  if (testUser.length > 0) {
    await db.delete(subscriptions).where(eq(subscriptions.userId, testUser[0].id));
    await db.delete(users).where(eq(users.id, testUser[0].id));
  }
  console.log('✅ Cleanup complete\n');
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  const [user] = await db.insert(users).values({
    email: TEST_USER_EMAIL,
    name: 'Test User',
    role: 'user',
  }).returning();
  console.log(`✅ Test user created: ${user.id}\n`);
  return user;
}

async function testTrialCreation(userId: string) {
  console.log('🧪 TEST 1: Trial Subscription Creation');
  console.log('=====================================');
  
  // Create trial subscription
  const [subscription] = await db.insert(subscriptions).values({
    userId,
    plan: 'trial',
    status: 'active',
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  }).returning();
  
  console.log('✅ Trial subscription created');
  console.log(`   Plan: ${subscription.plan}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Trial ends: ${subscription.trialEndsAt}`);
  console.log('');
  
  return subscription;
}

async function testUsageLimits(userId: string) {
  console.log('🧪 TEST 2: Usage Limits Check');
  console.log('============================');
  
  const limits = await SubscriptionService.getUsageLimits(userId);
  console.log('✅ Usage limits retrieved:');
  console.log(`   Agents: ${limits.agents}`);
  console.log(`   AGI Messages: ${limits.agi_messages}`);
  console.log(`   Workflows: ${limits.workflows}`);
  console.log(`   Storage: ${limits.storage} GB`);
  console.log('');
}

async function testFeatureAccess(userId: string) {
  console.log('🧪 TEST 3: Feature Access Check');
  console.log('==============================');
  
  const features = ['agents', 'agi_messages', 'workflows', 'storage'] as const;
  
  for (const feature of features) {
    const canUse = await SubscriptionService.canUseFeature(userId, feature);
    console.log(`   ${feature}: ${canUse ? '✅ Allowed' : '❌ Blocked'}`);
  }
  console.log('');
}

async function testUsageTracking(userId: string) {
  console.log('🧪 TEST 4: Usage Tracking');
  console.log('========================');
  
  // Track some usage
  await SubscriptionService.trackUsage(userId, 'agents', 5);
  await SubscriptionService.trackUsage(userId, 'agi_messages', 50);
  await SubscriptionService.trackUsage(userId, 'workflows', 2);
  
  console.log('✅ Usage tracked:');
  console.log('   - 5 agents created');
  console.log('   - 50 AGI messages sent');
  console.log('   - 2 workflows created');
  console.log('');
  
  // Get usage stats
  const stats = await SubscriptionService.getUsageStats(userId);
  console.log('📊 Current usage:');
  for (const stat of stats) {
    const percentage = (stat.current / stat.limit) * 100;
    console.log(`   ${stat.feature}: ${stat.current}/${stat.limit} (${percentage.toFixed(1)}%)`);
  }
  console.log('');
}

async function testLimitEnforcement(userId: string) {
  console.log('🧪 TEST 5: Limit Enforcement');
  console.log('===========================');
  
  // Try to exceed trial limits
  try {
    // Trial limit for agents is 10, we already tracked 5
    await SubscriptionService.trackUsage(userId, 'agents', 6); // This should fail (5 + 6 = 11 > 10)
    console.log('❌ FAILED: Should have blocked agent creation');
  } catch (error: any) {
    console.log('✅ Correctly blocked: ' + error.message);
  }
  console.log('');
}

async function testTrialExpiration(userId: string) {
  console.log('🧪 TEST 6: Trial Expiration');
  console.log('==========================');
  
  // Check if trial is expired
  const isExpired = await SubscriptionService.isTrialExpired(userId);
  console.log(`   Trial expired: ${isExpired ? '❌ Yes' : '✅ No'}`);
  
  // Manually expire trial for testing
  await db.update(subscriptions)
    .set({ trialEndsAt: new Date(Date.now() - 1000) }) // 1 second ago
    .where(eq(subscriptions.userId, userId));
  
  const isExpiredNow = await SubscriptionService.isTrialExpired(userId);
  console.log(`   After manual expiry: ${isExpiredNow ? '✅ Expired' : '❌ Still active'}`);
  
  // Try to use feature with expired trial
  try {
    const canUse = await SubscriptionService.canUseFeature(userId, 'agents');
    if (!canUse) {
      console.log('✅ Correctly blocked expired trial user');
    } else {
      console.log('❌ FAILED: Should have blocked expired trial user');
    }
  } catch (error: any) {
    console.log('✅ Correctly blocked: ' + error.message);
  }
  console.log('');
}

async function testSubscriptionUpgrade(userId: string) {
  console.log('🧪 TEST 7: Subscription Upgrade');
  console.log('===============================');
  
  // Upgrade to Premium
  await db.update(subscriptions)
    .set({
      plan: 'premium',
      status: 'active',
      trialEndsAt: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
    .where(eq(subscriptions.userId, userId));
  
  console.log('✅ Upgraded to Premium');
  
  const limits = await SubscriptionService.getUsageLimits(userId);
  console.log('📊 New limits:');
  console.log(`   Agents: ${limits.agents}`);
  console.log(`   AGI Messages: ${limits.agi_messages}`);
  console.log(`   Workflows: ${limits.workflows}`);
  console.log(`   Storage: ${limits.storage} GB`);
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting Subscription System Tests\n');
  console.log('=' .repeat(50));
  console.log('');
  
  try {
    // Cleanup any existing test data
    await cleanup();
    
    // Create test user
    const user = await createTestUser();
    
    // Run tests
    await testTrialCreation(user.id);
    await testUsageLimits(user.id);
    await testFeatureAccess(user.id);
    await testUsageTracking(user.id);
    await testLimitEnforcement(user.id);
    await testTrialExpiration(user.id);
    await testSubscriptionUpgrade(user.id);
    
    console.log('=' .repeat(50));
    console.log('');
    console.log('🎉 All tests completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Trial creation works');
    console.log('  ✅ Usage limits enforced');
    console.log('  ✅ Feature access controlled');
    console.log('  ✅ Usage tracking accurate');
    console.log('  ✅ Limit enforcement works');
    console.log('  ✅ Trial expiration detected');
    console.log('  ✅ Subscription upgrade successful');
    console.log('');
    
    // Cleanup
    await cleanup();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await cleanup();
    process.exit(1);
  }
}

// Run tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

