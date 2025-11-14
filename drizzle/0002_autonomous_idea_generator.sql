CREATE TABLE "idea_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"trigger_type" varchar(50) DEFAULT 'manual' NOT NULL,
	"technique" varchar(50),
	"requested_count" integer DEFAULT 3 NOT NULL,
	"generated_count" integer DEFAULT 0 NOT NULL,
	"user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idea_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"rank" integer DEFAULT 1 NOT NULL,
	"idea_text" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"novelty" real NOT NULL,
	"feasibility" real NOT NULL,
	"impact" real NOT NULL,
	"inspirations" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idea_generations" ADD CONSTRAINT "idea_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idea_suggestions" ADD CONSTRAINT "idea_suggestions_generation_id_idea_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "idea_generations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX "idea_generations_trigger_idx" ON "idea_generations" USING btree ("trigger_type");
--> statement-breakpoint
CREATE INDEX "idea_generations_created_idx" ON "idea_generations" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "idea_generations_technique_idx" ON "idea_generations" USING btree ("technique");
--> statement-breakpoint
CREATE INDEX "idea_suggestions_generation_idx" ON "idea_suggestions" USING btree ("generation_id");
--> statement-breakpoint
CREATE INDEX "idea_suggestions_category_idx" ON "idea_suggestions" USING btree ("category");
--> statement-breakpoint
CREATE INDEX "idea_suggestions_created_idx" ON "idea_suggestions" USING btree ("created_at");
