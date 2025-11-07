/**
 * AI Admin Conversations Schema
 * 
 * Database schema for AI Admin conversation persistence, including:
 * - Multi-turn conversations
 * - Message history
 * - File uploads
 * - Conversation branching
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from '../schema';

// ============================================================================
// AI CONVERSATIONS
// ============================================================================

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }),
  branchFromId: uuid('branch_from_id'), // References another conversation
  branchAtMessageId: uuid('branch_at_message_id'), // Message where branch occurred
  metadata: jsonb('metadata'), // Additional conversation metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('ai_conversations_user_idx').on(table.userId),
  branchIdx: index('ai_conversations_branch_idx').on(table.branchFromId),
  updatedIdx: index('ai_conversations_updated_idx').on(table.updatedAt),
}));

// Self-referencing foreign key for branching
export const aiConversationsRelations = {
  branchFrom: {
    fields: [aiConversations.branchFromId],
    references: [aiConversations.id],
  },
};

// ============================================================================
// AI MESSAGES
// ============================================================================

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  metadata: jsonb('metadata'), // Stores file attachments, code blocks, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('ai_messages_conversation_idx').on(table.conversationId),
  createdIdx: index('ai_messages_created_idx').on(table.createdAt),
  roleIdx: index('ai_messages_role_idx').on(table.role),
}));

// ============================================================================
// AI UPLOADED FILES
// ============================================================================

export const aiUploadedFiles = pgTable('ai_uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => aiMessages.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  s3Key: varchar('s3_key', { length: 1000 }).notNull(),
  s3Url: text('s3_url').notNull(),
  analysisResult: jsonb('analysis_result'), // Stores AI analysis of the file
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  messageIdx: index('ai_uploaded_files_message_idx').on(table.messageId),
}));

// ============================================================================
// TYPES
// ============================================================================

export type AIConversation = typeof aiConversations.$inferSelect;
export type NewAIConversation = typeof aiConversations.$inferInsert;

export type AIMessage = typeof aiMessages.$inferSelect;
export type NewAIMessage = typeof aiMessages.$inferInsert;

export type AIUploadedFile = typeof aiUploadedFiles.$inferSelect;
export type NewAIUploadedFile = typeof aiUploadedFiles.$inferInsert;
