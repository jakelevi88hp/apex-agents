-- 004: create user_suggestions (additive only; matches src/lib/db/schema.ts userSuggestions).
-- Idempotent: safe to re-run. No drops, no renames.
CREATE TABLE IF NOT EXISTS "user_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL CONSTRAINT "user_suggestions_user_id_users_id_fk" REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"suggestion_type" varchar(50) DEFAULT 'idea' NOT NULL,
	"source" varchar(50) DEFAULT 'system' NOT NULL,
	"confidence" numeric(4, 2) DEFAULT 0.70 NOT NULL,
	"impact_score" numeric(4, 2) DEFAULT 0.50 NOT NULL,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
CREATE INDEX IF NOT EXISTS "user_suggestions_user_idx" ON "user_suggestions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_suggestions_status_idx" ON "user_suggestions" USING btree ("status");
CREATE INDEX IF NOT EXISTS "user_suggestions_type_idx" ON "user_suggestions" USING btree ("suggestion_type");
