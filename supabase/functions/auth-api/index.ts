import { createSupabaseAdminClient } from '_shared/clientAdmin'
import {
    initApi,
    validatedApiHandler,
    authMiddleware,
} from '_shared/middlewares/middleware'
import {
    getOrCreateAnonymousUser,
    getOrCreateLineUser,
    verifyLineIdToken,
    linkLineToAnonymousAccount,
} from '_shared/services/authService'
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

/**
 * LINEログインスキーマ
 */
const lineLoginSchema = z.object({
    idToken: z.string().min(1, 'LINE ID token is required'),
})

/**
 * LINEログインエンドポイント
 * POST /auth-api/line-login
 */
app.post(
    '/line-login',
    validatedApiHandler(lineLoginSchema, async (_c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()

        // LINE ID tokenを検証
        const lineUser = await verifyLineIdToken(data.idToken)

        // LINEユーザー情報からSupabaseユーザーを取得/作成
        const { user, email, password } = await getOrCreateLineUser(
            supabaseAdmin,
            lineUser
        )

        return new SuccessResponse({
            data: {
                userId: user.id,
                email,
                password,
                lineUserId: lineUser.sub,
                displayName: lineUser.name,
                pictureUrl: lineUser.picture,
            },
            message: 'LINE login successful',
        })
    })
)

/**
 * LINEアカウント連携スキーマ
 */
const linkLineSchema = z.object({
    idToken: z.string().min(1, 'LINE ID token is required'),
})

/**
 * LINEアカウント連携エンドポイント
 * POST /auth-api/link-line
 * 既存の匿名アカウントにLINEアカウントを連携
 */
app.post(
    '/link-line',
    authMiddleware,
    validatedApiHandler(linkLineSchema, async (c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()
        const user = c.get('user')

        if (!user?.id) {
            throw new Error('User not authenticated')
        }

        // LINE ID tokenを検証
        const lineUser = await verifyLineIdToken(data.idToken)

        // 匿名アカウントにLINE情報を連携
        const { user: updatedUser } = await linkLineToAnonymousAccount(
            supabaseAdmin,
            user.id,
            lineUser
        )

        return new SuccessResponse({
            data: {
                userId: updatedUser.id,
                lineUserId: lineUser.sub,
                displayName: lineUser.name,
                pictureUrl: lineUser.picture,
                linkedAt: updatedUser.user_metadata?.linked_at,
            },
            message: 'LINE account linked successfully',
        })
    })
)

Deno.serve(app.fetch)
