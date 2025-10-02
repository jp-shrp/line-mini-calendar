import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
    apiHandler,
    initApi,
    type Variables,
    createValidationError,
    createInternalServerError,
} from '../_shared/middlewares/middleware.ts'

// サブAPIのインポート
import samplesUsersApi from './samples-users-api.ts'

// 型拡張 - Honoのコンテキストにユーザー情報を追加

export type SamplesVariables = Variables & {
    user: any
    supabase: any
}

// 共通初期化関数を使ってAPIアプリケーションを初期化
const app = initApi<{ Variables: SamplesVariables }>('/samples-api')

// テスト用エラーエンドポイント
app.get(
    '/test-error/400',
    apiHandler(async (c) => {
        throw createValidationError(
            { field: 'test', message: 'これはテスト用の400エラーです' },
            'テストデータのバリデーションに失敗しました'
        )
    })
)

app.get(
    '/test-error/500',
    apiHandler(async (c) => {
        throw createInternalServerError(
            'これはテスト用の500エラーです。システムエラーをシミュレートしています。'
        )
    })
)

// ルート定義
app.get(
    '/',
    apiHandler(async (c) => {
        return c.json({
            message: 'Samples API is running',
            timestamp: new Date().toISOString(),
        })
    })
)

// サブAPIをルーティング
app.route('/users', samplesUsersApi)

// Deno Edge Functions用のexport
Deno.serve(app.fetch)
