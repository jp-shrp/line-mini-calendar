import type { createSupabaseAdminClient } from '_shared/clientAdmin'
import {
    createInternalServerError,
    createUnauthorizedError,
} from '_shared/middlewares/middleware'

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
 * IDから決定論的なパスワードを生成する関数
 * @param id - 任意のID文字列
 * @returns 決定論的パスワード（hex string）
 */
export const generateDeterministicPassword = async (
    id: string
): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(`password_${id}`)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    const hashArray = new Uint8Array(hashBuffer)
    return Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
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
    const deterministicPassword = await generateDeterministicPassword(id)

    const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
            id: deterministicUUID,
            email: metadata.email,
            phone: metadata.phone,
            email_confirm: metadata.email_confirm ?? true,
            password: deterministicPassword,
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
 * 匿名ユーザーを取得または作成し、認証情報を返す
 */
export const getOrCreateAnonymousUser = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    deviceId: string
): Promise<{
    user: any
    email: string
    password: string
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
    const password = await generateDeterministicPassword(anonymousId)

    return {
        user: supabaseUser,
        email: anonymousEmail,
        password,
    }
}

/**
 * Auth0ユーザーを取得または作成し、認証情報を返す
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
    email: string
    password: string
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

    const password = await generateDeterministicPassword(auth0Id)

    return {
        user: supabaseUser,
        email: userEmail,
        password,
    }
}

/**
 * LINE ID tokenをLINE Platform APIで検証
 * @param idToken - LINE LIFF SDK から取得した ID token
 * @returns 検証結果（LINE User IDを含む）
 */
export const verifyLineIdToken = async (
    idToken: string
): Promise<{
    sub: string // LINE User ID
    name?: string
    picture?: string
    email?: string
}> => {
    // モックトークンの検出（開発環境用）
    if (idToken.startsWith('mock_id_token_')) {
        console.log('[LINE] Mock ID token detected, returning mock user data')
        return {
            sub: 'U1234567890abcdef',
            name: 'テストユーザー',
            picture: 'https://via.placeholder.com/150',
            email: 'mock.user@example.com',
        }
    }

    // 実際のLINE Platform APIで検証
    const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            id_token: idToken,
            client_id: Deno.env.get('LINE_LIFF_ID') || '',
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('[LINE] ID token verification failed:', errorText)
        throw createUnauthorizedError('Invalid LINE ID token')
    }

    const data = await response.json()

    return {
        sub: data.sub,
        name: data.name,
        picture: data.picture,
        email: data.email,
    }
}

/**
 * LINEユーザーを取得または作成し、認証情報を返す
 */
export const getOrCreateLineUser = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    lineUser: {
        sub: string
        name?: string
        picture?: string
        email?: string
    }
): Promise<{
    user: any
    email: string
    password: string
}> => {
    const lineId = `line_${lineUser.sub}`
    const existingUser = await getUserByDeterministicId(supabaseAdmin, lineId)

    let supabaseUser

    if (!existingUser) {
        // LINE User IDから決定論的UUIDを生成
        const deterministicUUID = await generateDeterministicUUID(lineId)
        const lineEmail = lineUser.email || `${deterministicUUID}@line.local`

        supabaseUser = await createUserWithDeterministicId(
            supabaseAdmin,
            lineId,
            {
                email: lineEmail,
                email_confirm: true,
                user_metadata: {
                    line_user_id: lineUser.sub,
                    display_name: lineUser.name,
                    picture_url: lineUser.picture,
                    provider: 'line',
                    created_at: new Date().toISOString(),
                },
            }
        )
    } else {
        supabaseUser = await updateUserMetadata(
            supabaseAdmin,
            existingUser.id,
            {
                line_user_id: lineUser.sub,
                display_name: lineUser.name,
                picture_url: lineUser.picture,
                provider: 'line',
                last_login: new Date().toISOString(),
            }
        )
    }

    const userEmail = supabaseUser.email

    if (!userEmail) {
        throw createInternalServerError('User email is required for session')
    }

    const password = await generateDeterministicPassword(lineId)

    return {
        user: supabaseUser,
        email: userEmail,
        password,
    }
}

/**
 * 既存の匿名アカウントにLINEアカウントを連携
 * @param supabaseAdmin - Supabase Admin Client
 * @param currentUserId - 現在のSupabaseユーザーID（匿名ユーザー）
 * @param lineUser - LINEユーザー情報
 * @returns 更新されたユーザー情報と認証情報
 */
export const linkLineToAnonymousAccount = async (
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    currentUserId: string,
    lineUser: {
        sub: string
        name?: string
        picture?: string
        email?: string
    }
): Promise<{
    user: any
    email: string
    password: string
}> => {
    // 既存のLINEアカウントが存在するか確認
    const lineId = `line_${lineUser.sub}`
    const existingLineUser = await getUserByDeterministicId(
        supabaseAdmin,
        lineId
    )

    if (existingLineUser) {
        throw createInternalServerError(
            'LINE account is already linked to another account'
        )
    }

    // 現在のユーザーを取得
    const { data: currentUser, error: getUserError } =
        await supabaseAdmin.auth.admin.getUserById(currentUserId)

    if (getUserError || !currentUser.user) {
        throw createInternalServerError(
            'Failed to get current user',
            getUserError
        )
    }

    // LINE情報でメタデータを更新
    const updatedUser = await updateUserMetadata(supabaseAdmin, currentUserId, {
        line_user_id: lineUser.sub,
        display_name: lineUser.name,
        picture_url: lineUser.picture,
        provider: 'line_anonymous', // 匿名+LINE連携
        linked_at: new Date().toISOString(),
    })

    // 決定論的パスワードは変更しない（既存のまま）
    const anonymousId =
        currentUser.user.user_metadata?.device_id ||
        currentUserId.replace(/-/g, '')
    const password = await generateDeterministicPassword(
        `anonymous_${anonymousId}`
    )

    return {
        user: updatedUser,
        email: updatedUser.email || currentUser.user.email || '',
        password,
    }
}
