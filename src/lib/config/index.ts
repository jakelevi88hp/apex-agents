/**
 * Centralized Configuration Management
 * 
 * Type-safe environment variable access with validation
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variable schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  
  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().optional(),
  
  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Resend (Email)
  RESEND_API_KEY: z.string().optional(),
  
  // GitHub (for AI Admin)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
  
  // Admin
  ADMIN_UPGRADE_SECRET: z.string().default('apex-admin-secret-2025'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Production URL (for testing)
  PRODUCTION_URL: z.string().url().optional(),
  TEST_TOKEN: z.string().optional(),
});

/**
 * Create validated environment
 */
export const env = createEnv({
  server: envSchema.shape,
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_REPO_OWNER: process.env.GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    ADMIN_UPGRADE_SECRET: process.env.ADMIN_UPGRADE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PRODUCTION_URL: process.env.PRODUCTION_URL,
    TEST_TOKEN: process.env.TEST_TOKEN,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});

/**
 * Configuration object with defaults and computed values
 */
export const config = {
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Auth
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: '7d',
  },
  
  // OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  
  // Stripe
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    premiumPriceId: env.STRIPE_PREMIUM_PRICE_ID,
    proPriceId: env.STRIPE_PRO_PRICE_ID,
  },
  
  // Pinecone
  pinecone: {
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
    indexName: env.PINECONE_INDEX_NAME,
  },
  
  // Sentry
  sentry: {
    dsn: env.SENTRY_DSN,
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
  },
  
  // Email
  email: {
    resendApiKey: env.RESEND_API_KEY,
  },
  
  // GitHub
  github: {
    token: env.GITHUB_TOKEN,
    repoOwner: env.GITHUB_REPO_OWNER,
    repoName: env.GITHUB_REPO_NAME,
  },
  
  // Admin
  admin: {
    upgradeSecret: env.ADMIN_UPGRADE_SECRET,
  },
  
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Testing
  productionUrl: env.PRODUCTION_URL,
  testToken: env.TEST_TOKEN,
} as const;
