import Cookies from 'js-cookie'

export interface SafeFetchOptions extends RequestInit {
    timeout?: number
    retries?: number
    retryDelay?: number
}

export interface SafeFetchResponse<T = any> {
    data: T | null
    error: string | null
    status: number
    success: boolean
    // Laravel固有のフィールド
    validationErrors?: Record<string, string[]>
    laravelError?: LaravelErrorResponse
}

// Laravel標準エラーレスポンス型
export interface LaravelErrorResponse {
    message: string
    errors?: Record<string, string[]>
    exception?: string
    file?: string
    line?: number
    trace?: any[]
}

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

export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

// Laravelエラーレスポンスを解析する関数
const parseLaravelError = (
    errorData: any
): { message: string; validationErrors?: Record<string, string[]> } => {
    // Laravelのバリデーションエラーの場合
    if (errorData.errors && typeof errorData.errors === 'object') {
        const validationErrors = errorData.errors

        return {
            message: errorData.message || 'バリデーションエラーが発生しました',
            validationErrors,
        }
    }

    // 一般的なLaravelエラーレスポンス
    if (errorData.message) {
        return {
            message: errorData.message,
        }
    }

    // その他の形式
    if (typeof errorData === 'string') {
        return { message: errorData }
    }

    return { message: 'Unknown error occurred' }
}

export const safeFetch = async <T = any>(
    url: string,
    options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> => {
    const isClient = typeof window !== 'undefined'
    const fullUrl = url.startsWith('http')
        ? url
        : `${process.env.NEXT_PUBLIC_API_URL}${url}`

    const token = isClient ? Cookies.get('auth_token') : null
    const { headers } = options
    let h = {
        ...headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }
    if (headers) {
        h = { ...h, ...headers }
    }

    const {
        timeout = 10000,
        retries = 0,
        retryDelay = 1000,
        ...fetchOptions
    } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // タイムアウト制御
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)

            const response = await fetch(`${fullUrl}`, {
                ...fetchOptions,
                headers: h,
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            // レスポンスのパース
            let responseData: any
            const contentType = response.headers.get('content-type')

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json()
            } else if (contentType && contentType.includes('text/')) {
                responseData = await response.text()
            } else {
                responseData = await response.blob()
            }

            // HTTPエラーの場合
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
                error: null,
                status: response.status,
                success: true,
            }
        } catch (error) {
            lastError = error as Error

            // AbortErrorの場合はリトライしない（タイムアウト）
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    data: null,
                    error: 'リクエストがタイムアウトしました',
                    status: 0,
                    success: false,
                }
            }

            // 最後の試行でない場合はリトライ
            if (attempt < retries) {
                // Laravel特有のエラー（4xx）の場合はリトライしない
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

    // すべての試行が失敗した場合
    if (lastError instanceof SafeFetchError) {
        return {
            data: null,
            error: lastError.message,
            status: lastError.status,
            success: false,
            validationErrors: lastError.validationErrors,
            laravelError: lastError.response
                ? await lastError.response.json().catch(() => null)
                : null,
        }
    }

    const errorMessage = lastError?.message || 'Unknown fetch error'
    return {
        data: null,
        error: errorMessage,
        status: 0,
        success: false,
    }
}

// 便利なヘルパー関数
export const safeGet = <T = any>(
    url: string,
    options?: Omit<SafeFetchOptions, 'method'>
) => safeFetch<T>(url, { ...options, method: 'GET' })

export const safePost = <T = any>(
    url: string,
    body?: any,
    options?: Omit<SafeFetchOptions, 'method' | 'body'>
) =>
    safeFetch<T>(url, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(body),
    })

export const safePut = <T = any>(
    url: string,
    body?: any,
    options?: Omit<SafeFetchOptions, 'method' | 'body'>
) =>
    safeFetch<T>(url, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(body),
    })

export const safePatch = <T = any>(
    url: string,
    body?: any,
    options?: Omit<SafeFetchOptions, 'method' | 'body'>
) =>
    safeFetch<T>(url, {
        ...options,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: JSON.stringify(body),
    })

export const safeDelete = <T = any>(
    url: string,
    options?: Omit<SafeFetchOptions, 'method'>
) => safeFetch<T>(url, { ...options, method: 'DELETE' })

// Laravel専用のヘルパー関数
export const isValidationError = (result: SafeFetchResponse): boolean => {
    return result.status === 422 && !!result.validationErrors
}

export const getValidationErrorsAsString = (
    validationErrors: Record<string, string[]>
): string => {
    return Object.entries(validationErrors)
        .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${messageArray.join(', ')}`
        })
        .join('\n')
}

export const getFirstValidationError = (
    validationErrors: Record<string, string[]>
): string | null => {
    const firstField = Object.keys(validationErrors)[0]
    if (!firstField) return null

    const messages = validationErrors[firstField]
    return Array.isArray(messages) ? messages[0] : messages
}
