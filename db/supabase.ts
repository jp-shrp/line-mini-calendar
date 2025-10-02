import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * クライアントサイド用のSupabaseクライアント
 * ブラウザ環境で使用し、自動的にCookieを通じてセッション管理を行う
 */
export const createSupabaseClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * サーバーサイド用のSupabaseクライアント（管理者権限）
 * Edge FunctionsやServer Actionsで使用
 */
export const createSupabaseAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

/**
 * シングルトンパターンでクライアントを管理
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = () => {
    if (typeof window === 'undefined') {
        // サーバーサイドでは毎回新しいクライアントを作成
        return createSupabaseClient()
    }

    // ブラウザ環境ではシングルトンを使用
    if (!browserClient) {
        browserClient = createSupabaseClient()
    }

    return browserClient
}
