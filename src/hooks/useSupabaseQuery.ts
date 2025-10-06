'use client'

import { createSupabaseClient } from '@/db/supabase'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'
import type { EdgeFunctionOptions, StandardApiError } from '@/src/types/api'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

/**
 * useSupabaseQueryのオプション
 */
export interface UseSupabaseQueryOptions<TData = any>
    extends Omit<
        UseQueryOptions<TData, StandardApiError>,
        'queryKey' | 'queryFn'
    > {
    queryKey: string[]
    functionName: string
    params?: Record<string, any>
    edgeOptions?: EdgeFunctionOptions
    /**
     * エラーモーダルの自動表示を抑制するかどうか
     * trueの場合、エラーが発生してもモーダルは表示されません
     * デフォルト: false（モーダル表示する）
     */
    suppressErrorModal?: boolean
}

/**
 * Supabase Edge FunctionsからデータをfetchするReact Queryフック
 *
 * エラーは自動的にグローバルエラーハンドラーでモーダル表示されます。
 * 422バリデーションエラーは個別処理が必要な場合にのみonErrorオプションを使用してください。
 *
 * @example
 * // 基本的な使い方（エラーは自動でモーダル表示）
 * const { data, isLoading } = useSupabaseQuery({
 *   queryKey: ['users'],
 *   functionName: 'samples-api/users',
 * })
 *
 * @example
 * // パラメータを指定
 * const { data } = useSupabaseQuery({
 *   queryKey: ['users', userId],
 *   functionName: 'samples-api/users',
 *   params: { id: userId },
 * })
 *
 * @example
 * // エラーモーダルを表示せず、自分でエラー処理する場合
 * const { data, error } = useSupabaseQuery({
 *   queryKey: ['users'],
 *   functionName: 'samples-api/users',
 *   suppressErrorModal: true, // モーダル表示を抑制
 * })
 *
 * @example
 * // カスタムエラーハンドリング（モーダルも表示される）
 * const { data } = useSupabaseQuery({
 *   queryKey: ['users'],
 *   functionName: 'samples-api/users',
 *   onError: (error) => {
 *     // カスタム処理
 *     // グローバルエラーハンドラーも実行されます
 *   }
 * })
 */
export function useSupabaseQuery<TData = any>({
    queryKey,
    functionName,
    params,
    edgeOptions,
    enabled = true,
    suppressErrorModal = false,
    ...queryOptions
}: UseSupabaseQueryOptions<TData>) {
    // GETの場合、paramsをクエリストリングに変換
    const functionNameWithParams = params
        ? `${functionName}?${new URLSearchParams(params).toString()}`
        : functionName

    return useQuery<TData, StandardApiError>({
        queryKey,
        queryFn: async () => {
            const supabase = createSupabaseClient()
            return await supabaseApiClient.callEdgeFunction<TData>(async () => {
                return supabase.functions.invoke(functionNameWithParams, {
                    method: 'GET',
                })
            }, edgeOptions)
        },
        enabled,
        meta: {
            suppressErrorModal,
        },
        ...queryOptions,
    })
}
