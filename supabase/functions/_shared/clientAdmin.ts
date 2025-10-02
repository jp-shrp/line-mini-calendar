import { createClient } from 'imports'

export const getClientAdmin = () => {
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    )
}

// createSupabaseAdminClient alias for consistency
export const createSupabaseAdminClient = getClientAdmin
