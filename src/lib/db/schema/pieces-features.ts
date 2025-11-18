/**
 * Pieces Features Database Schema
 * 
 * Schema for Pieces-like features:
 * - LTM-2.7 (Long-Term Memory Engine) workflow context
 * - Pieces Drive (material management)
 * - Workstream Activity (activity roll-ups)
 */

import { pgTable, uuid, text, timestamp, jsonb, varchar, index, boolean } from 'drizzle-orm/pg-core';
import { users } from '../schema';

// ============================================================================
// LTM-2.7 WORKFLOW CONTEXT
// ============================================================================

/**
 * Captures live context from workflow over 7-day period
 * - Websites visited
 * - Code worked on
 * - Snippets saved
 * - Files accessed
 */
export const ltmWorkflowContext = pgTable('ltm_workflow_context', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  contextType: varchar('context_type', { length: 50 }).notNull(), // website, code, snippet, file, document
  title: text('title'),
  url: text('url'), // For websites, file paths, or document URLs
  content: text('content'), // Code snippets, document content, etc.
  metadata: jsonb('metadata'), // Additional context (browser info, editor info, etc.)
  tags: jsonb('tags'), // Array of tags for categorization
  importance: jsonb('importance'), // Importance score and factors
  accessedAt: timestamp('accessed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // 7 days from creation
}, (table) => ({
  userIdx: index('ltm_workflow_user_idx').on(table.userId),
  contextTypeIdx: index('ltm_workflow_type_idx').on(table.contextType),
  accessedIdx: index('ltm_workflow_accessed_idx').on(table.accessedAt),
  expiresIdx: index('ltm_workflow_expires_idx').on(table.expiresAt),
}));

/**
 * Natural language queries and their resolved anchors
 * Stores queries like "link to Firestore database I was working in last week"
 * and the resolved URL/path
 */
export const ltmQueries = pgTable('ltm_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  query: text('query').notNull(),
  resolvedAnchors: jsonb('resolved_anchors'), // Array of {url, path, contextId, confidence}
  contextIds: jsonb('context_ids'), // Array of related context IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('ltm_queries_user_idx').on(table.userId),
  createdAtIdx: index('ltm_queries_created_idx').on(table.createdAt),
}));

// ============================================================================
// PIECES DRIVE (MATERIAL MANAGEMENT)
// ============================================================================

/**
 * Materials saved to Pieces Drive (code, notes, links, etc.)
 */
export const piecesDriveMaterials = pgTable('pieces_drive_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  materialType: varchar('material_type', { length: 50 }).notNull(), // code, note, link, document, snippet
  title: text('title').notNull(),
  content: text('content'), // For code, notes, snippets
  url: text('url'), // For links
  language: varchar('language', { length: 50 }), // For code snippets
  tags: jsonb('tags'),
  metadata: jsonb('metadata'), // Source, author, related files, etc.
  shareableLink: varchar('shareable_link', { length: 255 }).unique(), // Unique shareable link
  isPublic: boolean('is_public').default(false).notNull(),
  viewCount: jsonb('view_count').default(0), // Number of views
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastAccessed: timestamp('last_accessed'),
}, (table) => ({
  userIdx: index('pieces_drive_user_idx').on(table.userId),
  materialTypeIdx: index('pieces_drive_type_idx').on(table.materialType),
  shareableLinkIdx: index('pieces_drive_link_idx').on(table.shareableLink),
  createdAtIdx: index('pieces_drive_created_idx').on(table.createdAt),
}));

/**
 * Collections/folders for organizing materials
 */
export const piecesDriveCollections = pgTable('pieces_drive_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }), // For UI display
  icon: varchar('icon', { length: 50 }), // Icon identifier
  materialIds: jsonb('material_ids'), // Array of material IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('pieces_collections_user_idx').on(table.userId),
}));

// ============================================================================
// WORKSTREAM ACTIVITY
// ============================================================================

/**
 * Workstream Activity roll-ups (generated every 20 minutes)
 * Summarizes recent tasks, discussions, code reviews, etc.
 */
export const workstreamActivity = pgTable('workstream_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  summary: text('summary').notNull(), // Main summary of the period
  mainTasks: jsonb('main_tasks'), // Array of {task, status, details}
  projects: jsonb('projects'), // Array of {project, activity, changes}
  issuesResolved: jsonb('issues_resolved'), // Array of {issue, resolution, link}
  keyDecisions: jsonb('key_decisions'), // Array of {decision, context, impact}
  discussions: jsonb('discussions'), // Array of {topic, participants, summary, link}
  documents: jsonb('documents'), // Array of {document, action, link}
  codeReviewed: jsonb('code_reviewed'), // Array of {file, changes, link}
  links: jsonb('links'), // Helpful links included in the roll-up
  metadata: jsonb('metadata'), // Additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('workstream_user_idx').on(table.userId),
  periodStartIdx: index('workstream_start_idx').on(table.periodStart),
  periodEndIdx: index('workstream_end_idx').on(table.periodEnd),
  createdAtIdx: index('workstream_created_idx').on(table.createdAt),
}));

/**
 * Workstream Activity sources - tracks what data was used to generate roll-ups
 */
export const workstreamActivitySources = pgTable('workstream_activity_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').references(() => workstreamActivity.id, { onDelete: 'cascade' }).notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // execution, document, conversation, code_change
  sourceId: uuid('source_id'), // Reference to the source (execution ID, document ID, etc.)
  sourceData: jsonb('source_data'), // Snapshot of source data
  contribution: text('contribution'), // How this source contributed to the roll-up
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  activityIdx: index('workstream_sources_activity_idx').on(table.activityId),
  sourceTypeIdx: index('workstream_sources_type_idx').on(table.sourceType),
}));
