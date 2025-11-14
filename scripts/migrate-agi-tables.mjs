#!/usr/bin/env node
/**
 * AGI Tables Migration Script
 * Runs the AGI memory tables migration on the production database
 */

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get DATABASE_URL from environment or Vercel
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL to your Neon database connection string');
  process.exit(1);
}

console.log('🚀 Starting AGI Tables Migration...\n');

// Read the migration SQL file
const migrationPath = path.join(__dirname, '..', 'agi-tables-migration.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

// Split into individual statements (removing comments and empty lines)
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

// Connect to database
const sql = postgres(DATABASE_URL, { max: 1 });

try {
  console.log('🔌 Connected to database\n');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
    
    try {
      await sql.unsafe(statement);
      
      // Check if it's a CREATE TABLE statement
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?"?(\w+)"?/)?.[1];
        console.log(`✅ [${i + 1}/${statements.length}] Created table: ${tableName}`);
        successCount++;
      } else if (statement.includes('ALTER TABLE')) {
        const match = statement.match(/ALTER TABLE "?(\w+)"? ADD CONSTRAINT/);
        if (match) {
          console.log(`✅ [${i + 1}/${statements.length}] Added constraint to: ${match[1]}`);
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] Altered table`);
        }
        successCount++;
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?"?(\w+)"?/)?.[1];
        console.log(`✅ [${i + 1}/${statements.length}] Created index: ${indexName}`);
        successCount++;
      } else {
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      }
    } catch (error) {
      // Check if it's a "already exists" error (which we can ignore)
      if (error.message.includes('already exists')) {
        const match = error.message.match(/relation "(\w+)" already exists/);
        if (match) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${match[1]}`);
        } else {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists)`);
        }
        skipCount++;
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
        console.error(`   Statement: ${preview}...`);
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⏭️  Skipped:    ${skipCount}`);
  console.log(`❌ Errors:     ${errorCount}`);
  console.log('='.repeat(60));
  
  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nAGI tables are now available in production:');
    console.log('  - agi_consciousness_state');
    console.log('  - agi_conversations');
    console.log('  - agi_emotional_memory');
    console.log('  - agi_episodic_memory');
    console.log('  - agi_messages');
    console.log('  - agi_procedural_memory');
    console.log('  - agi_semantic_memory');
    console.log('  - agi_working_memory');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review the output above.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Fatal error during migration:');
  console.error(error);
  process.exit(1);
} finally {
  await sql.end();
  console.log('\n🔌 Database connection closed');
}
