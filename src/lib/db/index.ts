import 'server-only';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy database connection - only initialize when actually used
let _db: NeonHttpDatabase<typeof schema> | null = null;

function initDb(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create HTTP client (no WebSocket dependency!)
  const sql = neon(process.env.DATABASE_URL);

  // Create Drizzle instance with schema
  _db = drizzle(sql, { schema });
  return _db;
}

// Export lazy-initialized database instance with proper typing
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = initDb();
    // Type-safe proxy access
    return (instance as Record<string | symbol, unknown>)[prop];
  }
}) as NeonHttpDatabase<typeof schema>;

// Helper function to get database instance
export function getDb(): NeonHttpDatabase<typeof schema> {
  return initDb();
}

// Export all schema
export * from './schema';

