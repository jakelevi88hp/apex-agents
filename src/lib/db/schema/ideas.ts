/**
 * Idea Generation Schema
 *
 * Defines database tables for storing autonomous idea generation runs
 * and the individual idea suggestions they produce.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  real,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from '../schema';

/**
 * Records each execution of the idea generator, including trigger metadata.
 */
export const ideaGenerations = pgTable('idea_generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  triggerType: varchar('trigger_type', { length: 50 }).notNull().default('manual'),
  technique: varchar('technique', { length: 50 }),
  requestedCount: integer('requested_count').notNull().default(3),
  generatedCount: integer('generated_count').notNull().default(0),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  triggerIdx: index('idea_generations_trigger_idx').on(table.triggerType),
  createdIdx: index('idea_generations_created_idx').on(table.createdAt),
  techniqueIdx: index('idea_generations_technique_idx').on(table.technique),
}));

/**
 * Stores the individual idea suggestions generated in each run.
 */
export const ideaSuggestions = pgTable('idea_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  generationId: uuid('generation_id').references(() => ideaGenerations.id, { onDelete: 'cascade' }).notNull(),
  rank: integer('rank').notNull().default(1),
  ideaText: text('idea_text').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  novelty: real('novelty').notNull(),
  feasibility: real('feasibility').notNull(),
  impact: real('impact').notNull(),
  inspirations: jsonb('inspirations'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  generationIdx: index('idea_suggestions_generation_idx').on(table.generationId),
  categoryIdx: index('idea_suggestions_category_idx').on(table.category),
  createdIdx: index('idea_suggestions_created_idx').on(table.createdAt),
}));

export type IdeaGenerationRow = typeof ideaGenerations.$inferSelect;
export type NewIdeaGenerationRow = typeof ideaGenerations.$inferInsert;

export type IdeaSuggestionRow = typeof ideaSuggestions.$inferSelect;
export type NewIdeaSuggestionRow = typeof ideaSuggestions.$inferInsert;
