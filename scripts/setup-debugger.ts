#!/usr/bin/env tsx
/**
 * Debugger Setup Script
 * 
 * Initializes the debugger system and runs tests
 */

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDebugger() {
  console.log('🔧 Setting up Application Debugger...\n');

  try {
    // Step 1: Run migration
    console.log('📋 Step 1: Creating database tables...');
    const migrationSQL = readFileSync(
      join(__dirname, '../migrations/003_add_debugger_tables.sql'),
      'utf-8'
    );

    await db.execute(sql.raw(migrationSQL));
    console.log('✅ Database tables created\n');

    // Step 2: Verify tables
    console.log('📋 Step 2: Verifying tables...');
    const tables = [
      'debugger_error_logs',
      'debugger_alerts',
      'debugger_health_checks',
      'debugger_performance_metrics',
      'debugger_auto_fixes',
    ];

    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        )
      `);
      
      if (result.rows[0]?.exists) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - NOT FOUND`);
        throw new Error(`Table ${table} not created`);
      }
    }
    console.log('✅ All tables verified\n');

    // Step 3: Test health checks
    console.log('📋 Step 3: Running health checks...');
    
    const healthChecks = [
      {
        name: 'Database',
        test: async () => {
          await db.execute(sql`SELECT 1`);
          return true;
        },
      },
      {
        name: 'Error Logging',
        test: async () => {
          const testId = crypto.randomUUID();
          await db.execute(sql`
            INSERT INTO debugger_error_logs (
              id, level, category, message, resolved
            ) VALUES (
              ${testId}, 'info', 'test', 'Setup test error', true
            )
          `);
          
          const result = await db.execute(sql`
            SELECT * FROM debugger_error_logs WHERE id = ${testId}
          `);
          
          // Clean up
          await db.execute(sql`
            DELETE FROM debugger_error_logs WHERE id = ${testId}
          `);
          
          return result.rows.length === 1;
        },
      },
      {
        name: 'AGI Tables',
        test: async () => {
          const result = await db.execute(sql`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_name IN (
              'agi_working_memory',
              'agi_episodic_memory',
              'agi_conversations',
              'agi_semantic_memory',
              'agi_procedural_memory'
            )
          `);
          return Number(result.rows[0]?.count) === 5;
        },
      },
    ];

    for (const check of healthChecks) {
      try {
        const passed = await check.test();
        if (passed) {
          console.log(`  ✅ ${check.name}`);
        } else {
          console.log(`  ❌ ${check.name} - FAILED`);
        }
      } catch (error) {
        console.log(`  ❌ ${check.name} - ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    console.log('✅ Health checks complete\n');

    // Step 4: Setup complete
    console.log('🎉 Debugger setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Start the application: npm run dev');
    console.log('  2. Access the debugger dashboard: http://localhost:3000/admin/debugger');
    console.log('  3. Test the health endpoint: curl http://localhost:3000/api/debugger?action=health');
    console.log('');
    console.log('Documentation: /workspace/docs/DEBUGGER-GUIDE.md');
    console.log('');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDebugger()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
