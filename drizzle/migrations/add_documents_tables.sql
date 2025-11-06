-- Create documents table for Knowledge page
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  source TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'processing' NOT NULL,
  summary TEXT,
  tags JSONB,
  folder VARCHAR(255),
  metadata JSONB,
  embedding_status VARCHAR(20) DEFAULT 'pending',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS documents_user_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents(status);
CREATE INDEX IF NOT EXISTS documents_folder_idx ON documents(folder);

-- Create document_chunks table for vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for document_chunks table
CREATE INDEX IF NOT EXISTS document_chunks_document_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_chunk_idx ON document_chunks(document_id, chunk_index);
