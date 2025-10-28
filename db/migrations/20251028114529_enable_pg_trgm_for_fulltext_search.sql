-- Enable pg_trgm extension for trigram-based full-text search
-- This extension supports Japanese, English, and other languages
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- Create GIN index on events.title for fast full-text search
-- Using gin_trgm_ops operator class for trigram indexing
CREATE INDEX IF NOT EXISTS "events_title_trgm_idx" ON "events" USING gin ("title" gin_trgm_ops);--> statement-breakpoint

-- Create GIN index on events.description for fast full-text search
-- Using gin_trgm_ops operator class for trigram indexing
CREATE INDEX IF NOT EXISTS "events_description_trgm_idx" ON "events" USING gin ("description" gin_trgm_ops);
