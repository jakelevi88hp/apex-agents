import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/documents';

const connectionString = process.env.DATABASE_URL!;

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

export * from './schema/documents';

