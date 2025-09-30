import { UniversalApiClient } from '@/lib/universal-api-client'
import ApiClientDemo from './components/ApiClientDemo'
import ValidationErrorDemo from './components/ValidationErrorDemo'
import TestEndpointDemo from './components/TestEndpointDemo'

// SSRでの初期データ取得用
async function getInitialData() {
    try {
        const apiClient = new UniversalApiClient({
            baseUrl: 'http://localhost:3001',
            timeout: 5000,
        })

        const result = await apiClient.get('/api/users')

        if (result.success) {
            return {
                initialUsers: result.data,
                serverTime: new Date().toISOString(),
                connectionStatus: 'success',
            }
        }

        return {
            initialUsers: null,
            serverTime: new Date().toISOString(),
            connectionStatus: 'error',
            error: 'エラーが発生しました',
        }
    } catch (error) {
        return {
            initialUsers: null,
            serverTime: new Date().toISOString(),
            connectionStatus: 'error',
            error: (error as Error).message,
        }
    }
}

export default async function UniversalApiClientSamples() {
    const initialData = await getInitialData()

    return (
        <div className="container mx-auto space-y-8 p-6">
            <h1 className="mb-6 text-3xl font-bold">
                Universal API Client サンプル
            </h1>

            {/* 接続状況 - SSRで取得した情報 */}
            <div className="rounded-lg bg-gray-100 p-4">
                <h2 className="mb-2 text-xl font-semibold">
                    Mock Server 接続状況 (SSR)
                </h2>
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        ベースURL: http://localhost:3001
                    </p>
                    <p className="text-sm text-gray-600">
                        サーバー時刻:{' '}
                        {new Date(initialData.serverTime).toLocaleString()}
                    </p>
                    <p
                        className={`text-sm ${initialData.connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        接続状況:{' '}
                        {initialData.connectionStatus === 'success'
                            ? '✓ 正常'
                            : '✗ エラー'}
                    </p>
                    {initialData.error && (
                        <p className="text-sm text-red-600">
                            エラー詳細: {initialData.error}
                        </p>
                    )}
                    {initialData.initialUsers && (
                        <p className="text-sm text-blue-600">
                            初期データ: {initialData.initialUsers.total || 0}
                            人のユーザーを取得
                        </p>
                    )}
                    <p className="text-sm text-gray-600">
                        ※ Mock serverが起動していることを確認してください:{' '}
                        <code>npm run mock:dev</code>
                    </p>
                </div>
            </div>

            {/* 422バリデーションエラーデモ */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h2 className="mb-4 text-xl font-semibold text-orange-800">
                    422バリデーションエラーデモ
                </h2>
                <p className="mb-4 text-sm text-orange-700">
                    React Hook Form + Zod +
                    API連携による422バリデーションエラーハンドリングのデモです。
                </p>
                <ValidationErrorDemo />
            </div>

            {/* テストエンドポイントデモ */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h2 className="mb-4 text-xl font-semibold text-purple-800">
                    テストエンドポイントデモ
                </h2>
                <p className="mb-4 text-sm text-purple-700">
                    200系、400系、422系のHTTPステータスコードをテストできるエンドポイントのデモです。
                    422系エラーは自動的にフォームエラーとして反映されます。
                </p>
                <TestEndpointDemo />
            </div>

            {/* CSRコンポーネント */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-4 text-xl font-semibold text-blue-800">
                    クライアントサイド機能デモ
                </h2>
                <p className="mb-4 text-sm text-blue-700">
                    以下はクライアントサイドで動作するReactフックを使用したAPI操作のデモです。
                </p>
                <ApiClientDemo />
            </div>
        </div>
    )
}
