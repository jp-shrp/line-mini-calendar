import { createSupabaseAdminClient } from '_shared/clientAdmin'
import { initApi, validatedApiHandler } from '_shared/middlewares/middleware'
import {
    generateDeterministicUUID,
    getOrCreateAnonymousUser,
    getOrCreateAuth0User,
} from '_shared/services/authService'
import {
    checkMigrationExists,
    migrateAnonymousToAuth0,
} from '_shared/services/userMigrationService'
import { SuccessResponse } from '_shared/types/responses'
import {
    anonymousLoginSchema,
    auth0LoginSchema,
    migrateUserSchema,
} from '_shared/validations/authValidation'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

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
 * 匿名ログインエンドポイント
 * POST /auth-api/anonymous-login
 */
app.post(
    '/anonymous-login',
    validatedApiHandler(anonymousLoginSchema, async (_c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()
        const result = await getOrCreateAnonymousUser(
            supabaseAdmin,
            data.deviceId,
        )

        return new SuccessResponse({
            data: result,
            message: 'Anonymous login successful',
        })
    }),
)

/**
 * Auth0ログインエンドポイント
 * POST /auth-api/auth0-login
 */
app.post(
    '/auth0-login',
    validatedApiHandler(auth0LoginSchema, async (_c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()
        const result = await getOrCreateAuth0User(supabaseAdmin, data.auth0User)

        return new SuccessResponse({
            data: result,
            message: 'Auth0 login successful',
        })
    }),
)

/**
 * ユーザー移行エンドポイント
 * POST /auth-api/migrate
 */
app.post(
    '/migrate',
    validatedApiHandler(migrateUserSchema, async (_c, data) => {
        const supabaseAdmin = createSupabaseAdminClient()

        const migrationCheck = await checkMigrationExists(data.anonymousUserId)
        if (migrationCheck.exists) {
            if (!migrationCheck.toUserId) {
                throw new Error('Migration toUserId is missing')
            }

            const { data: existingUser } =
                await supabaseAdmin.auth.admin.getUserById(
                    migrationCheck.toUserId,
                )

            if (!existingUser?.user?.email) {
                throw new Error('User email is required for session generation')
            }

            const { data: linkData, error: sessionError } =
                await supabaseAdmin.auth.admin.generateLink({
                    type: 'magiclink',
                    email: existingUser.user.email,
                })

            if (sessionError || !linkData?.properties) {
                throw new Error('Failed to generate session')
            }

            // hashed_tokenを使ってセッションを生成
            const { data: verifyData, error: verifyError } =
                await supabaseAdmin.auth.verifyOtp({
                    token_hash: linkData.properties.hashed_token,
                    type: 'magiclink',
                })

            if (verifyError || !verifyData?.session) {
                throw new Error('Failed to verify OTP and generate session')
            }

            return new SuccessResponse({
                data: {
                    user: existingUser.user,
                    session: {
                        access_token: verifyData.session.access_token,
                        refresh_token: verifyData.session.refresh_token,
                        expires_at: verifyData.session.expires_at || 0,
                    },
                    migration: {
                        migrationId: null,
                        migratedTables: [],
                    },
                    message: `Already migrated to ${migrationCheck.toUserId}`,
                },
                message: 'Migration already completed',
            })
        }

        const auth0UserId = await generateDeterministicUUID(data.auth0User.sub)

        const result = await migrateAnonymousToAuth0(
            supabaseAdmin,
            data.anonymousUserId,
            auth0UserId,
            {
                email: data.auth0User.email || '',
                name: data.auth0User.name,
                picture: data.auth0User.picture,
                auth0_id: data.auth0User.sub,
            },
        )

        const { data: newUser } =
            await supabaseAdmin.auth.admin.getUserById(auth0UserId)

        if (!newUser?.user?.email) {
            throw new Error('User email is required for session generation')
        }

        const { data: linkData, error: sessionError } =
            await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: newUser.user.email,
            })

        if (sessionError || !linkData?.properties) {
            throw new Error('Failed to generate session')
        }

        // hashed_tokenを使ってセッションを生成
        const { data: verifyData, error: verifyError } =
            await supabaseAdmin.auth.verifyOtp({
                token_hash: linkData.properties.hashed_token,
                type: 'magiclink',
            })

        if (verifyError || !verifyData?.session) {
            throw new Error('Failed to verify OTP and generate session')
        }

        return new SuccessResponse({
            data: {
                user: newUser.user,
                session: {
                    access_token: verifyData.session.access_token,
                    refresh_token: verifyData.session.refresh_token,
                    expires_at: verifyData.session.expires_at || 0,
                },
                migration: {
                    migrationId: result.migrationId,
                    migratedTables: result.migratedTables,
                },
            },
            message: 'Migration successful',
        })
    }),
)

Deno.serve(app.fetch)
