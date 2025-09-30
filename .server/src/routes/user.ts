import { Router } from 'express'

export const userRoutes = Router()

const mockUsersSnakeCase = [
    {
        id: 1,
        name: 'テストユーザー1',
        email: 'user1@example.com',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: 'テストユーザー2',
        email: 'user2@example.com',
        created_at: '2024-01-02T00:00:00Z',
    },
]

userRoutes.get('/', (_, res) => {
    res.json({
        users: mockUsersSnakeCase,
        total: mockUsersSnakeCase.length,
    })
})

userRoutes.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id)
    const user = mockUsersSnakeCase.find((u) => u.id === userId)

    if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' })
    }

    res.json(user)
})

userRoutes.post('/', (req, res) => {
    const { name, email } = req.body

    if (!name || !email) {
        return res.status(400).json({ error: 'nameとemailは必須です' })
    }

    const newUserSnakeCase = {
        id: mockUsersSnakeCase.length + 1,
        name,
        email,
        created_at: new Date().toISOString(),
    }

    mockUsersSnakeCase.push(newUserSnakeCase)
    res.status(201).json(newUserSnakeCase)
})

// 422バリデーションエラーテスト用エンドポイント
userRoutes.post('/validation-test', (req, res) => {
    const { name, email, age, password, confirmPassword, terms } = req.body

    // バリデーションエラーを収集
    const errors: Array<{ field: string; message: string }> = []

    // 既存メールアドレスのチェック（テスト用）
    if (email === 'existing@example.com') {
        errors.push({
            field: 'email',
            message: 'このメールアドレスは既に使用されています',
        })
    }

    // サーバーサイドバリデーション
    if (!name || name.length < 2) {
        errors.push({
            field: 'name',
            message: 'お名前は2文字以上で入力してください（サーバー）',
        })
    }

    if (!email || !email.includes('@')) {
        errors.push({
            field: 'email',
            message: '正しいメールアドレスを入力してください（サーバー）',
        })
    }

    if (!age || age < 0 || age > 120) {
        errors.push({
            field: 'age',
            message: '年齢は0-120の範囲で入力してください（サーバー）',
        })
    }

    if (!password || password.length < 8) {
        errors.push({
            field: 'password',
            message: 'パスワードは8文字以上で入力してください（サーバー）',
        })
    }

    if (password !== confirmPassword) {
        errors.push({
            field: 'confirmPassword',
            message: 'パスワードが一致しません（サーバー）',
        })
    }

    if (!terms) {
        errors.push({
            field: 'terms',
            message: '利用規約に同意してください（サーバー）',
        })
    }

    // エラーがある場合は422を返す
    if (errors.length > 0) {
        // Laravel標準のバリデーションエラーレスポンス
        const laravelErrors: Record<string, string[]> = {}
        errors.forEach((error) => {
            if (!laravelErrors[error.field]) {
                laravelErrors[error.field] = []
            }
            laravelErrors[error.field].push(error.message)
        })

        // Laravel標準メッセージ形式: 最初のエラー + 追加エラー数
        const firstError = errors[0]
        const additionalErrors = errors.length - 1
        const message =
            additionalErrors > 0
                ? `${firstError.message} (and ${additionalErrors} more error${additionalErrors > 1 ? 's' : ''})`
                : firstError.message

        return res.status(422).json({
            message,
            errors: laravelErrors,
        })
    }

    // 成功時のレスポンス
    const newUserSnakeCase = {
        id: mockUsersSnakeCase.length + 1,
        name,
        email,
        age,
        created_at: new Date().toISOString(),
    }

    mockUsersSnakeCase.push(newUserSnakeCase)
    res.status(201).json(newUserSnakeCase)
})
