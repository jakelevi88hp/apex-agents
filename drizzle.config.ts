import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {}),
};

export default config;

