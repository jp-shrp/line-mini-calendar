-- Migration: Create auth trigger for automatic user synchronization
-- Description: Sync auth.users to public.users for INSERT, UPDATE, and DELETE operations

-- Function to synchronize auth.users to public.users
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert new user into public.users
        INSERT INTO public.users (
            id,
            email,
            display_name,
            profile_image,
            line_user_id,
            auth0_id,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
            COALESCE(NEW.raw_user_meta_data->>'profile_image', NULL),
            COALESCE(NEW.raw_user_meta_data->>'line_user_id', NULL),
            COALESCE(NEW.raw_user_meta_data->>'auth0_id', NULL),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Update existing user in public.users
        UPDATE public.users
        SET
            email = NEW.email,
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
            profile_image = COALESCE(NEW.raw_user_meta_data->>'profile_image', profile_image),
            line_user_id = COALESCE(NEW.raw_user_meta_data->>'line_user_id', line_user_id),
            auth0_id = COALESCE(NEW.raw_user_meta_data->>'auth0_id', auth0_id),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Delete user from public.users
        DELETE FROM public.users WHERE id = OLD.id;
        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for INSERT and UPDATE operations
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- Create trigger for DELETE operation
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
