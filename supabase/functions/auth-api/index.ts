import { createSupabaseAdminClient } from '_shared/clientAdmin'
import { initApi, validatedApiHandler } from '_shared/middlewares/middleware'
import { getOrCreateAnonymousUser } from '_shared/services/authService'
import { SuccessResponse } from '_shared/types/responses'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { z } from 'zod'

export type Variables = {
    user?: {
        id: string
        email?: string
        user_metadata?: Record<string, unknown>
    }
    supabase?: ReturnType<typeof createSupabaseAdminClient>
}

const app = initApi<{ Variables: Variables }>('/auth-api')

/**
 * 匿名ログインスキーマ
 */
const anonymousLoginSchema = z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
})

/**
 * 匿名ログインエンドポイント
 * POST /auth-api/anonymous-login
 */
app.post(
    '/anonymous-login',
    validatedApiHandler(anonymousLoginSchema, async (_c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()

        // getOrCreateAnonymousUserを使用して、ユーザー取得/作成と認証情報を返す
        const { user, email, password } = await getOrCreateAnonymousUser(
            supabaseAdmin,
            data.deviceId
        )

        return new SuccessResponse({
            data: {
                userId: user.id,
                email,
                password,
            },
            message: 'Anonymous login successful',
        })
    })
)

Deno.serve(app.fetch)
