'use client'

import { createSupabaseClient } from '@/db/supabase'
import {
    extractValidationErrors,
    isValidationError,
} from '@/src/lib/error-handler'
import { supabaseApiClient } from '@/src/lib/supabase-api-client'
import type { EdgeFunctionOptions, StandardApiError } from '@/src/types/api'
import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
    useQueryClient,
} from '@tanstack/react-query'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

/**
 * 基本版のuseSupabaseMutationオプション
 */
export interface UseSupabaseMutationOptions<TData = any, TVariables = any>
    extends Omit<
        UseMutationOptions<TData, StandardApiError, TVariables>,
        'mutationFn'
    > {
    functionName: string
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    edgeOptions?: EdgeFunctionOptions
    invalidateQueries?: string[]
}

/**
 * フォーム連携版のオプション
 */
export interface UseSupabaseMutationFormOptions<TData = any, TForm = any>
    extends Omit<
        UseMutationOptions<TData, StandardApiError, TForm>,
        'mutationFn'
    > {
    functionName: string
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    edgeOptions?: EdgeFunctionOptions
    invalidateQueries?: string[]
}

/**
 * 基本版のuseSupabaseMutation
 */
export function useSupabaseMutation<TData = any, TVariables = any>(
    options: UseSupabaseMutationOptions<TData, TVariables>
): UseMutationResult<TData, StandardApiError, TVariables>

/**
 * フォーム連携版のuseSupabaseMutation
 */
export function useSupabaseMutation<
    TData = any,
    TForm extends FieldValues = any,
>(
    form: UseFormReturn<TForm>,
    options: UseSupabaseMutationFormOptions<TData, TForm>
): UseMutationResult<TData, StandardApiError, TForm>

/**
 * 実装
 */
export function useSupabaseMutation<TData = any, TVariables = any>(
    formOrOptions:
        | UseFormReturn<any>
        | UseSupabaseMutationOptions<TData, TVariables>,
    formOptions?: UseSupabaseMutationFormOptions<TData, any>
) {
    const queryClient = useQueryClient()

    // フォーム連携版かどうかを判定
    const isFormVersion = formOrOptions && 'setError' in formOrOptions

    if (isFormVersion && formOptions) {
        // フォーム連携版の実装
        const form = formOrOptions as UseFormReturn<any>
        const {
            functionName,
            method = 'POST',
            edgeOptions,
            invalidateQueries = [],
            ...mutationOptions
        } = formOptions

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: any) => {
                const supabase = createSupabaseClient()
                return await supabaseApiClient.callEdgeFunction<TData>(
                    async () => {
                        return supabase.functions.invoke(functionName, {
                            method,
                            body:
                                method === 'DELETE'
                                    ? undefined
                                    : (variables as any),
                        })
                    },
                    edgeOptions
                )
            },
            onSuccess: async (data, variables, context) => {
                // キャッシュ無効化
                for (const queryKey of invalidateQueries) {
                    await queryClient.invalidateQueries({
                        queryKey: [queryKey],
                    })
                }

                if (mutationOptions.onSuccess) {
                    ;(mutationOptions.onSuccess as any)(
                        data,
                        variables,
                        context
                    )
                }
            },
            onError: (error: StandardApiError, variables, context) => {
                // バリデーションエラーの場合、フォームにエラーをセット
                if (isValidationError(error)) {
                    const validationErrors = extractValidationErrors(error)

                    form.clearErrors()
                    validationErrors?.forEach(({ field, message }) => {
                        form.setError(field as Path<any>, {
                            type: 'server',
                            message,
                        })
                    })
                }

                if (mutationOptions.onError) {
                    ;(mutationOptions.onError as any)(error, variables, context)
                }
            },
        })
    } else {
        // 基本版の実装
        const {
            functionName,
            method = 'POST',
            edgeOptions,
            invalidateQueries = [],
            ...mutationOptions
        } = formOrOptions as UseSupabaseMutationOptions<TData, TVariables>

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: TVariables) => {
                const supabase = createSupabaseClient()
                return await supabaseApiClient.callEdgeFunction<TData>(
                    async () => {
                        return supabase.functions.invoke(functionName, {
                            method,
                            body:
                                method === 'DELETE'
                                    ? undefined
                                    : (variables as any),
                        })
                    },
                    edgeOptions
                )
            },
            onSuccess: async (data, variables, context) => {
                // キャッシュ無効化
                for (const queryKey of invalidateQueries) {
                    await queryClient.invalidateQueries({
                        queryKey: [queryKey],
                    })
                }

                if (mutationOptions.onSuccess) {
                    ;(mutationOptions.onSuccess as any)(
                        data,
                        variables,
                        context
                    )
                }
            },
        })
    }
}
