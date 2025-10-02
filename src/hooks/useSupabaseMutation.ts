'use client'

import { useModal } from '@/src/contexts/ModalContext'
import {
    extractValidationErrors,
    getErrorMessage,
    isStandardApiError,
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
    showErrorModal?: boolean
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
    showErrorModal?: boolean
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
    const { openModal } = useModal()

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
            showErrorModal = true,
            ...mutationOptions
        } = formOptions

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: any) => {
                const methodMap = {
                    POST: supabaseApiClient.post.bind(supabaseApiClient),
                    PUT: supabaseApiClient.put.bind(supabaseApiClient),
                    PATCH: supabaseApiClient.patch.bind(supabaseApiClient),
                    DELETE: supabaseApiClient.delete.bind(supabaseApiClient),
                }

                const apiMethod = methodMap[method]
                if (method === 'DELETE') {
                    return await supabaseApiClient.delete<TData>(
                        functionName,
                        edgeOptions
                    )
                }
                return await apiMethod<TData>(
                    functionName,
                    variables,
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

                    if (showErrorModal) {
                        openModal({
                            title: error.title || 'バリデーションエラー',
                            content:
                                error.message ||
                                '入力内容に不備があります。内容をご確認ください。',
                            type: 'error',
                        })
                    }
                } else if (showErrorModal) {
                    // その他のエラーの場合、モーダル表示
                    openModal({
                        title: error.title || 'エラーが発生しました',
                        content: getErrorMessage(error),
                        type: 'error',
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
            showErrorModal = true,
            ...mutationOptions
        } = formOrOptions as UseSupabaseMutationOptions<TData, TVariables>

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: TVariables) => {
                const methodMap = {
                    POST: supabaseApiClient.post.bind(supabaseApiClient),
                    PUT: supabaseApiClient.put.bind(supabaseApiClient),
                    PATCH: supabaseApiClient.patch.bind(supabaseApiClient),
                    DELETE: supabaseApiClient.delete.bind(supabaseApiClient),
                }

                const apiMethod = methodMap[method]
                if (method === 'DELETE') {
                    return await supabaseApiClient.delete<TData>(
                        functionName,
                        edgeOptions
                    )
                }
                return await apiMethod<TData>(
                    functionName,
                    variables,
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
                if (showErrorModal && isStandardApiError(error)) {
                    openModal({
                        title: error.title || 'エラーが発生しました',
                        content: getErrorMessage(error),
                        type: 'error',
                    })
                }

                if (mutationOptions.onError) {
                    ;(mutationOptions.onError as any)(error, variables, context)
                }
            },
        })
    }
}
