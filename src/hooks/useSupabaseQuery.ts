'use client'

import { useModal } from '@/src/contexts/ModalContext'
import { getErrorMessage, isStandardApiError } from '@/src/lib/error-handler'
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
    showErrorModal?: boolean
}

/**
 * Supabase Edge FunctionsからデータをfetchするReact Queryフック
 *
 * @example
 * // 基本的な使い方
 * const { data, isLoading, error } = useSupabaseQuery({
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
 * // エラーモーダルを無効化
 * const { data } = useSupabaseQuery({
 *   queryKey: ['users'],
 *   functionName: 'samples-api/users',
 *   showErrorModal: false,
 * })
 */
export function useSupabaseQuery<TData = any>({
    queryKey,
    functionName,
    params,
    edgeOptions,
    showErrorModal = true,
    enabled = true,
    ...queryOptions
}: UseSupabaseQueryOptions<TData>) {
    const { openModal } = useModal()

    return useQuery<TData, StandardApiError>({
        queryKey,
        queryFn: async () => {
            return await supabaseApiClient.get<TData>(
                functionName,
                params,
                edgeOptions
            )
        },
        enabled,
        ...queryOptions,
        // エラー時の処理をラップ
        throwOnError: (error, query) => {
            if (showErrorModal && isStandardApiError(error)) {
                openModal({
                    title: error.title || 'エラーが発生しました',
                    content: getErrorMessage(error),
                    type: 'error',
                })
            }

            // デフォルトの動作を維持
            const throwOnErrorOption = queryOptions.throwOnError
            if (typeof throwOnErrorOption === 'function') {
                return throwOnErrorOption(error, query)
            }
            return throwOnErrorOption ?? false
        },
    })
}
