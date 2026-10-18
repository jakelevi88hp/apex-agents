-- 001_additive_agents_workflows_usage.sql
-- Hand-written, ADDITIVE ONLY. Creates the tables needed for agent creation,
-- workflow creation and usage tracking that are missing on the production
-- Neon branch (neon-rose-yacht / main). Definitions match the Drizzle schema
-- at commit d9cf0f7:
--   organizations  -> src/lib/db/schema.ts:51-59   (FK target of agents/workflows.organization_id)
--   agents         -> src/lib/db/schema.ts:65-85
--   workflows      -> src/lib/db/schema.ts:102-123
--   usage_tracking -> src/lib/db/schema/subscriptions.ts:31-44 (the definition actually
--                     re-exported by src/lib/db/schema.ts and used by
--                     src/lib/subscription/service.ts)
-- No enums are needed (all status/type columns are varchar/text).
-- Idempotent: every statement is IF NOT EXISTS; constraints are inline so they
-- are only created together with their table. No ALTER, DROP or RENAME of any
-- existing object. Safe to run twice.

BEGIN;

CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(100) NOT NULL,
	"plan" varchar(20) DEFAULT 'starter' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"config" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"performance_metrics" jsonb,
	"learning_data" jsonb,
	"capabilities" jsonb,
	"constraints" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "agents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "agents_user_idx" ON "agents" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "agents_type_idx" ON "agents" USING btree ("type");
CREATE INDEX IF NOT EXISTS "agents_status_idx" ON "agents" USING btree ("status");

CREATE TABLE IF NOT EXISTS "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"trigger" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"agents" jsonb NOT NULL,
	"conditions" jsonb,
	"error_handling" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"execution_count" integer DEFAULT 0 NOT NULL,
	"last_execution" timestamp,
	"average_duration_ms" integer,
	"success_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "workflows_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action
);
CREATE INDEX IF NOT EXISTS "workflows_user_idx" ON "workflows" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "workflows_status_idx" ON "workflows" USING btree ("status");

-- Matches src/lib/db/schema/subscriptions.ts exactly (text id generated in app
-- code, no FK and no index declared in the Drizzle schema).
CREATE TABLE IF NOT EXISTS "usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"limit" integer NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

COMMIT;
