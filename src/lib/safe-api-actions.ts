import { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import {
    safePost,
    safeGet,
    safePut,
    safeDelete,
    isValidationError,
    safePatch,
} from './safe-fetch'

export interface ApiActionOptions<T extends FieldValues, TData = any> {
    setError: UseFormSetError<T>
    onSuccess?: (data: TData) => void
    onError?: (error: string) => void
    resetForm?: () => void
    setLoading?: (loading: boolean) => void
    setGlobalLoading?: (loading: boolean, message?: string) => void // グローバルローディング用
}

export type ActionOptions = Omit<
    ApiActionOptions<any, any>,
    'setError' | 'resetForm'
>

export interface ApiActionResult<TData = any> {
    success: boolean
    data?: TData
    error?: string
}

// POST用のフォームアクション
export const createFormPostAction = <T extends FieldValues, TData = any>(
    url: string,
    options: ApiActionOptions<T, TData>
) => {
    return async (formData: T): Promise<ApiActionResult<TData>> => {
        const {
            setError,
            onSuccess,
            onError,
            resetForm,
            setLoading,
            setGlobalLoading,
        } = options

        setLoading?.(true)
        setGlobalLoading?.(true, 'データを送信しています...')

        const result = await safePost<TData>(url, formData)

        setLoading?.(false)
        setGlobalLoading?.(false)

        if (!result.success) {
            if (isValidationError(result)) {
                // Laravelのバリデーションエラーをreact-hook-formのエラーに設定
                Object.entries(result.validationErrors!).forEach(
                    ([field, messages]) => {
                        setError(field as Path<T>, {
                            type: 'server',
                            message: messages[0],
                        })
                    }
                )
            } else {
                // その他のエラー
                const errorMessage = result.error || 'エラーが発生しました'
                setError('root' as Path<T>, {
                    type: 'server',
                    message: errorMessage,
                })
                onError?.(errorMessage)
            }
            return {
                success: false,
                error: result.error || 'エラーが発生しました',
            }
        }

        // 成功時の処理
        resetForm?.()
        if (result.data !== null) {
            onSuccess?.(result.data)
        }

        return { success: true, data: result.data || undefined }
    }
}

// PUT用のフォームアクション
export const createFormPutAction = <T extends FieldValues, TData = any>(
    url: string,
    options: ApiActionOptions<T, TData>
) => {
    return async (formData: T): Promise<ApiActionResult<TData>> => {
        const {
            setError,
            onSuccess,
            onError,
            resetForm,
            setLoading,
            setGlobalLoading,
        } = options

        setLoading?.(true)
        setGlobalLoading?.(true, 'データを更新しています...')

        const result = await safePut<TData>(url, formData)

        setLoading?.(false)
        setGlobalLoading?.(false)

        if (!result.success) {
            if (isValidationError(result)) {
                Object.entries(result.validationErrors!).forEach(
                    ([field, messages]) => {
                        setError(field as Path<T>, {
                            type: 'server',
                            message: messages[0],
                        })
                    }
                )
            } else {
                const errorMessage = result.error || 'エラーが発生しました'
                setError('root' as Path<T>, {
                    type: 'server',
                    message: errorMessage,
                })
                onError?.(errorMessage)
            }
            return {
                success: false,
                error: result.error || 'エラーが発生しました',
            }
        }

        resetForm?.()
        if (result.data !== null) {
            onSuccess?.(result.data)
        }

        return { success: true, data: result.data || undefined }
    }
}

// PATCH用のフォームアクション
export const createFormPatchAction = <T extends FieldValues, TData = any>(
    url: string,
    options: ApiActionOptions<T, TData>
) => {
    return async (formData: T): Promise<ApiActionResult<TData>> => {
        const {
            setError,
            onSuccess,
            onError,
            resetForm,
            setLoading,
            setGlobalLoading,
        } = options

        setLoading?.(true)
        setGlobalLoading?.(true, 'データを送信しています...')

        const result = await safePatch<TData>(url, formData)

        setLoading?.(false)
        setGlobalLoading?.(false)

        if (!result.success) {
            if (isValidationError(result)) {
                // Laravelのバリデーションエラーをreact-hook-formのエラーに設定
                Object.entries(result.validationErrors!).forEach(
                    ([field, messages]) => {
                        setError(field as Path<T>, {
                            type: 'server',
                            message: messages[0],
                        })
                    }
                )
            } else {
                // その他のエラー
                const errorMessage = result.error || 'エラーが発生しました'
                setError('root' as Path<T>, {
                    type: 'server',
                    message: errorMessage,
                })
                onError?.(errorMessage)
            }
            return {
                success: false,
                error: result.error || 'エラーが発生しました',
            }
        }

        // 成功時の処理
        resetForm?.()
        if (result.data !== null) {
            onSuccess?.(result.data)
        }

        return { success: true, data: result.data || undefined }
    }
}

// GET用のアクション（主にデータ取得用）
export const createDataFetchAction = <TData = any>(
    url: string,
    options: Omit<ApiActionOptions<any, TData>, 'setError' | 'resetForm'> = {}
) => {
    return async (): Promise<ApiActionResult<TData>> => {
        const { onSuccess, onError, setLoading, setGlobalLoading } = options

        setLoading?.(true)
        setGlobalLoading?.(true, 'データを取得しています...')

        const result = await safeGet<TData>(url)

        setLoading?.(false)
        setGlobalLoading?.(false)

        if (!result.success) {
            const errorMessage = result.error || 'データの取得に失敗しました'
            onError?.(errorMessage)
            return { success: false, error: errorMessage }
        }

        if (result.data !== null) {
            onSuccess?.(result.data)
        }
        return { success: true, data: result.data || undefined }
    }
}

// DELETE用のアクション
export const createRemoveAction = (
    url: string,
    options: Omit<
        ApiActionOptions<any, void>,
        'setError' | 'resetForm' | 'onSuccess'
    > & { onSuccess?: () => void } = {}
) => {
    return async (): Promise<ApiActionResult<void>> => {
        const { onSuccess, onError, setLoading, setGlobalLoading } = options

        setLoading?.(true)
        setGlobalLoading?.(true, 'データを削除しています...')

        const result = await safeDelete(url)

        setLoading?.(false)
        setGlobalLoading?.(false)

        if (!result.success) {
            const errorMessage = result.error || '削除に失敗しました'
            onError?.(errorMessage)
            return { success: false, error: errorMessage }
        }

        onSuccess?.()
        return { success: true }
    }
}

// React Hook Form用のカスタムフック
export const useApiActions = <T extends FieldValues>(
    form: {
        setError: UseFormSetError<T>
        reset: () => void
    },
    options: Omit<ApiActionOptions<T, any>, 'setError' | 'resetForm'> = {}
) => {
    const createPostAction = <TData = any>(url: string) =>
        createFormPostAction<T, TData>(url, {
            setError: form.setError,
            resetForm: form.reset,
            ...options,
        })

    const createPutAction = <TData = any>(url: string) =>
        createFormPutAction<T, TData>(url, {
            setError: form.setError,
            resetForm: form.reset,
            ...options,
        })

    const createPatchAction = <TData = any>(url: string) =>
        createFormPatchAction<T, TData>(url, {
            setError: form.setError,
            resetForm: form.reset,
            ...options,
        })

    return {
        createPostAction,
        createPutAction,
        createPatchAction,
    }
}
