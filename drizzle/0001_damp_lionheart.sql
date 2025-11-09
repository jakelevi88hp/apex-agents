CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_value" text NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"environment" varchar(20) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"text" text NOT NULL,
	"embedding" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"source" text NOT NULL,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"summary" text,
	"tags" jsonb,
	"folder" varchar(255),
	"metadata" jsonb,
	"embedding_status" varchar(20) DEFAULT 'pending',
	"chunk_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_name" text,
	"email" varchar(320),
	"timezone" varchar(50) DEFAULT 'UTC-5',
	"email_notifications" boolean DEFAULT true NOT NULL,
	"realtime_monitoring" boolean DEFAULT true NOT NULL,
	"auto_retry" boolean DEFAULT false NOT NULL,
	"openai_api_key" text,
	"anthropic_api_key" text,
	"default_model" varchar(100) DEFAULT 'gpt-4-turbo',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"limit" integer NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_patches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"files" jsonb NOT NULL,
	"testing_steps" jsonb,
	"risks" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp,
	"rolled_back_at" timestamp,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" varchar(500),
	"branch_from_id" uuid,
	"branch_at_message_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_uploaded_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"s3_key" varchar(1000) NOT NULL,
	"s3_url" text NOT NULL,
	"analysis_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_consciousness_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid NOT NULL,
	"consciousness_level" real NOT NULL,
	"attention_focus" jsonb,
	"current_goals" jsonb,
	"metacognitive_state" jsonb,
	"emotional_state" jsonb,
	"creativity_level" real,
	"reasoning_mode" varchar(50),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"summary" text,
	"emotional_tone" varchar(50),
	"topics" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"message_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agi_emotional_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_id" uuid,
	"emotion_type" varchar(50) NOT NULL,
	"intensity" real NOT NULL,
	"valence" real NOT NULL,
	"arousal" real NOT NULL,
	"trigger" text,
	"response" text,
	"regulation" jsonb,
	"outcome" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_episodic_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"timestamp" timestamp NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"context" jsonb,
	"emotional_valence" real,
	"emotional_arousal" real,
	"importance_score" real,
	"participants" jsonb,
	"location" text,
	"outcome" text,
	"learned_lessons" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed" timestamp DEFAULT now(),
	"access_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"thoughts" jsonb,
	"emotional_state" varchar(50),
	"creativity" jsonb,
	"reasoning" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_procedural_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"skill_name" text NOT NULL,
	"description" text,
	"category" varchar(100),
	"steps" jsonb NOT NULL,
	"prerequisites" jsonb,
	"success_criteria" jsonb,
	"proficiency_level" real,
	"practice_count" integer DEFAULT 0 NOT NULL,
	"success_rate" real,
	"last_practiced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agi_semantic_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"concept" text NOT NULL,
	"definition" text,
	"category" varchar(100),
	"properties" jsonb,
	"relationships" jsonb,
	"examples" jsonb,
	"confidence" real,
	"source" text,
	"verification_status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"last_accessed" timestamp DEFAULT now(),
	"access_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agi_working_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid NOT NULL,
	"item_type" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"priority" real,
	"activation_level" real,
	"metadata" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "executions" ALTER COLUMN "workflow_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_uploaded_files" ADD CONSTRAINT "ai_uploaded_files_message_id_ai_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_consciousness_state" ADD CONSTRAINT "agi_consciousness_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_conversations" ADD CONSTRAINT "agi_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_emotional_memory" ADD CONSTRAINT "agi_emotional_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_emotional_memory" ADD CONSTRAINT "agi_emotional_memory_event_id_agi_episodic_memory_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."agi_episodic_memory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_episodic_memory" ADD CONSTRAINT "agi_episodic_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_messages" ADD CONSTRAINT "agi_messages_conversation_id_agi_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."agi_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_procedural_memory" ADD CONSTRAINT "agi_procedural_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_semantic_memory" ADD CONSTRAINT "agi_semantic_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agi_working_memory" ADD CONSTRAINT "agi_working_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_user_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "document_chunks_document_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_chunks_chunk_idx" ON "document_chunks" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_folder_idx" ON "documents" USING btree ("folder");--> statement-breakpoint
CREATE INDEX "team_members_owner_idx" ON "team_members" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "team_members_member_idx" ON "team_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_user_idx" ON "ai_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_branch_idx" ON "ai_conversations" USING btree ("branch_from_id");--> statement-breakpoint
CREATE INDEX "ai_conversations_updated_idx" ON "ai_conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "ai_messages_conversation_idx" ON "ai_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_messages_created_idx" ON "ai_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_messages_role_idx" ON "ai_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "ai_uploaded_files_message_idx" ON "ai_uploaded_files" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "agi_consciousness_user_idx" ON "agi_consciousness_state" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_consciousness_session_idx" ON "agi_consciousness_state" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "agi_consciousness_timestamp_idx" ON "agi_consciousness_state" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "agi_conversations_user_idx" ON "agi_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_conversations_started_idx" ON "agi_conversations" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "agi_emotional_user_idx" ON "agi_emotional_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_emotional_event_idx" ON "agi_emotional_memory" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "agi_emotional_type_idx" ON "agi_emotional_memory" USING btree ("emotion_type");--> statement-breakpoint
CREATE INDEX "agi_emotional_intensity_idx" ON "agi_emotional_memory" USING btree ("intensity");--> statement-breakpoint
CREATE INDEX "agi_episodic_user_idx" ON "agi_episodic_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_episodic_timestamp_idx" ON "agi_episodic_memory" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "agi_episodic_event_type_idx" ON "agi_episodic_memory" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "agi_episodic_importance_idx" ON "agi_episodic_memory" USING btree ("importance_score");--> statement-breakpoint
CREATE INDEX "agi_messages_conversation_idx" ON "agi_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "agi_messages_role_idx" ON "agi_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "agi_messages_created_idx" ON "agi_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agi_procedural_user_idx" ON "agi_procedural_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_procedural_skill_idx" ON "agi_procedural_memory" USING btree ("skill_name");--> statement-breakpoint
CREATE INDEX "agi_procedural_category_idx" ON "agi_procedural_memory" USING btree ("category");--> statement-breakpoint
CREATE INDEX "agi_procedural_proficiency_idx" ON "agi_procedural_memory" USING btree ("proficiency_level");--> statement-breakpoint
CREATE INDEX "agi_semantic_user_idx" ON "agi_semantic_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_semantic_concept_idx" ON "agi_semantic_memory" USING btree ("concept");--> statement-breakpoint
CREATE INDEX "agi_semantic_category_idx" ON "agi_semantic_memory" USING btree ("category");--> statement-breakpoint
CREATE INDEX "agi_semantic_confidence_idx" ON "agi_semantic_memory" USING btree ("confidence");--> statement-breakpoint
CREATE INDEX "agi_working_user_idx" ON "agi_working_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agi_working_session_idx" ON "agi_working_memory" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "agi_working_item_type_idx" ON "agi_working_memory" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "agi_working_expires_idx" ON "agi_working_memory" USING btree ("expires_at");