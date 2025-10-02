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
 * // カスタムエラーハンドリング
 * const { data, error } = useSupabaseQuery({
 *   queryKey: ['users'],
 *   functionName: 'samples-api/users',
 * })
 *
 * if (error) {
 *   // エラー処理
 * }
 */
export function useSupabaseQuery<TData = any>({
    queryKey,
    functionName,
    params,
    edgeOptions,
    enabled = true,
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
            return await supabaseApiClient.callEdgeFunction<TData>(
                async () => {
                    return supabase.functions.invoke(functionNameWithParams, {
                        method: 'GET',
                    })
                },
                edgeOptions
            )
        },
        enabled,
        ...queryOptions,
    })
}
