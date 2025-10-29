import { pgTable, text, timestamp, integer, jsonb, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Document metadata
  name: text('name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // in bytes
  
  // Storage
  filePath: text('file_path').notNull(), // Local file path or S3 key
  storageType: text('storage_type').notNull().default('local'), // 'local' or 's3'
  
  // Content
  extractedText: text('extracted_text'), // Full text extracted from document
  summary: text('summary'), // AI-generated summary
  
  // Vector embeddings
  pineconeId: text('pinecone_id'), // ID in Pinecone vector database
  embeddingModel: text('embedding_model'), // e.g., 'text-embedding-3-large'
  
  // Organization
  source: text('source').default('upload'), // 'upload', 'google-drive', 'notion', etc.
  tags: jsonb('tags').$type<string[]>().default([]),
  folder: text('folder'),
  
  // Status
  processingStatus: text('processing_status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  processingError: text('processing_error'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Soft delete
  deletedAt: timestamp('deleted_at'),
});

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  
  // Chunk data
  content: text('content').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  
  // Vector embedding
  pineconeId: text('pinecone_id'), // ID in Pinecone
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;

