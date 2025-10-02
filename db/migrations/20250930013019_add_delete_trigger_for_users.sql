-- Custom SQL migration file, put your code below! --

-- Update function to support DELETE operation
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
        RETURN NEW;

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
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Delete user from public.users
        DELETE FROM public.users WHERE id = OLD.id;
        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;--> statement-breakpoint

-- Create trigger on auth.users table for DELETE
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;--> statement-breakpoint
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_public_users();