import { apiClient } from '@/lib/universal-api-client'

// モックサーバーのベースURL設定
const mockServerUrl = process.env.MOCK_SERVER_URL || 'http://localhost:3001'

export interface TestData {
    name: string
    email: string
    age?: number
}

export interface TestResponse {
    id: number
    name: string
    email: string
    age?: number | null
    createdAt?: string
    updatedAt?: string
}

// GET 200系テスト
export const getSuccessTest = async () => {
    return await apiClient.get<{ message: string; data: any }>(
        `${mockServerUrl}/api/test/success`,
        {
            fallbackData: null,
            customErrorMessage: '成功テストの取得に失敗しました',
        }
    )
}

// GET 400系テスト
export const getErrorTest = async () => {
    return await apiClient.get<any>(`${mockServerUrl}/api/test/error`, {
        fallbackData: null,
        customErrorMessage: 'エラーテストの取得に失敗しました',
    })
}

// POST 200系テスト
export const postSuccessTest = async (data: TestData) => {
    return await apiClient.post<{ message: string; data: TestResponse }>(
        `${mockServerUrl}/api/test/success`,
        data,
        {
            fallbackData: null,
            customErrorMessage: '成功テストの送信に失敗しました',
        }
    )
}

// POST 400系テスト
export const postErrorTest = async (data: TestData) => {
    return await apiClient.post<any>(`${mockServerUrl}/api/test/error`, data, {
        fallbackData: null,
        customErrorMessage: 'エラーテストの送信に失敗しました',
    })
}

// POST 422系テスト（バリデーションエラー）
export const postValidationTest = async (data: TestData) => {
    return await apiClient.post<{ message: string; data: TestResponse }>(
        `${mockServerUrl}/api/test/validation`,
        data,
        {
            fallbackData: null,
            customErrorMessage: 'バリデーションテストの送信に失敗しました',
        }
    )
}

// PUT 200系テスト
export const putSuccessTest = async (id: number, data: Partial<TestData>) => {
    return await apiClient.put<{ message: string; data: TestResponse }>(
        `${mockServerUrl}/api/test/success/${id}`,
        data,
        {
            fallbackData: null,
            customErrorMessage: '成功テストの更新に失敗しました',
        }
    )
}

// PUT 400系テスト
export const putErrorTest = async (id: number, data: Partial<TestData>) => {
    return await apiClient.put<any>(
        `${mockServerUrl}/api/test/error/${id}`,
        data,
        {
            fallbackData: null,
            customErrorMessage: 'エラーテストの更新に失敗しました',
        }
    )
}

// PUT 422系テスト（バリデーションエラー）
export const putValidationTest = async (
    id: number,
    data: Partial<TestData>
) => {
    return await apiClient.put<{ message: string; data: TestResponse }>(
        `${mockServerUrl}/api/test/validation/${id}`,
        data,
        {
            fallbackData: null,
            customErrorMessage: 'バリデーションテストの更新に失敗しました',
        }
    )
}
