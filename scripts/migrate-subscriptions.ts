/**
 * Database Migration Script for Subscription System
 * 
 * Run this script to create subscription and usage_tracking tables
 * Usage: npx tsx scripts/migrate-subscriptions.ts
 */

import { db } from '@/server/db';
import { sql } from 'drizzle-orm';

async function migrateSubscriptions() {
  console.log('🚀 Starting subscription tables migration...\n');

  try {
    // Create subscriptions table
    console.log('Creating subscriptions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL,
        plan TEXT NOT NULL DEFAULT 'trial',
        status TEXT NOT NULL DEFAULT 'active',
        trial_started_at TIMESTAMP DEFAULT NOW(),
        trial_ends_at TIMESTAMP,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_price_id TEXT,
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        canceled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Subscriptions table created\n');

    // Create usage_tracking table
    console.log('Creating usage_tracking table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL,
        feature TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        "limit" INTEGER NOT NULL,
        reset_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Usage tracking table created\n');

    // Create indexes for performance
    console.log('Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature)
    `);
    console.log('✅ Indexes created\n');

    // Initialize trial subscriptions for existing users
    console.log('Initializing trial subscriptions for existing users...');
    await db.execute(sql`
      INSERT INTO subscriptions (id, user_id, plan, status, trial_started_at, trial_ends_at)
      SELECT 
        gen_random_uuid()::text,
        id,
        'trial',
        'active',
        NOW(),
        NOW() + INTERVAL '3 days'
      FROM users
      WHERE id NOT IN (SELECT user_id FROM subscriptions)
    `);
    console.log('✅ Trial subscriptions initialized\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Add Stripe API keys to environment variables');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Test subscription flows\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateSubscriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

