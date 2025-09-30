import { Request, Response, Router } from 'express'

export const testRoutes = Router()

// GET /api/test/success - 200系テスト
testRoutes.get('/success', (req: Request, res: Response) => {
    res.json({
        message: '成功のテストです',
        data: {
            timestamp: new Date().toISOString(),
            status: 'success',
        },
    })
})

// GET /api/test/error - 400系テスト
testRoutes.get('/error', (req: Request, res: Response) => {
    res.status(400).json({
        error: 'Bad Request',
        message: '400エラーのテストです',
    })
})

// POST /api/test/success - 200系テスト (POST)
testRoutes.post('/success', (req: Request, res: Response) => {
    const { name, email } = req.body

    res.status(201).json({
        message: 'データが正常に作成されました',
        data: {
            id: Math.floor(Math.random() * 1000),
            name: name || 'テストユーザー',
            email: email || 'test@example.com',
            createdAt: new Date().toISOString(),
        },
    })
})

// POST /api/test/error - 400系テスト (POST)
testRoutes.post('/error', (req: Request, res: Response) => {
    res.status(400).json({
        error: 'Bad Request',
        message: 'POSTリクエストで400エラーのテストです',
    })
})

// POST /api/test/validation - 422系テスト (バリデーションエラー)
testRoutes.post('/validation', (req: Request, res: Response) => {
    const { name, email, age } = req.body

    const errors: Record<string, string[]> = {}

    // nameのバリデーション
    if (!name || typeof name !== 'string') {
        errors.name = ['名前は必須です']
    } else if (name.length < 2) {
        errors.name = ['名前は2文字以上で入力してください']
    }

    // emailのバリデーション
    if (!email || typeof email !== 'string') {
        errors.email = ['メールアドレスは必須です']
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ['有効なメールアドレスを入力してください']
    }

    // ageのバリデーション
    if (age !== undefined) {
        if (typeof age !== 'number') {
            errors.age = ['年齢は数値で入力してください']
        } else if (age < 0 || age > 150) {
            errors.age = ['年齢は0から150の間で入力してください']
        }
    }

    // エラーがある場合は422を返す
    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: 'The given data was invalid.',
            errors: errors,
        })
    }

    // 成功の場合
    res.status(201).json({
        message: 'バリデーションが成功しました',
        data: {
            id: Math.floor(Math.random() * 1000),
            name,
            email,
            age: age || null,
            createdAt: new Date().toISOString(),
        },
    })
})

// PUT /api/test/success - 200系テスト (PUT)
testRoutes.put('/success/:id', (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email } = req.body

    res.json({
        message: 'データが正常に更新されました',
        data: {
            id: parseInt(id, 10),
            name: name || 'テストユーザー',
            email: email || 'test@example.com',
            updatedAt: new Date().toISOString(),
        },
    })
})

// PUT /api/test/error - 400系テスト (PUT)
testRoutes.put('/error/:id', (req: Request, res: Response) => {
    res.status(400).json({
        error: 'Bad Request',
        message: 'PUTリクエストで400エラーのテストです',
    })
})

// PUT /api/test/validation - 422系テスト (バリデーションエラー)
testRoutes.put('/validation/:id', (req: Request, res: Response) => {
    const { name, email, age } = req.body

    const errors: Record<string, string[]> = {}

    // nameのバリデーション（PUTの場合は必須ではない）
    if (name !== undefined) {
        if (typeof name !== 'string') {
            errors.name = ['名前は文字列で入力してください']
        } else if (name.length < 2) {
            errors.name = ['名前は2文字以上で入力してください']
        }
    }

    // emailのバリデーション
    if (email !== undefined) {
        if (typeof email !== 'string') {
            errors.email = ['メールアドレスは文字列で入力してください']
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = ['有効なメールアドレスを入力してください']
        }
    }

    // ageのバリデーション
    if (age !== undefined) {
        if (typeof age !== 'number') {
            errors.age = ['年齢は数値で入力してください']
        } else if (age < 0 || age > 150) {
            errors.age = ['年齢は0から150の間で入力してください']
        }
    }

    // エラーがある場合は422を返す
    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: 'The given data was invalid.',
            errors: errors,
        })
    }

    // 成功の場合
    res.json({
        message: 'バリデーションが成功しました',
        data: {
            id: parseInt(req.params.id, 10),
            name: name || 'テストユーザー',
            email: email || 'test@example.com',
            age: age || null,
            updatedAt: new Date().toISOString(),
        },
    })
})
