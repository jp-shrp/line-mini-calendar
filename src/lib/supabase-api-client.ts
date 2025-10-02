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
                // response.responseオブジェクトからHTTPステータスコードとレスポンスボディを取得
                const httpResponse = response.response as any
                const httpStatus = httpResponse?.status || 500

                // レスポンスボディをJSONとして取得
                let errorBody: any = null
                try {
                    // Supabase Edge Functionsからのレスポンスは既にクライアントによってパースされている可能性がある
                    // response.dataにnullが入っているが、エラーの詳細はresponse.responseから取得する必要がある

                    // HTTPレスポンスボディを読み取る
                    // 注: Fetch APIのResponseオブジェクトの場合、bodyは既に消費されている可能性がある
                    // Supabaseクライアントがエラー時にボディを読み取っていない可能性を考慮

                    // まず、error.contextをチェック
                    if (response.error.context && Object.keys(response.error.context).length > 0) {
                        errorBody = response.error.context
                    }
                    // 次に、response.error.messageがJSON文字列かチェック
                    else if (
                        typeof response.error.message === 'string' &&
                        response.error.message.trim().startsWith('{')
                    ) {
                        errorBody = JSON.parse(response.error.message)
                    }
                    // HTTPレスポンスから直接読み取れるか試行
                    else if (httpResponse) {
                        // cloneしてtextを読み取ることを試みる
                        // ただし、既に消費されている場合は失敗する
                        try {
                            const responseClone = httpResponse.clone?.()
                            if (responseClone && typeof responseClone.text === 'function') {
                                const bodyText = await responseClone.text()
                                if (bodyText && bodyText.trim().startsWith('{')) {
                                    errorBody = JSON.parse(bodyText)
                                }
                            }
                        } catch (cloneError) {
                            // clone/text読み取りに失敗した場合は無視
                            console.log('Failed to read response body:', cloneError)
                        }
                    }
                } catch (parseError) {
                    console.log('Error parsing response body:', parseError)
                    // パースに失敗した場合は無視
                }

                // エラーボディから情報を取得、なければデフォルト値を使用
                const error: StandardApiError = {
                    title:
                        errorBody?.title ||
                        options.error?.title ||
                        'エラーが発生しました',
                    message:
                        errorBody?.message ||
                        options.error?.message ||
                        response.error.message ||
                        '処理中にエラーが発生しました',
                    code:
                        errorBody?.code ||
                        response.error.code ||
                        'EDGE_FUNCTION_ERROR',
                    status: errorBody?.status || httpStatus,
                    details: errorBody?.details,
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
