import {
    apiClient,
    ApiClientConfig,
    handleApiResult,
    isApiError,
    isApiSuccess,
    safeExecute,
    safeParallelExecute,
    setApiClientConfig,
    UniversalApiClient,
} from '@/src/lib/universal-api-client'

// js-cookieのモック
jest.mock('js-cookie', () => ({
    get: jest.fn(() => 'mock-token'),
}))

// global fetchのモック
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>

describe('UniversalApiClient', () => {
    let client: UniversalApiClient
    let originalEnv: NodeJS.ProcessEnv

    const createMockResponse = (data: any, status = 200, ok = true) => {
        const response = {
            ok,
            status,
            headers: {
                get: jest.fn((name: string) => {
                    if (name === 'content-type') return 'application/json'
                    return null
                }),
            },
            json: jest.fn().mockResolvedValue(data),
            text: jest.fn().mockResolvedValue(JSON.stringify(data)),
            blob: jest.fn().mockResolvedValue(new Blob()),
        } as unknown as Response
        return response
    }

    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = mockFetch
        // 環境変数をモック（テスト用のbaseURL設定）
        originalEnv = process.env
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_API_URL: undefined,
        }
        client = new UniversalApiClient()
    })

    afterEach(() => {
        jest.restoreAllMocks()
        // 環境変数を元に戻す
        process.env = originalEnv
    })

    describe('constructor', () => {
        it('デフォルト設定で初期化されること', () => {
            const defaultClient = new UniversalApiClient()
            expect(defaultClient).toBeInstanceOf(UniversalApiClient)
        })

        it('カスタム設定で初期化されること', () => {
            const config: ApiClientConfig = {
                baseUrl: 'https://api.example.com',
                defaultHeaders: { 'X-Custom': 'header' },
                timeout: 5000,
                retries: 3,
                retryDelay: 500,
            }
            const customClient = new UniversalApiClient(config)
            expect(customClient).toBeInstanceOf(UniversalApiClient)
        })
    })

    describe('HTTP Methods', () => {
        const mockData = { id: 1, name: 'test' }

        describe('GET', () => {
            it('成功レスポンスを正しく処理すること', async () => {
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test')

                expect(isApiSuccess(result)).toBe(true)
                if (isApiSuccess(result)) {
                    expect(result.data).toEqual(mockData)
                }
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.objectContaining({
                        method: 'GET',
                        headers: expect.any(Object),
                    })
                )
            })

            it('エラーレスポンスを正しく処理すること', async () => {
                const errorData = {
                    message: 'Server error',
                    errors: { name: ['Name is required'] },
                }
                const mockResponse = createMockResponse(errorData, 422, false)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test')

                expect(isApiError(result)).toBe(true)
                if (isApiError(result)) {
                    expect(result.error).toBe(true)
                    expect(result.success).toBe(false)
                    expect(result.validationErrors).toEqual({
                        name: ['Name is required'],
                    })
                }
            })

            it('safeOptionsでfallbackDataを返すこと', async () => {
                const errorData = { message: 'Server error' }
                const mockResponse = createMockResponse(errorData, 500, false)
                mockFetch.mockResolvedValue(mockResponse)

                const fallbackData = { id: 0, name: 'fallback' }
                const result = await client.get('/test', {
                    fallbackData,
                })

                expect(result).toEqual(fallbackData)
            })

            it('safeOptionsでcustomErrorMessageをthrowすること', async () => {
                const errorData = { message: 'Server error' }
                const mockResponse = createMockResponse(errorData, 500, false)
                mockFetch.mockResolvedValue(mockResponse)

                try {
                    await client.get('/test', {
                        customErrorMessage: 'Custom error message',
                    })
                    fail('Expected error to be thrown')
                } catch (error: any) {
                    expect(error.message).toBe('Custom error message')
                    expect(error.status).toBe(500)
                    expect(error.originalMessage).toBe('Server error')
                }
            })

            it('safeOptionsでcustomErrorMessageがバリデーションエラーに対してthrowされること', async () => {
                const errorData = {
                    message: 'Validation failed',
                    errors: { name: ['Name is required'] },
                }
                const mockResponse = createMockResponse(errorData, 422, false)
                mockFetch.mockResolvedValue(mockResponse)

                // customErrorMessageが設定されている場合、バリデーションエラーでもthrowされる
                try {
                    await client.get('/test', {
                        customErrorMessage: 'Custom validation error',
                        fallbackData: { fallback: true },
                    })
                    fail('Expected error to be thrown')
                } catch (error: any) {
                    expect(error.message).toBe('Custom validation error')
                    expect(error.status).toBe(422)
                    expect(error.validationErrors).toEqual({
                        name: ['Name is required'],
                    })
                    expect(error.originalMessage).toBe('Validation failed')
                }
            })

            it('safeOptionsでcustomErrorMessageが一般エラーに対してthrowされること', async () => {
                const errorData = { message: 'General server error' }
                const mockResponse = createMockResponse(errorData, 500, false)
                mockFetch.mockResolvedValue(mockResponse)

                try {
                    await client.get('/test', {
                        customErrorMessage: 'Custom general error',
                    })
                    throw new Error('Expected error to be thrown')
                } catch (error: any) {
                    expect(error.message).toBe('Custom general error')
                    expect(error.status).toBe(500)
                    expect(error.originalMessage).toBe('General server error')
                }
            })

            it('safeOptionsでon404ハンドラーが呼び出されること', async () => {
                const on404Handler = jest.fn()
                const errorData = { message: 'Not Found' }
                const mockResponse = createMockResponse(errorData, 404, false)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test', {
                    fallbackData: null,
                    on404: on404Handler,
                })

                expect(on404Handler).toHaveBeenCalledWith({
                    data: null,
                    error: true,
                    success: false,
                    message: 'Not Found',
                    status: 404,
                })
                expect(result).toBeNull()
            })

            it('safeOptionsでon422ハンドラーが呼び出されること', async () => {
                const on422Handler = jest.fn()
                const errorData = {
                    message: 'Validation failed',
                    errors: { name: ['required'] },
                }
                const mockResponse = createMockResponse(errorData, 422, false)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test', {
                    fallbackData: null,
                    on422: on422Handler,
                })

                expect(on422Handler).toHaveBeenCalledWith({
                    data: null,
                    error: true,
                    success: false,
                    message: 'Validation failed',
                    status: 422,
                    validationErrors: { name: ['required'] },
                })
                expect(result).toBeNull()
            })

            it('safeOptionsでon400ハンドラーが呼び出されること', async () => {
                const on400Handler = jest.fn()
                const errorData = { message: 'Bad Request' }
                const mockResponse = createMockResponse(errorData, 400, false)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test', {
                    fallbackData: null,
                    on400: on400Handler,
                })

                expect(on400Handler).toHaveBeenCalledWith({
                    data: null,
                    error: true,
                    success: false,
                    message: 'Bad Request',
                    status: 400,
                })
                expect(result).toBeNull()
            })

            it('safeOptionsでon500ハンドラーが呼び出されること', async () => {
                const on500Handler = jest.fn()
                const errorData = { message: 'Internal Server Error' }
                const mockResponse = createMockResponse(errorData, 500, false)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.get('/test', {
                    fallbackData: null,
                    on500: on500Handler,
                })

                expect(on500Handler).toHaveBeenCalledWith({
                    data: null,
                    error: true,
                    success: false,
                    message: 'Internal Server Error',
                    status: 500,
                })
                expect(result).toBeNull()
            })

            it('完全なURLの場合はbaseUrlを使用しないこと', async () => {
                const clientWithBaseUrl = new UniversalApiClient({
                    baseUrl: 'https://api.example.com',
                })
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                await clientWithBaseUrl.get('https://different.com/test')

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://different.com/test',
                    expect.any(Object)
                )
            })
        })

        describe('POST', () => {
            const postData = { name: 'test', email: 'test@example.com' }

            it('成功レスポンスを正しく処理すること', async () => {
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.post('/test', postData)

                expect(isApiSuccess(result)).toBe(true)
                if (isApiSuccess(result)) {
                    expect(result.data).toEqual(mockData)
                }
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.any(Object),
                        body: JSON.stringify(postData),
                    })
                )
            })

            it('safeOptionsでの動作が正しいこと', async () => {
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.post('/test', postData, {
                    fallbackData: null,
                })

                expect(result).toEqual(mockData)
            })
        })

        describe('PUT', () => {
            const putData = { id: 1, name: 'updated' }

            it('成功レスポンスを正しく処理すること', async () => {
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.put('/test/1', putData)

                expect(isApiSuccess(result)).toBe(true)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test/1',
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(putData),
                    })
                )
            })
        })

        describe('PATCH', () => {
            const patchData = { name: 'patched' }

            it('成功レスポンスを正しく処理すること', async () => {
                const mockResponse = createMockResponse(mockData)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.patch('/test/1', patchData)

                expect(isApiSuccess(result)).toBe(true)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test/1',
                    expect.objectContaining({
                        method: 'PATCH',
                        body: JSON.stringify(patchData),
                    })
                )
            })
        })

        describe('DELETE', () => {
            it('成功レスポンスを正しく処理すること', async () => {
                const mockResponse = createMockResponse(null, 204)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.delete('/test/1')

                expect(isApiSuccess(result)).toBe(true)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test/1',
                    expect.objectContaining({
                        method: 'DELETE',
                    })
                )
            })

            it('safeOptionsでの動作が正しいこと', async () => {
                const mockResponse = createMockResponse(null, 204)
                mockFetch.mockResolvedValue(mockResponse)

                const result = await client.delete('/test/1', {
                    fallbackData: { deleted: true },
                })

                expect(result).toEqual(null)
            })
        })
    })

    describe('カスタムヘッダーとオプション', () => {
        it('デフォルトヘッダーとカスタムヘッダーがマージされること', async () => {
            const customClient = new UniversalApiClient({
                defaultHeaders: { 'X-Default': 'default-value' },
            })
            const mockResponse = createMockResponse({ test: 'data' })
            mockFetch.mockResolvedValue(mockResponse)

            await customClient.get('/test', {
                headers: { 'X-Custom': 'custom-value' },
            })

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/test',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Default': 'default-value',
                        'X-Custom': 'custom-value',
                    }),
                })
            )
        })

        it('タイムアウトとリトライ設定が正しく適用されること', async () => {
            const customClient = new UniversalApiClient({
                timeout: 5000,
                retries: 2,
            })

            // タイムアウトをシミュレート
            mockFetch.mockImplementation(
                () =>
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('AbortError')), 10)
                    })
            )

            const result = await customClient.get('/test')
            expect(isApiError(result)).toBe(true)
        })
    })

    describe('Type Guards', () => {
        describe('isApiError', () => {
            it('エラーレスポンスでtrueを返すこと', () => {
                const errorResult = {
                    data: null,
                    error: true,
                    success: false,
                    message: 'Error',
                }
                expect(isApiError(errorResult)).toBe(true)
            })

            it('成功レスポンスでfalseを返すこと', () => {
                const successResult = {
                    data: { test: 'data' },
                    error: false,
                    success: true,
                }
                expect(isApiError(successResult)).toBe(false)
            })
        })

        describe('isApiSuccess', () => {
            it('成功レスポンスでtrueを返すこと', () => {
                const successResult = {
                    data: { test: 'data' },
                    error: false,
                    success: true,
                }
                expect(isApiSuccess(successResult)).toBe(true)
            })

            it('エラーレスポンスでfalseを返すこと', () => {
                const errorResult = {
                    data: null,
                    error: true,
                    success: false,
                    message: 'Error',
                }
                expect(isApiSuccess(errorResult)).toBe(false)
            })
        })
    })

    describe('Form Integration', () => {
        describe('handleApiResult', () => {
            const mockSetError = jest.fn()
            const mockOnSuccess = jest.fn()
            const mockOnError = jest.fn()
            const mockResetForm = jest.fn()
            const mockShowSuccessMessage = jest.fn()
            const mockShowErrorMessage = jest.fn()

            const formOptions = {
                setError: mockSetError,
                onSuccess: mockOnSuccess,
                onError: mockOnError,
                resetForm: mockResetForm,
                showSuccessMessage: mockShowSuccessMessage,
                showErrorMessage: mockShowErrorMessage,
            }

            beforeEach(() => {
                jest.clearAllMocks()
            })

            it('成功レスポンスを正しく処理すること', () => {
                const successResult = {
                    data: { test: 'data' },
                    error: false,
                    success: true,
                }

                const result = handleApiResult(successResult, formOptions)

                expect(result).toBe(true)
                expect(mockResetForm).toHaveBeenCalled()
                expect(mockOnSuccess).toHaveBeenCalledWith({ test: 'data' })
                expect(mockShowSuccessMessage).toHaveBeenCalledWith(
                    '操作が正常に完了しました'
                )
            })

            it('バリデーションエラーを正しく処理すること', () => {
                const errorResult = {
                    data: null,
                    error: true,
                    success: false,
                    validationErrors: {
                        name: ['Name is required'],
                        email: ['Email is invalid'],
                    },
                }

                const result = handleApiResult(errorResult, formOptions)

                expect(result).toBe(false)
                expect(mockSetError).toHaveBeenCalledWith('name', {
                    type: 'server',
                    message: 'Name is required',
                })
                expect(mockSetError).toHaveBeenCalledWith('email', {
                    type: 'server',
                    message: 'Email is invalid',
                })
            })

            it('一般的なエラーを正しく処理すること', () => {
                const errorResult = {
                    data: null,
                    error: true,
                    success: false,
                    message: 'Server error',
                }

                const result = handleApiResult(errorResult, formOptions)

                expect(result).toBe(false)
                expect(mockSetError).toHaveBeenCalledWith('root', {
                    type: 'server',
                    message: 'Server error',
                })
                expect(mockOnError).toHaveBeenCalled()
                expect(mockShowErrorMessage).toHaveBeenCalledWith(
                    'Server error'
                )
            })
        })
    })

    describe('Safe Server Actions', () => {
        describe('safeExecute', () => {
            it('成功した非同期関数の結果を返すこと', async () => {
                const asyncFn = jest.fn().mockResolvedValue({ data: 'test' })

                const result = await safeExecute(asyncFn)

                expect(result).toEqual({
                    data: { data: 'test' },
                    error: null,
                })
            })

            it('エラーをキャッチしてfallbackDataを返すこと', async () => {
                const asyncFn = jest
                    .fn()
                    .mockRejectedValue(new Error('Test error'))
                const fallbackData = { fallback: true }

                const result = await safeExecute(asyncFn, fallbackData)

                expect(result).toEqual({
                    data: fallbackData,
                    error: 'Test error',
                })
            })

            it('カスタムエラーメッセージを使用すること', async () => {
                const asyncFn = jest
                    .fn()
                    .mockRejectedValue(new Error('Original error'))
                const customMessage = 'Custom error message'

                const result = await safeExecute(asyncFn, null, customMessage)

                expect(result).toEqual({
                    data: null,
                    error: customMessage,
                })
            })

            it('非Errorオブジェクトのエラーを処理すること', async () => {
                const asyncFn = jest.fn().mockRejectedValue('String error')

                const result = await safeExecute(asyncFn)

                expect(result).toEqual({
                    data: null,
                    error: '予期しないエラーが発生しました',
                })
            })
        })

        describe('safeParallelExecute', () => {
            it('すべての操作が成功した場合', async () => {
                const operations = {
                    task1: jest.fn().mockResolvedValue('result1'),
                    task2: jest.fn().mockResolvedValue('result2'),
                }

                const result = await safeParallelExecute(operations)

                expect(result).toEqual({
                    task1: { data: 'result1', error: null },
                    task2: { data: 'result2', error: null },
                })
            })

            it('一部の操作が失敗した場合', async () => {
                const operations = {
                    task1: jest.fn().mockResolvedValue('result1'),
                    task2: jest
                        .fn()
                        .mockRejectedValue(new Error('Task 2 failed')),
                }

                const result = await safeParallelExecute(operations)

                expect(result).toEqual({
                    task1: { data: 'result1', error: null },
                    task2: { data: null, error: 'Task 2 failed' },
                })
            })
        })
    })

    describe('Utility Functions', () => {
        describe('setApiClientConfig', () => {
            it('グローバル設定を正しく設定すること', () => {
                const config = { baseUrl: 'https://api.example.com' }

                expect(() => setApiClientConfig(config)).not.toThrow()
            })
        })

        describe('default apiClient', () => {
            it('デフォルトAPIクライアントが存在すること', () => {
                expect(apiClient).toBeInstanceOf(UniversalApiClient)
            })
        })
    })

    describe('Edge Cases', () => {
        describe('URL handling', () => {
            it('baseUrlなしで相対URLを処理すること', async () => {
                const testClient = new UniversalApiClient()
                const mockResponse = createMockResponse(null)
                mockFetch.mockResolvedValue(mockResponse)

                await testClient.get('/test')

                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.any(Object)
                )
            })

            it('baseUrlありで相対URLを処理すること', async () => {
                const testClient = new UniversalApiClient({
                    baseUrl: 'https://api.example.com',
                })
                const mockResponse = createMockResponse(null)
                mockFetch.mockResolvedValue(mockResponse)

                await testClient.get('/test')

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://api.example.com/test',
                    expect.any(Object)
                )
            })
        })

        describe('Request body handling', () => {
            it('GETとDELETEメソッドでbodyを追加しないこと', async () => {
                jest.clearAllMocks()
                const mockResponse = createMockResponse(null)
                mockFetch.mockResolvedValue(mockResponse)

                // GET
                await client.get('/test')
                expect(mockFetch).toHaveBeenNthCalledWith(
                    1,
                    'http://localhost:3001/test',
                    expect.not.objectContaining({
                        body: expect.anything(),
                    })
                )

                // DELETE
                await client.delete('/test')
                expect(mockFetch).toHaveBeenNthCalledWith(
                    2,
                    'http://localhost:3001/test',
                    expect.not.objectContaining({
                        body: expect.anything(),
                    })
                )
            })

            it('POST、PUT、PATCHメソッドでbodyとContent-Typeを追加すること', async () => {
                jest.clearAllMocks()
                const data = { test: 'data' }
                const mockResponse = createMockResponse(null)
                mockFetch.mockResolvedValue(mockResponse)

                // POST
                await client.post('/test', data)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                        }),
                    })
                )

                // PUT
                await client.put('/test', data)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.objectContaining({
                        method: 'PUT',
                        body: JSON.stringify(data),
                    })
                )

                // PATCH
                await client.patch('/test', data)
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/test',
                    expect.objectContaining({
                        method: 'PATCH',
                        body: JSON.stringify(data),
                    })
                )
            })
        })
    })
})
