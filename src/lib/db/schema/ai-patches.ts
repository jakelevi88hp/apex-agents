/**
 * AI Admin Patches Schema
 * 
 * Stores generated patches for the AI Admin feature
 */

import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core';

export const aiPatches = pgTable('ai_patches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // Who generated the patch
  request: text('request').notNull(), // Original natural language request
  summary: text('summary').notNull(), // Patch summary
  description: text('description'), // Detailed description
  files: jsonb('files').notNull(), // Array of file changes
  testingSteps: jsonb('testing_steps'), // Array of testing steps
  risks: jsonb('risks'), // Array of potential risks
  status: text('status').notNull().default('pending'), // pending, applied, failed, rolled_back
  appliedAt: timestamp('applied_at'), // When the patch was applied
  rolledBackAt: timestamp('rolled_back_at'), // When the patch was rolled back
  error: text('error'), // Error message if application failed
  metadata: jsonb('metadata'), // Additional metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AIPatch = typeof aiPatches.$inferSelect;
export type InsertAIPatch = typeof aiPatches.$inferInsert;
