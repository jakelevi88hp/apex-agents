import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Lazy database connection - only initialize when actually used
let _db: ReturnType<typeof drizzle> | null = null;

function initDb() {
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

// Export lazy-initialized database instance
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const instance = initDb();
    return (instance as any)[prop];
  }
});

// Helper function to get database instance
export async function getDb() {
  return initDb();
}

// Export all schema
export * from './schema';

