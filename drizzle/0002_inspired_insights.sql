CREATE TABLE "user_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
ALTER TABLE "user_suggestions" ADD CONSTRAINT "user_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_suggestions_user_idx" ON "user_suggestions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_suggestions_status_idx" ON "user_suggestions" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "user_suggestions_type_idx" ON "user_suggestions" USING btree ("suggestion_type");
