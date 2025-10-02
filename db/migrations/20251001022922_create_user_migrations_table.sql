CREATE TABLE "user_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"migration_type" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"migrated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE INDEX "user_migrations_from_user_id_idx" ON "user_migrations" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "user_migrations_to_user_id_idx" ON "user_migrations" USING btree ("to_user_id");