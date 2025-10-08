-- Migration: Alter users table to support auth integration
-- Description: Remove default random UUID from users.id to allow auth.users.id to be used directly

-- Remove default value from users.id
ALTER TABLE public.users
    ALTER COLUMN id DROP DEFAULT;

-- Update existing records (if any) to ensure they have valid UUIDs
-- This is a safety measure in case there are existing records
UPDATE public.users
SET id = gen_random_uuid()
WHERE id IS NULL;

-- Ensure id column is NOT NULL
ALTER TABLE public.users
    ALTER COLUMN id SET NOT NULL;

-- Add comment to explain the relationship with auth.users
COMMENT ON COLUMN public.users.id IS 'User ID matching auth.users.id';
