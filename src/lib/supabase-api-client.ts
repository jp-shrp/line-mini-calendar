import type {
    EdgeFunctionOptions,
    StandardApiError,
    SuccessResponse,
} from '@/src/types/api'

/**
 * Supabase Edge Functions用のAPIクライアント
 */
class SupabaseApiClient {
    /**
     * Edge Function呼び出しの共通処理
     */
    async callEdgeFunction<T>(
        invoker: () => Promise<any>,
        options: EdgeFunctionOptions = {}
    ): Promise<T> {
        try {
            const response = await invoker()

            // エラーレスポンスの処理
            if (response.error) {
                const error: StandardApiError = {
                    title: options.error?.title || 'エラーが発生しました',
                    message:
                        options.error?.message ||
                        response.error.message ||
                        '処理中にエラーが発生しました',
                    code: response.error.code || 'EDGE_FUNCTION_ERROR',
                    status: response.error.status || 500,
                }
                throw error
            }

            // 成功レスポンスの処理
            const data: SuccessResponse<T> = response.data
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
                title: options.error?.title || 'システムエラー',
                message:
                    options.error?.message ||
                    (error instanceof Error
                        ? error.message
                        : 'システムで問題が発生しました'),
                code: 'INTERNAL_ERROR',
                status: 500,
            }
            throw standardError
        }
    }
}

// シングルトンインスタンスをエクスポート
export const supabaseApiClient = new SupabaseApiClient()
