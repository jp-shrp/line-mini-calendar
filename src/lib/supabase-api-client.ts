import { createSupabaseClient } from '@/db/supabase'
import type {
    EdgeFunctionOptions,
    StandardApiError,
    SuccessResponse,
} from '@/src/types/api'
import { isAuthError, parseErrorResponse } from './error-handler'

/**
 * Supabase Edge Functions用のAPIクライアント
 */
class SupabaseApiClient {
    private supabase = createSupabaseClient()

    /**
     * トークンリフレッシュ処理
     */
    private async refreshToken(): Promise<boolean> {
        try {
            const { data, error } = await this.supabase.auth.refreshSession()

            if (error || !data.session) {
                return false
            }

            return true
        } catch {
            return false
        }
    }

    /**
     * 認証エラー時の処理
     */
    private async handleAuthError(): Promise<boolean> {
        const refreshed = await this.refreshToken()

        if (!refreshed) {
            // リフレッシュ失敗時はログアウト
            await this.supabase.auth.signOut()
            return false
        }

        return true
    }

    /**
     * Edge Function呼び出しの共通処理
     */
    async callEdgeFunction<T>(
        functionName: string,
        body?: any,
        options: EdgeFunctionOptions = {},
        retryCount = 0
    ): Promise<T> {
        const { method = 'POST', headers = {}, skipAuth = false } = options

        // 認証トークンの取得
        let authHeader = ''
        if (!skipAuth) {
            const {
                data: { session },
            } = await this.supabase.auth.getSession()

            if (session?.access_token) {
                authHeader = `Bearer ${session.access_token}`
            }
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
                {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authHeader,
                        ...headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                }
            )

            // エラーレスポンスの処理
            if (!response.ok) {
                const error = await parseErrorResponse(response)

                // 401/403エラーの場合、トークンリフレッシュを試行（1回のみ）
                if (isAuthError(error) && retryCount === 0) {
                    const refreshed = await this.handleAuthError()

                    if (refreshed) {
                        // リフレッシュ成功時はリトライ
                        return await this.callEdgeFunction(
                            functionName,
                            body,
                            options,
                            retryCount + 1
                        )
                    }
                }

                throw error
            }

            // 成功レスポンスの処理
            const data: SuccessResponse<T> = await response.json()
            return data.data
        } catch (error) {
            // StandardApiError形式のエラーはそのままスロー
            if (
                error &&
                typeof error === 'object' &&
                'status' in error &&
                'code' in error
            ) {
                throw error
            }

            // その他のエラーはStandardApiError形式に変換
            const standardError: StandardApiError = {
                title: 'システムエラー',
                message:
                    error instanceof Error
                        ? error.message
                        : 'システムで問題が発生しました',
                code: 'INTERNAL_ERROR',
                status: 500,
            }
            throw standardError
        }
    }

    /**
     * GET リクエスト
     */
    async get<T>(
        functionName: string,
        params?: Record<string, any>,
        options?: EdgeFunctionOptions
    ): Promise<T> {
        // GETの場合、paramsをクエリストリングに変換
        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : ''
        const url = `${functionName}${queryString}`

        return this.callEdgeFunction<T>(url, undefined, {
            ...options,
            method: 'GET',
        })
    }

    /**
     * POST リクエスト
     */
    async post<T>(
        functionName: string,
        body?: any,
        options?: EdgeFunctionOptions
    ): Promise<T> {
        return this.callEdgeFunction<T>(functionName, body, {
            ...options,
            method: 'POST',
        })
    }

    /**
     * PUT リクエスト
     */
    async put<T>(
        functionName: string,
        body?: any,
        options?: EdgeFunctionOptions
    ): Promise<T> {
        return this.callEdgeFunction<T>(functionName, body, {
            ...options,
            method: 'PUT',
        })
    }

    /**
     * PATCH リクエスト
     */
    async patch<T>(
        functionName: string,
        body?: any,
        options?: EdgeFunctionOptions
    ): Promise<T> {
        return this.callEdgeFunction<T>(functionName, body, {
            ...options,
            method: 'PATCH',
        })
    }

    /**
     * DELETE リクエスト
     */
    async delete<T>(
        functionName: string,
        options?: EdgeFunctionOptions
    ): Promise<T> {
        return this.callEdgeFunction<T>(functionName, undefined, {
            ...options,
            method: 'DELETE',
        })
    }
}

// シングルトンインスタンスをエクスポート
export const supabaseApiClient = new SupabaseApiClient()
