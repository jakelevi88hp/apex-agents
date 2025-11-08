-- Migration: Add AI Admin Conversation Tables
-- Created: 2025-01-08
-- Description: Creates tables for conversation persistence, message history, and file uploads

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  branch_from_id UUID,
  branch_at_message_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for ai_conversations
CREATE INDEX IF NOT EXISTS ai_conversations_user_idx ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_branch_idx ON ai_conversations(branch_from_id);
CREATE INDEX IF NOT EXISTS ai_conversations_updated_idx ON ai_conversations(updated_at);

-- Create ai_messages table
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

-- Create indexes for ai_messages
CREATE INDEX IF NOT EXISTS ai_messages_conversation_idx ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS ai_messages_created_idx ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS ai_messages_role_idx ON ai_messages(role);

-- Create ai_uploaded_files table
CREATE TABLE IF NOT EXISTS ai_uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  s3_key VARCHAR(1000) NOT NULL,
  s3_url TEXT NOT NULL,
  analysis_result JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (message_id) REFERENCES ai_messages(id) ON DELETE CASCADE
);

-- Create index for ai_uploaded_files
CREATE INDEX IF NOT EXISTS ai_uploaded_files_message_idx ON ai_uploaded_files(message_id);

-- Verify tables were created
SELECT 
  'ai_conversations' as table_name, 
  COUNT(*) as row_count 
FROM ai_conversations
UNION ALL
SELECT 
  'ai_messages' as table_name, 
  COUNT(*) as row_count 
FROM ai_messages
UNION ALL
SELECT 
  'ai_uploaded_files' as table_name, 
  COUNT(*) as row_count 
FROM ai_uploaded_files;
