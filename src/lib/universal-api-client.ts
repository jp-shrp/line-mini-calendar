import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query'
import Cookies from 'js-cookie'
import {
    FieldValues,
    Path,
    UseFormReturn,
    UseFormSetError,
} from 'react-hook-form'

// 基本型定義
export interface ApiClientConfig {
    baseUrl?: string
    defaultHeaders?: Record<string, string>
    timeout?: number
    retries?: number
    retryDelay?: number
}

// Fetch オプション（safe-fetchから統合）
export interface SafeFetchOptions extends RequestInit {
    timeout?: number
    retries?: number
    retryDelay?: number
}

// Laravel エラーレスポンス型
export interface LaravelErrorResponse {
    message: string
    errors?: Record<string, string[]>
    exception?: string
    file?: string
    line?: number
    trace?: any[]
}

// カスタムエラークラス
export class SafeFetchError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: Response,
        public validationErrors?: Record<string, string[]>
    ) {
        super(message)
        this.name = 'SafeFetchError'
    }
}

export interface ValidationErrors {
    [field: string]: string[]
}

export interface ApiError {
    message: string
    status: number
    validationErrors?: ValidationErrors
    code?: string
}

export type ApiResult<T> = {
    data: T | null
    error: boolean
    success: boolean
    message?: string
    status?: number
    validationErrors?: ValidationErrors
}

// Safe server actions integration
export interface SafeActionResult<T> {
    data: T | null
    error: string | null
}

// Safe API client options
export interface SafeApiClientOptions<T = any> {
    fallbackData?: T | null
    customErrorMessage?: string
    on404?: (result: ApiResult<T>) => void
    on422?: (result: ApiResult<T>) => void
    on400?: (result: ApiResult<T>) => void
    on500?: (result: ApiResult<T>) => void
}

// ユーティリティ型ガード
export const isApiError = <T>(result: ApiResult<T>): boolean => {
    return result.error
}

export const isApiSuccess = <T>(result: ApiResult<T>): boolean => {
    return result.success && !result.error
}

// ユーティリティ関数
export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

// Laravel エラーレスポンス解析
const parseLaravelError = (
    errorData: any
): { message: string; validationErrors?: Record<string, string[]> } => {
    if (errorData.errors && typeof errorData.errors === 'object') {
        return {
            message: errorData.message || 'バリデーションエラーが発生しました',
            validationErrors: errorData.errors,
        }
    }

    if (errorData.message) {
        return { message: errorData.message }
    }

    if (typeof errorData === 'string') {
        return { message: errorData }
    }

    return { message: 'Unknown error occurred' }
}

// 共通エラーハンドリング関数
const handleSafeOptionsError = <T>(
    result: ApiResult<T>,
    safeOptions: SafeApiClientOptions<T>
): T => {
    if (!result.error) {
        return result.data as T
    }

    const status = result.status || 500

    // ステータスコード別のハンドラーを呼び出し
    switch (status) {
        case 404:
            if (safeOptions.on404) {
                safeOptions.on404(result)
                return safeOptions.fallbackData ?? (null as T)
            }
            // デフォルトは NotFound を発火する代わりに fallbackData を返す
            break

        case 422:
            if (safeOptions.on422) {
                safeOptions.on422(result)
                return safeOptions.fallbackData ?? (null as T)
            }
            // デフォルトはそのまま処理を継続
            break

        case 400:
            if (safeOptions.on400) {
                safeOptions.on400(result)
                return safeOptions.fallbackData ?? (null as T)
            }
            // デフォルトはそのまま処理を継続
            break

        case 500:
            if (safeOptions.on500) {
                safeOptions.on500(result)
                return safeOptions.fallbackData ?? (null as T)
            }
            // デフォルトはそのまま処理を継続
            break
    }

    // バリデーションエラーがある場合の処理
    if (result.validationErrors) {
        console.warn('422 Validation Error: Validation errors present')
        // customErrorMessageがある場合はthrowする
        if (safeOptions.customErrorMessage) {
            const error = new Error(safeOptions.customErrorMessage) as any
            error.status = status
            error.validationErrors = result.validationErrors
            error.originalMessage = result.message
            throw error
        }
        // customErrorMessageがない場合はfallbackDataを返す
        return safeOptions.fallbackData ?? (null as T)
    }

    // customErrorMessageがある場合はそれでthrow
    if (safeOptions.customErrorMessage) {
        const error = new Error(safeOptions.customErrorMessage) as any
        error.status = status
        error.validationErrors = result.validationErrors
        error.originalMessage = result.message
        throw error
    }

    // fallbackDataを返す
    return safeOptions.fallbackData ?? (null as T)
}

// 共通HTTPメソッド実行ロジック
const executeWithSafeOptions = async <T>(
    requestFn: () => Promise<ApiResult<T>>,
    safeOptions: SafeApiClientOptions<T>
): Promise<T> => {
    const result = await requestFn()
    return handleSafeOptionsError(result, safeOptions)
}

// useApiMutationで使用する共通HTTP実行関数
const executeApiMethod = async <TData>(
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    body?: any,
    options?: SafeFetchOptions
): Promise<TData> => {
    let result: ApiResult<TData>

    switch (method) {
        case 'POST':
            result = await apiClient.post<TData>(url, body, options)
            break
        case 'PUT':
            result = await apiClient.put<TData>(url, body, options)
            break
        case 'PATCH':
            result = await apiClient.patch<TData>(url, body, options)
            break
        case 'DELETE':
            result = await apiClient.delete<TData>(url, options)
            break
        default:
            throw new Error(`Unsupported method: ${method}`)
    }

    if (isApiError(result)) {
        const apiError: ApiError = {
            message: result.message || 'エラーが発生しました',
            status: result.status || 500,
            validationErrors: result.validationErrors,
        }
        throw apiError
    }

    return result.data as TData
}

// メインAPIクライアントクラス
export class UniversalApiClient {
    private config: Required<ApiClientConfig>

    constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_URL || '',
            defaultHeaders: config.defaultHeaders || {},
            timeout:
                config.timeout ||
                Number(process.env.NEXT_PUBLIC_API_TIMEOUT) ||
                10000,
            retries:
                config.retries ||
                Number(process.env.NEXT_PUBLIC_API_RETRIES) ||
                0,
            retryDelay:
                config.retryDelay ||
                Number(process.env.NEXT_PUBLIC_API_RETRY_DELAY) ||
                1000,
        }
    }

    private async request<T>(
        method: string,
        url: string,
        body?: any,
        options: SafeFetchOptions = {}
    ): Promise<ApiResult<T>> {
        const isClient = typeof window !== 'undefined'

        // URLの処理を修正
        let fullUrl: string
        if (url.startsWith('http')) {
            fullUrl = url
        } else {
            // baseUrlが空の場合のデフォルト設定
            const baseUrl =
                this.config.baseUrl ||
                (isClient
                    ? process.env.NEXT_PUBLIC_API_URL || ''
                    : 'http://localhost:3001')
            fullUrl = baseUrl ? `${baseUrl}${url}` : url
        }

        const token = isClient ? Cookies.get('auth_token') : null
        const headers = {
            ...this.config.defaultHeaders,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        }

        const {
            timeout = this.config.timeout,
            retries = this.config.retries,
            retryDelay = this.config.retryDelay,
            ...fetchOptions
        } = options

        if (body && method !== 'GET' && method !== 'DELETE') {
            fetchOptions.body = JSON.stringify(body)
        }

        let lastError: Error | null = null

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), timeout)

                const response = await fetch(fullUrl, {
                    ...fetchOptions,
                    method,
                    headers,
                    signal: controller.signal,
                })

                clearTimeout(timeoutId)

                let responseData: any
                const contentType = response.headers.get('content-type')

                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json()
                } else if (contentType && contentType.includes('text/')) {
                    responseData = await response.text()
                } else {
                    responseData = await response.blob()
                }

                if (!response.ok) {
                    const { message, validationErrors } =
                        parseLaravelError(responseData)
                    throw new SafeFetchError(
                        message,
                        response.status,
                        response,
                        validationErrors
                    )
                }

                return {
                    data: responseData as T,
                    error: false,
                    success: true,
                    status: response.status,
                }
            } catch (error) {
                lastError = error as Error

                if (error instanceof Error && error.name === 'AbortError') {
                    return {
                        data: null,
                        error: true,
                        success: false,
                        message: 'リクエストがタイムアウトしました',
                        status: 0,
                    }
                }

                if (attempt < retries) {
                    if (
                        lastError instanceof SafeFetchError &&
                        lastError.status >= 400 &&
                        lastError.status < 500
                    ) {
                        break
                    }

                    console.warn(
                        `Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`,
                        error
                    )
                    await sleep(retryDelay)
                    continue
                }
            }
        }

        if (lastError instanceof SafeFetchError) {
            return {
                data: null,
                error: true,
                success: false,
                message: lastError.message,
                status: lastError.status,
                validationErrors: lastError.validationErrors,
            }
        }

        const errorMessage = lastError?.message || 'Unknown fetch error'
        return {
            data: null,
            error: true,
            success: false,
            message: errorMessage,
            status: 0,
        }
    }

    // HTTPメソッド用共通処理関数
    private async handleHttpMethodRequest<T>(
        method: string,
        url: string,
        body?: any,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        // safeOptionsかどうかを判定
        const isSafeOptions =
            optionsOrSafeOptions &&
            ('fallbackData' in optionsOrSafeOptions ||
                'customErrorMessage' in optionsOrSafeOptions)

        if (isSafeOptions) {
            const safeOptions = optionsOrSafeOptions as SafeApiClientOptions<T>
            return executeWithSafeOptions(
                () => this.request<T>(method, url, body),
                safeOptions
            )
        } else {
            return this.request<T>(
                method,
                url,
                body,
                optionsOrSafeOptions as SafeFetchOptions
            )
        }
    }

    // HTTP メソッド
    async get<T = any>(
        url: string,
        options?: SafeFetchOptions
    ): Promise<ApiResult<T>>
    async get<T = any>(
        url: string,
        safeOptions: SafeApiClientOptions<T>
    ): Promise<T>
    async get<T = any>(
        url: string,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        return this.handleHttpMethodRequest<T>(
            'GET',
            url,
            undefined,
            optionsOrSafeOptions
        )
    }

    async post<T = any>(
        url: string,
        body?: any,
        options?: SafeFetchOptions
    ): Promise<ApiResult<T>>
    async post<T = any>(
        url: string,
        body: any,
        safeOptions: SafeApiClientOptions<T>
    ): Promise<T>
    async post<T = any>(
        url: string,
        body?: any,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        return this.handleHttpMethodRequest<T>(
            'POST',
            url,
            body,
            optionsOrSafeOptions
        )
    }

    async put<T = any>(
        url: string,
        body?: any,
        options?: SafeFetchOptions
    ): Promise<ApiResult<T>>
    async put<T = any>(
        url: string,
        body: any,
        safeOptions: SafeApiClientOptions<T>
    ): Promise<T>
    async put<T = any>(
        url: string,
        body?: any,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        return this.handleHttpMethodRequest<T>(
            'PUT',
            url,
            body,
            optionsOrSafeOptions
        )
    }

    async patch<T = any>(
        url: string,
        body?: any,
        options?: SafeFetchOptions
    ): Promise<ApiResult<T>>
    async patch<T = any>(
        url: string,
        body: any,
        safeOptions: SafeApiClientOptions<T>
    ): Promise<T>
    async patch<T = any>(
        url: string,
        body?: any,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        return this.handleHttpMethodRequest<T>(
            'PATCH',
            url,
            body,
            optionsOrSafeOptions
        )
    }

    async delete<T = any>(
        url: string,
        options?: SafeFetchOptions
    ): Promise<ApiResult<T>>
    async delete<T = any>(
        url: string,
        safeOptions: SafeApiClientOptions<T>
    ): Promise<T>
    async delete<T = any>(
        url: string,
        optionsOrSafeOptions?: SafeFetchOptions | SafeApiClientOptions<T>
    ): Promise<ApiResult<T> | T> {
        return this.handleHttpMethodRequest<T>(
            'DELETE',
            url,
            undefined,
            optionsOrSafeOptions
        )
    }
}

// デフォルトインスタンス
export const apiClient = new UniversalApiClient()

// React Hook Form統合オプション
export interface FormIntegrationOptions<T extends FieldValues> {
    setError: UseFormSetError<T>
    onSuccess?: (data: any) => void
    onError?: (error: ApiError) => void
    resetForm?: () => void
    showSuccessMessage?: (message: string) => void
    showErrorMessage?: (message: string) => void
}

// フォーム統合ヘルパー
export const handleApiResult = <T extends FieldValues, TData = any>(
    result: ApiResult<TData>,
    options: FormIntegrationOptions<T>
): boolean => {
    const {
        setError,
        onSuccess,
        onError,
        resetForm,
        showSuccessMessage,
        showErrorMessage,
    } = options

    if (isApiSuccess(result)) {
        resetForm?.()
        onSuccess?.(result.data)
        showSuccessMessage?.('操作が正常に完了しました')
        return true
    }

    // バリデーションエラーの処理
    if (result.validationErrors) {
        Object.entries(result.validationErrors).forEach(([field, messages]) => {
            setError(field as Path<T>, {
                type: 'server',
                message: messages[0],
            })
        })
    } else {
        // 一般的なエラー
        setError('root' as Path<T>, {
            type: 'server',
            message: result.message || 'エラーが発生しました',
        })
    }

    const apiError: ApiError = {
        message: result.message || 'エラーが発生しました',
        status: result.status || 500,
        validationErrors: result.validationErrors,
    }
    onError?.(apiError)
    showErrorMessage?.(result.message || 'エラーが発生しました')
    return false
}

// React Query統合フック
export interface UseApiQueryOptions<TData = any>
    extends Omit<UseQueryOptions<TData, ApiError>, 'queryFn'> {
    url: string
    options?: SafeFetchOptions
}

export const useApiQuery = <TData = any>({
    url,
    options,
    enabled = true,
    ...queryOptions
}: UseApiQueryOptions<TData>) => {
    return useQuery({
        ...queryOptions,
        enabled,
        queryFn: async (): Promise<TData> => {
            const result = await apiClient.get<TData>(url, options)
            if (isApiError(result)) {
                const apiError: ApiError = {
                    message: result.message || 'エラーが発生しました',
                    status: result.status || 500,
                    validationErrors: result.validationErrors,
                }
                throw apiError
            }
            return result.data as TData
        },
    })
}

// 基本設定
export interface ApiClientGlobalConfig {
    baseUrl?: string
}

let globalConfig: ApiClientGlobalConfig = {}

export const setApiClientConfig = (config: ApiClientGlobalConfig) => {
    globalConfig = { ...globalConfig, ...config }
}

export interface UseApiMutationOptions<TData = any, TVariables = any>
    extends Omit<
        UseMutationOptions<TData, ApiError, TVariables>,
        'mutationFn'
    > {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    url?: string
    options?: SafeFetchOptions
}

// Form連携版のオプション
export interface UseApiMutationFormOptions<TData = any, TForm = any>
    extends Omit<UseMutationOptions<TData, ApiError, any>, 'mutationFn'> {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    url?: string
    options?: SafeFetchOptions
    action?: (data: TForm) => Promise<TData>
}

// 基本版のuseApiMutation
export function useApiMutation<TData = any, TVariables = any>(
    options?: UseApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables & { url?: string }>

// Form連携版のuseApiMutation
export function useApiMutation<TData = any, TForm extends FieldValues = any>(
    form: UseFormReturn<TForm>,
    options: UseApiMutationFormOptions<TData, TForm>
): UseMutationResult<TData, ApiError, TForm>

// 実装
export function useApiMutation<TData = any, TVariables = any>(
    formOrOptions?:
        | UseFormReturn<any>
        | UseApiMutationOptions<TData, TVariables>,
    formOptions?: UseApiMutationFormOptions<TData, any>
) {
    // Form連携版かどうかを判定
    const isFormVersion = formOrOptions && 'setError' in formOrOptions

    if (isFormVersion && formOptions) {
        // Form連携版の実装
        const form = formOrOptions as UseFormReturn<any>
        const {
            method = 'POST',
            url,
            options,
            action,
            ...mutationOptions
        } = formOptions

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: any) => {
                // actionが指定されている場合は直接実行
                if (action) {
                    return await action(variables)
                }

                // 従来のURL指定方式
                if (!url) {
                    throw new Error('URL or action is required')
                }

                // globalConfigのbaseUrlを使用
                const fullUrl = globalConfig.baseUrl
                    ? `${globalConfig.baseUrl}${url}`
                    : `http://localhost:3001${url}`

                return executeApiMethod<TData>(
                    method,
                    fullUrl,
                    variables,
                    options
                )
            },
            onError: (error: ApiError) => {
                // 422エラーの場合、自動的にformにエラーをセット
                if (error.status === 422 && error.validationErrors) {
                    form.clearErrors()
                    Object.entries(error.validationErrors).forEach(
                        ([field, messages]) => {
                            const message = Array.isArray(messages)
                                ? messages[0]
                                : messages
                            form.setError(field as any, {
                                type: 'server',
                                message: message as string,
                            })
                        }
                    )
                }

                // 元のonErrorも呼び出し
                formOptions.onError?.(error, {} as any, {} as any, {} as any)
            },
        })
    } else {
        // 基本版の実装
        const {
            method = 'POST',
            url,
            options,
            ...mutationOptions
        } = (formOrOptions as UseApiMutationOptions<TData, TVariables>) || {}

        return useMutation({
            ...mutationOptions,
            mutationFn: async (variables: TVariables & { url?: string }) => {
                const targetUrl = variables.url || url
                if (!targetUrl) {
                    throw new Error('URL is required')
                }

                const { url: _, ...body } = variables as any

                return executeApiMethod<TData>(method, targetUrl, body, options)
            },
        })
    }
}

// React Hook Form統合フック
export interface UseApiFormOptions<T extends FieldValues, _TData = any>
    extends FormIntegrationOptions<T> {
    method?: 'POST' | 'PUT' | 'PATCH'
    url?: string
    options?: SafeFetchOptions
    invalidateQueries?: string[]
}

export const useApiForm = <T extends FieldValues, TData = any>({
    method = 'POST',
    url,
    options,
    invalidateQueries = [],
    ...formOptions
}: UseApiFormOptions<T, TData>) => {
    const queryClient = useQueryClient()

    const mutation = useApiMutation<TData, T>({
        method,
        url,
        options,
        onSuccess: (data) => {
            // React Queryキャッシュの無効化
            invalidateQueries.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey: [queryKey] })
            })
            formOptions.onSuccess?.(data)
        },
        onError: (error) => {
            formOptions.onError?.(error)
        },
    })

    const submit = async (formData: T, submitUrl?: string) => {
        const targetUrl = submitUrl || url
        if (!targetUrl) {
            throw new Error('URL is required')
        }

        try {
            const result = await mutation.mutateAsync({
                ...formData,
                url: targetUrl,
            })
            handleApiResult(
                { data: result, error: false, success: true },
                formOptions
            )
            return true
        } catch (error) {
            const apiError = error as ApiError
            handleApiResult(
                {
                    data: null,
                    error: true,
                    success: false,
                    message: apiError.message,
                    status: apiError.status,
                    validationErrors: apiError.validationErrors,
                },
                formOptions
            )
            return false
        }
    }

    return {
        submit,
        isLoading: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}

// Safe server actions utility functions
/**
 * 非同期関数を安全に実行し、エラーを自動的にキャッチしてフォーマットする
 */
export async function safeExecute<T>(
    asyncFn: () => Promise<T>,
    fallbackData: T | null = null,
    customErrorMessage?: string
): Promise<SafeActionResult<T>> {
    try {
        const data = await asyncFn()
        return {
            data,
            error: null,
        }
    } catch (e) {
        const errorMessage =
            customErrorMessage ||
            (e instanceof Error ? e.message : '予期しないエラーが発生しました')

        return {
            data: fallbackData,
            error: errorMessage,
        }
    }
}

/**
 * 複数の非同期処理を並列実行し、すべてのエラーを安全にハンドリングする
 */
export async function safeParallelExecute<
    T extends Record<string, any>,
>(operations: {
    [K in keyof T]: () => Promise<T[K]>
}): Promise<{
    [K in keyof T]: SafeActionResult<T[K]>
}> {
    const entries = Object.entries(operations) as Array<
        [keyof T, () => Promise<T[keyof T]>]
    >

    const results = await Promise.allSettled(
        entries.map(async ([key, fn]) => {
            try {
                const data = await fn()
                return { key, result: { data, error: null } }
            } catch (e) {
                const errorMessage =
                    e instanceof Error
                        ? e.message
                        : '予期しないエラーが発生しました'
                return {
                    key,
                    result: { data: null, error: errorMessage },
                }
            }
        })
    )

    const finalResult = {} as {
        [K in keyof T]: SafeActionResult<T[K]>
    }

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            const { key, result: actionResult } = result.value
            finalResult[key] = actionResult
        } else {
            // これは基本的に発生しないはずだが、安全のため
            const firstKey = entries[0][0]
            finalResult[firstKey] = {
                data: null,
                error: 'システムエラーが発生しました',
            } as SafeActionResult<T[keyof T]>
        }
    })

    return finalResult
}
