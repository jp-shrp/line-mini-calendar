import type { createSupabaseAdminClient } from '_shared/clientAdmin'
import { createInternalServerError } from '_shared/middlewares/middleware'

/**
 * IDから決定論的UUID v4を生成する関数（SHA-256使用）
 * @param id - 任意のID文字列（Auth0 ID、デバイスIDなど）
 * @returns 決定論的UUID v4
 */
export const generateDeterministicUUID = async (
    id: string
): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(id)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    const hashArray = new Uint8Array(hashBuffer)
    const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    const uuid = [
        hashHex.slice(0, 8),
        hashHex.slice(8, 12),
        '4' + hashHex.slice(13, 16),
        ((parseInt(hashHex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
            hashHex.slice(17, 20),
        hashHex.slice(20, 32),
    ].join('-')

    return uuid
}

/**
 * 決定論的UUIDでユーザーを検索する
 * @param supabaseAdmin - Supabase Admin Client
 * @param id - 検索に使用するID
 * @returns ユーザーオブジェクトまたはnull
 */
export const getUserByDeterministicId = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    id: string
) => {
    const deterministicUUID = await generateDeterministicUUID(id)

    try {
        const { data: user, error: userError } =
            await supabaseAdmin.auth.admin.getUserById(deterministicUUID)

        if (!userError && user?.user) {
            return user.user
        }
    } catch (_error) {
        // ユーザーが存在しない場合
    }

    return null
}

/**
 * 決定論的UUIDでユーザーを作成する
 * @param supabaseAdmin - Supabase Admin Client
 * @param id - ユーザー識別ID
 * @param metadata - ユーザーメタデータ
 * @returns 作成されたユーザーオブジェクト
 */
export const createUserWithDeterministicId = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    id: string,
    metadata: {
        email?: string
        phone?: string
        email_confirm?: boolean
        user_metadata?: Record<string, unknown>
    }
) => {
    const deterministicUUID = await generateDeterministicUUID(id)

    const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
            id: deterministicUUID,
            email: metadata.email,
            phone: metadata.phone,
            email_confirm: metadata.email_confirm ?? true,
            user_metadata: metadata.user_metadata,
        })

    if (createError) {
        throw createInternalServerError(
            'Failed to create user with deterministic ID',
            createError
        )
    }

    return newUser.user
}

/**
 * ユーザーメタデータを更新する
 * @param supabaseAdmin - Supabase Admin Client
 * @param userId - ユーザーID
 * @param metadata - 更新するメタデータ
 * @returns 更新されたユーザーオブジェクト
 */
export const updateUserMetadata = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    userId: string,
    metadata: Record<string, unknown>
) => {
    const { data: updatedUser, error: updateError } =
        await supabaseAdmin.auth.admin.getUserById(userId)

    if (updateError || !updatedUser.user) {
        throw createInternalServerError(
            'Failed to get user for metadata update',
            updateError
        )
    }

    const { data: updated, error: err } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...updatedUser.user.user_metadata,
                ...metadata,
            },
        })

    if (err) {
        throw createInternalServerError('Failed to update user metadata', err)
    }

    return updated.user
}

/**
 * 匿名ユーザーを取得または作成し、セッションを生成
 */
export const getOrCreateAnonymousUser = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    deviceId: string
): Promise<{
    user: any
    session: {
        access_token: string
        refresh_token: string
        expires_at: number
    }
}> => {
    const anonymousId = `anonymous_${deviceId}`

    const existingUser = await getUserByDeterministicId(
        supabaseAdmin,
        anonymousId
    )

    let supabaseUser

    if (!existingUser) {
        const deterministicUUID = await generateDeterministicUUID(anonymousId)
        const anonymousEmail = `${deterministicUUID}@anonymous.local`

        supabaseUser = await createUserWithDeterministicId(
            supabaseAdmin,
            anonymousId,
            {
                email: anonymousEmail,
                email_confirm: true,
                user_metadata: {
                    device_id: deviceId,
                    is_anonymous: true,
                    created_at: new Date().toISOString(),
                },
            }
        )
    } else {
        supabaseUser = await updateUserMetadata(
            supabaseAdmin,
            existingUser.id,
            {
                device_id: deviceId,
                is_anonymous: true,
                last_login: new Date().toISOString(),
            }
        )
    }

    const anonymousEmail =
        supabaseUser.email || `${supabaseUser.id}@anonymous.local`

    const { data: linkData, error: sessionError } =
        await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: anonymousEmail,
        })

    if (sessionError || !linkData?.properties) {
        throw createInternalServerError(
            'Failed to generate session',
            sessionError
        )
    }

    // hashed_tokenを使ってセッションを生成
    const { data: verifyData, error: verifyError } =
        await supabaseAdmin.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink',
        })

    if (verifyError || !verifyData?.session) {
        throw createInternalServerError(
            'Failed to verify OTP and generate session',
            verifyError
        )
    }

    return {
        user: supabaseUser,
        session: {
            access_token: verifyData.session.access_token,
            refresh_token: verifyData.session.refresh_token,
            expires_at: verifyData.session.expires_at || 0,
        },
    }
}

/**
 * Auth0ユーザーを取得または作成し、セッションを生成
 */
export const getOrCreateAuth0User = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    auth0User: {
        sub: string
        email?: string
        name?: string
        nickname?: string
        picture?: string
        [key: string]: any
    }
): Promise<{
    user: any
    session: {
        access_token: string
        refresh_token: string
        expires_at: number
    }
}> => {
    const auth0Id = auth0User.sub
    const existingUser = await getUserByDeterministicId(supabaseAdmin, auth0Id)

    let supabaseUser

    if (!existingUser) {
        supabaseUser = await createUserWithDeterministicId(
            supabaseAdmin,
            auth0Id,
            {
                email: auth0User.email,
                email_confirm: true,
                user_metadata: {
                    auth0_id: auth0Id,
                    name: auth0User.name || auth0User.nickname,
                    picture: auth0User.picture,
                    auth0_user: auth0User,
                },
            }
        )
    } else {
        supabaseUser = await updateUserMetadata(
            supabaseAdmin,
            existingUser.id,
            {
                auth0_id: auth0Id,
                name: auth0User.name || auth0User.nickname,
                picture: auth0User.picture,
                auth0_user: auth0User,
                updated_at: new Date().toISOString(),
            }
        )
    }

    const userEmail = supabaseUser.email || auth0User.email

    if (!userEmail) {
        throw createInternalServerError('User email is required for session')
    }

    const { data: linkData, error: sessionError } =
        await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: userEmail,
        })

    if (sessionError || !linkData?.properties) {
        throw createInternalServerError(
            'Failed to generate session',
            sessionError
        )
    }

    // hashed_tokenを使ってセッションを生成
    const { data: verifyData, error: verifyError } =
        await supabaseAdmin.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink',
        })

    if (verifyError || !verifyData?.session) {
        throw createInternalServerError(
            'Failed to verify OTP and generate session',
            verifyError
        )
    }

    return {
        user: supabaseUser,
        session: {
            access_token: verifyData.session.access_token,
            refresh_token: verifyData.session.refresh_token,
            expires_at: verifyData.session.expires_at || 0,
        },
    }
}
