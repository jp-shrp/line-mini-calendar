'use client'
import { createSupabaseClient } from '@/db/supabase'
import { useModal } from '@/src/contexts/ModalContext'
import { sessionService } from '@/src/services/auth/sessionService'
import type { StandardApiError } from '@/types/errors'
import {
    AuthResponse,
    FunctionsHttpError,
    PostgrestSingleResponse,
} from '@supabase/supabase-js'

const _supabase = createSupabaseClient()

/**
 * バリデーションエラーの詳細
 */
export type ValidationErrorDetail = {
    field: string
    message: string
}

/**
 * 処理済みエラーを示すカスタムエラークラス
 */
export class ProcessedError extends Error {
    public readonly title: string
    public readonly validationErrors?: ValidationErrorDetail[]

    constructor(
        message: string,
        title: string = 'エラー',
        validationErrors?: ValidationErrorDetail[]
    ) {
        super(message)
        this.name = 'ProcessedError'
        this.title = title
        this.validationErrors = validationErrors
    }
}

/**
 * callFunction用の共通Result型
 * エラーの場合もそうでない場合も統一された形式でデータアクセスを可能にする
 */
export type CallFunctionResult<T> = {
    data: T | null
    error: boolean
    success: boolean
    validationErrors?: ValidationErrorDetail[]
}

/**
 * Supabase API呼び出し用のカスタムフック
 *
 * @features
 * - シンプルで直感的なインターフェース
 * - 統一されたエラーハンドリング
 * - 認証エラー時の自動ログアウト
 * - StandardApiError形式への対応
 * - エラーモーダルの自動表示
 */
export const useCallSupabase = () => {
    const { openModal } = useModal()

    /**
     * 401エラー時のトークンリフレッシュ処理
     * Supabaseが自動的にトークンをリフレッシュするため、
     * 明示的なリフレッシュ処理は不要
     * @returns リフレッシュ成功時true、失敗時false
     */
    const handleTokenRefresh = async (): Promise<boolean> => {
        try {
            const refreshResult = await sessionService.refreshSupabaseSession()

            if (!refreshResult.success || !refreshResult.accessToken) {
                return false
            }

            const session = await sessionService.getSession()

            if (!session) {
                return false
            }

            if (session.type === 'anonymous') {
                await sessionService.saveAnonymousSession({
                    userId: session.data.userId,
                    accessToken: refreshResult.accessToken,
                    refreshToken:
                        refreshResult.refreshToken || session.data.refreshToken,
                    expiresAt: Date.now() + 3600000,
                })
            }

            return true
        } catch {
            return false
        }
    }

    /**
     * 認証エラー時の処理
     * @param status HTTPステータスコード
     */
    const handleAuthError = async (status: number): Promise<boolean> => {
        if (status === 401 || status === 403) {
            const refreshed = await handleTokenRefresh()

            if (!refreshed) {
                await sessionService.clearAllSessions()
                await _supabase.auth.signOut()
            }

            return refreshed
        }
        return false
    }

    /**
     * エラーハンドリングの共通処理
     * @param error 発生したエラーオブジェクト
     * @param fallbackMessage デフォルトエラーメッセージ
     * @param title エラーモーダルのタイトル
     * @param noModal モーダル表示を抑制するフラグ
     * @throws ProcessedError 処理済みエラーとしてスロー
     */
    const handleError = async (
        error: unknown,
        fallbackMessage?: string,
        title?: string,
        noModal?: boolean
    ) => {
        if (error instanceof ProcessedError) {
            throw error
        }

        // HTTPステータスを取得
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any)?.status || (error as any)?.context?.status

        // 認証エラーの場合はモーダル表示なし（既に401ハンドラで処理済み）
        if (status === 401 || status === 403) {
            return
        }

        let errorMessage = fallbackMessage || '時間を置いて試してください'
        let errorTitle = title || 'エラーが発生しました'

        if (isStandardApiError(error)) {
            const { title: stdTitle, message } = error
            errorTitle = title || stdTitle
            errorMessage = fallbackMessage || message
        }

        if (!noModal) {
            openModal({
                title: errorTitle,
                message: errorMessage,
                type: 'error',
            })
        }

        return null
    }

    /**
     * StandardApiError形式かどうかを判定
     */
    const isStandardApiError = (error: unknown): error is StandardApiError => {
        return (
            error !== null &&
            typeof error === 'object' &&
            'title' in error &&
            'message' in error &&
            'code' in error &&
            'status' in error
        )
    }

    /**
     * バリデーションエラー（422）かどうかを判定
     */
    const isValidationError = (error: unknown): boolean => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return isStandardApiError(error) && (error as any).status === 422
    }

    /**
     * バリデーションエラーの詳細を抽出
     */
    const extractValidationErrors = (
        error: unknown
    ): ValidationErrorDetail[] | undefined => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const details = (error as any)?.details
        if (Array.isArray(details)) {
            return details as ValidationErrorDetail[]
        }
        return undefined
    }

    /**
     * FunctionsHttpErrorからエラー情報を解析する共通処理
     */
    const parseHttpError = async (
        error: FunctionsHttpError
    ): Promise<unknown> => {
        // 方法1: context.bodyから取得
        const raw = error.context?.body
        if (raw) {
            try {
                const parsed = await new Response(raw).json()
                console.log(parsed, 'parsedError from context.body')
                return parsed
            } catch (parseError) {
                console.warn('Failed to parse context.body:', parseError)
            }
        }

        // 方法2: errorオブジェクト自体がStandardApiError形式の場合
        if (isStandardApiError(error)) {
            console.log(error, 'parsedError from error object itself')
            return error
        }

        // フォールバック: システムエラー形式で作成
        return {
            title: 'システムエラー',
            message:
                error.context?.statusText || 'システムで問題が発生しました',
            code: 'PARSE_ERROR',
            status: error.context?.status || 500,
        }
    }

    /**
     * Edge Functions呼び出し（Result型対応）
     * @param func 実行する関数（Supabase invoke呼び出し）
     * @param errorOptions エラーハンドリングオプション
     * @returns Result型オブジェクト（data、error、successプロパティを持つ）
     */
    const callFunction = async <T>(
        func: () => ReturnType<typeof _supabase.functions.invoke<T>>,
        errorOptions?: {
            title?: string
            message?: string
            handle?: (res: Awaited<ReturnType<typeof func>>) => void
            noModal?: boolean
        },
        retryCount = 0
    ): Promise<CallFunctionResult<T>> => {
        try {
            const response = await func()

            if (response.error) {
                throw response.error
            }

            return {
                data: response.data,
                error: false,
                success: true,
            }
        } catch (error) {
            const httpError = error as FunctionsHttpError
            const parsedError = await parseHttpError(httpError)

            const errorWithStatus = {
                ...(typeof parsedError === 'object' && parsedError !== null
                    ? parsedError
                    : {}),
                status:
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (parsedError as any)?.status ||
                    httpError.context?.status ||
                    500,
            }

            // 401エラーの場合、トークンリフレッシュを試行（1回のみ）
            if (
                (errorWithStatus.status === 401 ||
                    errorWithStatus.status === 403) &&
                retryCount === 0
            ) {
                const refreshed = await handleAuthError(errorWithStatus.status)

                if (refreshed) {
                    return await callFunction(
                        func,
                        errorOptions,
                        retryCount + 1
                    )
                }

                return {
                    data: null,
                    error: true,
                    success: false,
                }
            }

            // バリデーションエラー（422）の場合
            if (isValidationError(errorWithStatus)) {
                const validationErrors =
                    extractValidationErrors(errorWithStatus)

                if (!errorOptions?.noModal) {
                    openModal({
                        title: errorOptions?.title || 'バリデーションエラー',
                        message:
                            errorOptions?.message ||
                            '入力内容に不備があります。内容をご確認ください。',
                        type: 'error',
                    })
                }

                return {
                    data: null,
                    error: true,
                    success: false,
                    validationErrors,
                }
            }

            await handleError(
                errorWithStatus,
                errorOptions?.message,
                errorOptions?.title,
                errorOptions?.noModal
            )

            return {
                data: null,
                error: true,
                success: false,
            }
        }
    }

    /**
     * PostgREST API呼び出し
     * @param func PostgRESTクエリ関数
     * @param errorOptions エラーハンドリングオプション
     * @returns レスポンスオブジェクト（直接アクセス可能）
     */
    const callSupabase = async <T>(
        func: () => Promise<PostgrestSingleResponse<T>>,
        errorOptions?: {
            title?: string
            message?: string
            handle?: (res: PostgrestSingleResponse<T>) => void
        }
    ): Promise<Awaited<ReturnType<typeof func>>> => {
        try {
            const response = await func()

            if (response.error) {
                console.error('Database query error:', response.error)
                errorOptions?.handle?.(response)
                throw response.error
            }

            return response
        } catch (error) {
            await handleError(error, errorOptions?.message, errorOptions?.title)
            throw error
        }
    }

    /**
     * 認証API呼び出し
     * @param func 認証関数
     * @param errorOptions エラーハンドリングオプション
     * @returns レスポンスオブジェクト（直接アクセス可能）
     */
    const callAuth = async (
        func: () => Promise<AuthResponse>,
        errorOptions?: {
            title?: string
            message?: string
            handle?: (res: AuthResponse) => void
        }
    ): Promise<Awaited<ReturnType<typeof func>>> => {
        try {
            const response = await func()

            if (response.error) {
                console.error('Auth error:', response.error)
                errorOptions?.handle?.(response)
                throw response.error
            }

            return response
        } catch (error) {
            await handleError(error, errorOptions?.message, errorOptions?.title)
            throw error
        }
    }

    return {
        callFunction,
        callSupabase,
        callAuth,
        ProcessedError,
    }
}
