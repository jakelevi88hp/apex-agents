-- Migration: Pieces Features Tables
-- Creates tables for LTM-2.7, Pieces Drive, and Workstream Activity

-- ============================================================================
-- LTM-2.7 WORKFLOW CONTEXT
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ltm_workflow_context" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "context_type" VARCHAR(50) NOT NULL,
  "title" TEXT,
  "url" TEXT,
  "content" TEXT,
  "metadata" JSONB,
  "tags" JSONB,
  "importance" JSONB,
  "accessed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ltm_workflow_user_idx" ON "ltm_workflow_context"("user_id");
CREATE INDEX IF NOT EXISTS "ltm_workflow_type_idx" ON "ltm_workflow_context"("context_type");
CREATE INDEX IF NOT EXISTS "ltm_workflow_accessed_idx" ON "ltm_workflow_context"("accessed_at");
CREATE INDEX IF NOT EXISTS "ltm_workflow_expires_idx" ON "ltm_workflow_context"("expires_at");

CREATE TABLE IF NOT EXISTS "ltm_queries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "query" TEXT NOT NULL,
  "resolved_anchors" JSONB,
  "context_ids" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ltm_queries_user_idx" ON "ltm_queries"("user_id");
CREATE INDEX IF NOT EXISTS "ltm_queries_created_idx" ON "ltm_queries"("created_at");

-- ============================================================================
-- PIECES DRIVE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "pieces_drive_materials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "material_type" VARCHAR(50) NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "url" TEXT,
  "language" VARCHAR(50),
  "tags" JSONB,
  "metadata" JSONB,
  "shareable_link" VARCHAR(255) UNIQUE,
  "is_public" BOOLEAN NOT NULL DEFAULT FALSE,
  "view_count" JSONB DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_accessed" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "pieces_drive_user_idx" ON "pieces_drive_materials"("user_id");
CREATE INDEX IF NOT EXISTS "pieces_drive_type_idx" ON "pieces_drive_materials"("material_type");
CREATE INDEX IF NOT EXISTS "pieces_drive_link_idx" ON "pieces_drive_materials"("shareable_link");
CREATE INDEX IF NOT EXISTS "pieces_drive_created_idx" ON "pieces_drive_materials"("created_at");

CREATE TABLE IF NOT EXISTS "pieces_drive_collections" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" VARCHAR(20),
  "icon" VARCHAR(50),
  "material_ids" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "pieces_collections_user_idx" ON "pieces_drive_collections"("user_id");

-- ============================================================================
-- WORKSTREAM ACTIVITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS "workstream_activity" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "period_start" TIMESTAMP NOT NULL,
  "period_end" TIMESTAMP NOT NULL,
  "summary" TEXT NOT NULL,
  "main_tasks" JSONB,
  "projects" JSONB,
  "issues_resolved" JSONB,
  "key_decisions" JSONB,
  "discussions" JSONB,
  "documents" JSONB,
  "code_reviewed" JSONB,
  "links" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "workstream_user_idx" ON "workstream_activity"("user_id");
CREATE INDEX IF NOT EXISTS "workstream_start_idx" ON "workstream_activity"("period_start");
CREATE INDEX IF NOT EXISTS "workstream_end_idx" ON "workstream_activity"("period_end");
CREATE INDEX IF NOT EXISTS "workstream_created_idx" ON "workstream_activity"("created_at");

CREATE TABLE IF NOT EXISTS "workstream_activity_sources" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "activity_id" UUID NOT NULL REFERENCES "workstream_activity"("id") ON DELETE CASCADE,
  "source_type" VARCHAR(50) NOT NULL,
  "source_id" UUID,
  "source_data" JSONB,
  "contribution" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "workstream_sources_activity_idx" ON "workstream_activity_sources"("activity_id");
CREATE INDEX IF NOT EXISTS "workstream_sources_type_idx" ON "workstream_activity_sources"("source_type");
