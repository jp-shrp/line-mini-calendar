-- Add auth0_id column to users table
ALTER TABLE "users" ADD COLUMN "auth0_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth0_id_unique" UNIQUE("auth0_id");--> statement-breakpoint

-- Create function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert new user into public.users
        INSERT INTO public.users (
            id,
            email,
            name,
            profile_image,
            auth0_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NULL),
            COALESCE(NEW.raw_user_meta_data->>'picture', NULL),
            COALESCE(NEW.raw_user_meta_data->>'auth0_id', NULL),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Update existing user in public.users
        UPDATE public.users
        SET
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>'name', name),
            profile_image = COALESCE(NEW.raw_user_meta_data->>'picture', profile_image),
            auth0_id = COALESCE(NEW.raw_user_meta_data->>'auth0_id', auth0_id),
            updated_at = NOW()
        WHERE id = NEW.id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;--> statement-breakpoint

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;--> statement-breakpoint
CREATE TRIGGER on_auth_user_created_or_updated
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_public_users();--> statement-breakpoint

-- Migrate existing auth.users to public.users
INSERT INTO public.users (
    id,
    email,
    name,
    profile_image,
    auth0_id,
    created_at,
    updated_at
)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', NULL),
    COALESCE(au.raw_user_meta_data->>'picture', NULL),
    COALESCE(au.raw_user_meta_data->>'auth0_id', NULL),
    COALESCE(au.created_at, NOW()),
    COALESCE(au.updated_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);