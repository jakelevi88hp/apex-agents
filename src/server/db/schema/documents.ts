import { pgTable, text, timestamp, integer, jsonb, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from '@/lib/db/schema';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id'),
  
  // Document metadata
  name: text('name').notNull(),
  originalName: text('original_name'),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  
  // Storage
  filePath: text('file_path'),
  storageType: text('storage_type').default('local'),
  
  // Content
  extractedText: text('extracted_text'),
  summary: text('summary'),
  
  // Vector embeddings
  pineconeId: text('pinecone_id'),
  embeddingModel: text('embedding_model'),
  
  // Organization
  source: text('source').notNull().default('upload'),
  tags: jsonb('tags').$type<string[]>(),
  folder: text('folder'),
  
  // Status (using both old and new column names for compatibility)
  status: text('status').notNull().default('processing'),
  processingStatus: text('processing_status'),
  processingError: text('processing_error'),
  embeddingStatus: text('embedding_status'),
  chunkCount: integer('chunk_count').default(0),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Soft delete
  deletedAt: timestamp('deleted_at'),
});

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  
  // Chunk data (using both old and new column names for compatibility)
  text: text('text'),
  content: text('content'),
  chunkIndex: integer('chunk_index').notNull(),
  
  // Vector embedding
  embedding: text('embedding'),
  pineconeId: text('pinecone_id'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;

