import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query'
import { isValidationError } from './error-handler'

/**
 * グローバルエラーハンドラー
 * ClientWrapperから設定される
 */
let globalErrorHandler: ((error: unknown) => void) | null = null

/**
 * グローバルエラーハンドラーを設定
 * @param handler エラーハンドラー関数
 */
export function setGlobalErrorHandler(handler: (error: unknown) => void) {
    globalErrorHandler = handler
}

/**
 * React Query用のQueryClientインスタンス
 *
 * QueryCache/MutationCacheレベルでエラーハンドラーを設定し、全てのクエリ・ミューテーションのエラーを自動的に処理する
 * - 422バリデーションエラーは個別処理に任せる
 * - その他のエラーはグローバルエラーハンドラーで処理（モーダル表示）
 * - meta.suppressErrorModal = true の場合はモーダル表示をスキップ
 */
export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            // meta.suppressErrorModal が true の場合はモーダル表示をスキップ
            const suppressErrorModal = query.meta?.suppressErrorModal as
                | boolean
                | undefined

            // 422バリデーションエラーは個別処理に任せる
            // suppressErrorModalがtrueの場合もスキップ
            if (
                !isValidationError(error) &&
                !suppressErrorModal &&
                globalErrorHandler
            ) {
                globalErrorHandler(error)
            }
        },
    }),
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            // meta.suppressErrorModal が true の場合はモーダル表示をスキップ
            const suppressErrorModal = mutation.meta?.suppressErrorModal as
                | boolean
                | undefined

            // 422バリデーションエラーは個別処理に任せる
            // suppressErrorModalがtrueの場合もスキップ
            if (
                !isValidationError(error) &&
                !suppressErrorModal &&
                globalErrorHandler
            ) {
                globalErrorHandler(error)
            }
        },
    }),
    defaultOptions: {
        queries: {
            retry: false, // エラー時の自動リトライを無効化
            staleTime: 5 * 60 * 1000, // 5分
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false, // エラー時の自動リトライを無効化
        },
    },
})
