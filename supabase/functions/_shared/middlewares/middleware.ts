import { getErrorMessage } from '_shared/errorMessages'
import { users } from '_shared/schemas/users'
import { ERROR_CODES, type ErrorCode } from '_shared/types/common/errors'
import { SuccessResponse } from '_shared/types/responses'
import { db } from 'db'
import {
    Hono,
    type Context,
    type Env,
    type MiddlewareHandler,
    type Next,
} from 'hono'
import { cors } from 'hono/cors'
import { createClient } from 'imports'
import { z, ZodError } from 'zod'

/**
 * Supabaseクライアントの作成
 * リクエストヘッダーからAuthorizationを取得してSupabaseクライアントを初期化する
 * @param req HTTPリクエストオブジェクト
 * @returns 設定済みのSupabaseクライアント
 */
export function createSupabaseClient(req: Request) {
    // ヘッダーからAuthorizationを取得
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('RAW_SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    return createClient(supabaseUrl, serviceRoleKey, {
        global: {
            headers: {
                Authorization: authHeader || '',
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

/**
 * 認証ミドルウェア
 * JWTトークンを検証し、ユーザー情報をコンテキストに追加する
 * @param c Honoコンテキスト
 * @param next 次のミドルウェア関数
 * @throws ApiError 認証が失敗した場合
 * @概要 ユーザー向けAPI用の認証ミドルウェア
 * @制限事項 ユーザーテーブルに該当レコードが存在する必要がある
 */
export const authMiddleware: MiddlewareHandler = async (
    c: Context,
    next: Next
) => {
    try {
        // ガード句: Supabaseクライアント作成
        const supabase = createSupabaseClient(c.req.raw)
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        // ガード句: ユーザー認証チェック
        if (error || !user) {
            throw createUnauthorizedError()
        }

        // ガード句: ユーザーレコード存在チェック
        const d = await db.select({ users }).from(users).limit(1)

        if (!d[0]?.users) {
            throw createUnauthorizedError('User not found in database')
        }

        // ユーザー情報をコンテキストに保存
        c.set('user', d[0].users)
        c.set('supabase', supabase)

        await next()
    } catch (err) {
        console.error('Auth middleware error:', err)

        // ApiErrorの場合
        if (err instanceof ApiError) {
            const response = err.toStandardError()
            return c.json(response, err.status as any)
        }

        // その他の予期しないエラー
        return c.json(
            {
                title: 'システムエラー',
                message:
                    'システムで問題が発生しました。時間をおいて再度お試しください。',
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
            },
            500 as const
        )
    }
}

/**
 * グローバルエラーハンドリングミドルウェア
 * APIハンドラー外で発生したエラーをキャッチする
 */
export const errorMiddleware: MiddlewareHandler = async (
    c: Context,
    next: Next
) => {
    try {
        await next()
    } catch (err) {
        console.error('=== Global Error Middleware ===')
        console.error('Error:', err)
        console.error('Request URL:', c.req.url)
        console.error('Request method:', c.req.method)
        console.error('=== End Global Error ===')

        // ApiErrorクラスの場合
        if (err instanceof ApiError) {
            const response = err.toStandardError()
            return c.json(response, err.status as any)
        }

        // Zodバリデーションエラーの場合
        if (err instanceof ZodError) {
            return c.json(
                {
                    title: 'バリデーションエラー',
                    message: '入力内容に不備があります。',
                    code: 'VALIDATION_ERROR',
                    status: 422,
                    details: err.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    })),
                },
                422 as const
            )
        }

        // その他の予期しないエラー
        return c.json(
            {
                title: 'システムエラー',
                message:
                    'システムで問題が発生しました。時間をおいて再度お試しください。',
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
            },
            500 as const
        )
    }
}

/**
 * 共通CORS設定ミドルウェア
 * 全てのAPIで同じCORS設定を適用するために使用
 */
export const corsMiddleware = cors({
    origin: '*',
    allowHeaders: [
        'Authorization',
        'Content-Type',
        'Access-Control-Allow-Origin',
        'apikey',
        'x-client-info',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
})

/**
 * 共通OPTIONSハンドラー
 * プリフライトリクエストに対する統一したレスポンスを返す
 */
export const optionsHandler = (c: Context) => {
    return c.body(null, 204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
            'Authorization, Content-Type, apikey, x-client-info',
        'Access-Control-Max-Age': '86400',
    })
}

/**
 * 統一されたAPIエラークラス
 * StandardApiError形式に準拠したエラーハンドリングを提供
 */
export class ApiError extends Error {
    title: string
    status: number
    code: string
    details?: any
    override cause?: unknown

    constructor({
        title,
        status,
        message,
        code,
        details,
        cause,
    }: {
        title?: string
        status: number
        message: string
        code: string
        details?: any
        cause?: unknown
    }) {
        super(message)
        this.name = 'ApiError'
        this.title = title || 'エラーが発生しました'
        this.message = message
        this.status = status
        this.code = code
        this.details = details
        this.cause = cause
    }

    /**
     * StandardApiError形式のオブジェクトを返す
     */
    toStandardError() {
        return {
            title: this.title,
            message: this.message,
            code: this.code,
            status: this.status,
            details: this.details,
        }
    }
}

/**
 * エラーファクトリ関数
 * エラーコードから統一されたApiErrorを生成する
 */
export const createApiError = (
    code: ErrorCode,
    status: number,
    customMessage?: string,
    customTitle?: string,
    details?: any,
    cause?: unknown
): ApiError => {
    const { title, message } = getErrorMessage(code, customMessage, customTitle)

    return new ApiError({
        title,
        message,
        code,
        status,
        details,
        cause,
    })
}

/**
 * よく使用されるエラーパターンのヘルパー関数
 */
export const createUnauthorizedError = (customMessage?: string) =>
    createApiError(ERROR_CODES.UNAUTHORIZED, 401, customMessage)

export const createForbiddenError = (customMessage?: string) =>
    createApiError(ERROR_CODES.FORBIDDEN, 403, customMessage)

export const createNotFoundError = (customMessage?: string) =>
    createApiError(ERROR_CODES.NOT_FOUND, 404, customMessage)

export const createValidationError = (details?: any, customMessage?: string) =>
    createApiError(
        ERROR_CODES.VALIDATION_ERROR,
        422,
        customMessage,
        undefined,
        details
    )

export const createBadRequestError = (customMessage?: string) =>
    createApiError(ERROR_CODES.INVALID_REQUEST, 400, customMessage)

export const createInternalServerError = (
    customMessage?: string,
    cause?: unknown
) =>
    createApiError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        500,
        customMessage,
        undefined,
        undefined,
        cause
    )

/**
 * APIハンドラーをラップするユーティリティ関数
 * try-catchロジックを共通化し、エラーハンドリングを統一するために使用
 * SuccessResponseクラスを返した場合は自動的にJSONレスポンスに変換
 *
 * @param handler APIハンドラー関数
 * @returns ラップされたハンドラー関数
 */
export const apiHandler = <T>(
    handler: (c: Context) => Promise<T | SuccessResponse>
) => {
    return async (c: Context): Promise<Response> => {
        try {
            const result = await handler(c)

            // SuccessResponseクラスのインスタンスの場合、自動的にJSONレスポンスに変換
            if (result instanceof SuccessResponse) {
                return c.json(result.getData())
            }

            return result as Response
        } catch (error: unknown) {
            // エラー情報の詳細ログ出力
            console.error('=== API Handler Error Details ===')
            console.error('Error type:', error?.constructor?.name || 'Unknown')
            console.error(
                'Error message:',
                error instanceof Error ? error.message : 'No message'
            )
            console.error(
                'Error stack:',
                error instanceof Error ? error.stack : 'No stack trace'
            )
            console.error('Full error object:', error)
            console.error('Request URL:', c.req.url)
            console.error('Request method:', c.req.method)
            console.error('=== End Error Details ===')

            // Zodバリデーションエラーの場合
            if (error instanceof ZodError) {
                console.error(
                    'Zod validation error details:',
                    JSON.stringify(error.errors, null, 2)
                )
                const response = {
                    title: 'バリデーションエラー',
                    message: '入力内容に不備があります。内容をご確認ください。',
                    code: 'VALIDATION_ERROR',
                    status: 400,
                    details: error.errors,
                }
                return c.json(response, 400 as const)
            }

            // ApiErrorクラスの場合
            if (error instanceof ApiError) {
                console.error('ApiError details:', {
                    title: error.title,
                    message: error.message,
                    code: error.code,
                    status: error.status,
                    details: error.details,
                })

                // causeがある場合は詳細情報を出力
                if (error.cause) {
                    console.error('=== Error Cause Details ===')
                    console.error(
                        'Cause type:',
                        error.cause?.constructor?.name || 'Unknown'
                    )
                    console.error(
                        'Cause message:',
                        error.cause instanceof Error
                            ? error.cause.message
                            : String(error.cause)
                    )
                    console.error(
                        'Cause stack:',
                        error.cause instanceof Error
                            ? error.cause.stack
                            : 'No stack trace'
                    )
                    console.error('Full cause object:', error.cause)
                    console.error('=== End Error Cause Details ===')
                }

                const response = error.toStandardError()
                return c.json(response, error.status as any)
            }

            // その他の予期しないエラー
            console.error('Unexpected error - sending 500 response')
            console.error('Error details for debugging:', {
                errorType: typeof error,
                errorString: String(error),
                isError: error instanceof Error,
                hasMessage:
                    error && typeof error === 'object' && 'message' in error,
                hasStatus:
                    error && typeof error === 'object' && 'status' in error,
            })

            const response = {
                title: 'システムエラー',
                message:
                    'システムで問題が発生しました。時間をおいて再度お試しください。',
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
            }
            return c.json(response, 500 as const)
        }
    }
}

/**
 * バリデーション付きのAPIハンドラー
 * Zodスキーマを使用したリクエストボディのバリデーションとAPIハンドラーを組み合わせる
 * SuccessResponseクラスを返した場合は自動的にJSONレスポンスに変換
 *
 * @param schema Zodバリデーションスキーマ
 * @param handler APIハンドラー関数（バリデーション済みのデータを受け取る）
 * @returns ミドルウェア関数
 */
export const validatedApiHandler = <T>(
    schema: z.ZodType<T>,
    handler: (
        c: Context,
        validatedData: T
    ) => Promise<Response | SuccessResponse>
) => {
    return async (c: Context) => {
        try {
            // リクエストボディを取得してバリデーション
            let body
            try {
                body = await c.req.json()
            } catch {
                const response = new ApiError({
                    title: '不正なリクエスト',
                    message: 'JSONの形式が正しくありません。',
                    code: 'INVALID_JSON',
                    status: 400,
                }).toStandardError()

                return c.json(response, 400 as any)
            }

            // Zodでバリデーション
            const validatedData = schema.parse(body)

            // バリデーション済みのデータでハンドラーを実行
            const result = await handler(c, validatedData)

            // SuccessResponseクラスのインスタンスの場合、自動的にJSONレスポンスに変換
            if (result instanceof SuccessResponse) {
                return c.json(result.getData())
            }

            return result
        } catch (error: unknown) {
            // エラーログ出力
            console.error('=== Validated API Handler Error ===')
            console.error('Error:', error)
            console.error('Request URL:', c.req.url)
            console.error('Request method:', c.req.method)
            console.error('=== End Validated API Handler Error ===')

            // Zodバリデーションエラーの場合
            if (error instanceof ZodError) {
                // ZodErrorのissuesプロパティからエラー詳細を取得
                // Zodv3では、errorsプロパティはissuesのエイリアスです
                const errorDetails = error.issues || []

                const response = {
                    title: 'バリデーションエラー',
                    message: '入力内容に不備があります。内容をご確認ください。',
                    code: 'VALIDATION_ERROR',
                    status: 422,
                    details: errorDetails.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                }
                return c.json(response, 422 as const)
            }

            // ApiErrorクラスの場合
            if (error instanceof ApiError) {
                const response = error.toStandardError()
                return c.json(response, error.status as any)
            }

            // その他の予期しないエラー
            const response = {
                title: 'システムエラー',
                message:
                    'システムで問題が発生しました。時間をおいて再度お試しください。',
                code: 'INTERNAL_SERVER_ERROR',
                status: 500,
            }
            return c.json(response, 500 as const)
        }
    }
}

/**
 * 共通の初期設定を適用するAPI初期化関数
 * 新しいAPIモジュールを作成する際に使用
 *
 * @param basePath APIのベースパス（例: '/users-api'）
 * @returns 設定済みのHonoインスタンス
 *
 * @example
 * ```typescript
 * import { initApi, authMiddleware, apiHandler } from '../_shared/middlewares/middleware.ts'
 *
 * const app = initApi<{ Variables: Variables }>('/users-api')
 *
 * app.get(
 *   '/',
 *   authMiddleware,
 *   apiHandler(async (c) => {
 *     return c.json({ message: 'Users API is running' })
 *   })
 * )
 * ```
 */
export const initApi = <E extends Env = Env>(basePath: string) => {
    const app = new Hono<E>().basePath(basePath)

    // 共通ミドルウェアの適用
    app.use('*', corsMiddleware)
    app.options('*', optionsHandler)
    // 注意: errorMiddleware は最後に適用（他のミドルウェアのエラーをキャッチするため）
    app.use('*', errorMiddleware)

    // ヘルスチェックエンドポイント
    app.get('/health', (c) => {
        return c.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: basePath.replace('/', ''),
        })
    })

    return app
}

/**
 * 型安全な変数定義用のインターフェース
 * initApiで使用するVariablesの型定義
 */
export interface Variables {
    user?: any // ユーザー情報（authMiddlewareで設定）
    supabase?: any // Supabaseクライアント（authMiddlewareで設定）
    [key: string]: any // その他の変数
}
