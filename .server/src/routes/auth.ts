import { Router } from 'express'

export const authRoutes = Router()

authRoutes.post('/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'emailとpasswordは必須です' })
    }

    if (email === 'test@example.com' && password === 'password') {
        res.json({
            success: true,
            token: 'mock-jwt-token',
            user: {
                id: 1,
                email,
                name: 'テストユーザー',
            },
        })
    } else {
        res.status(401).json({ error: '認証に失敗しました' })
    }
})

authRoutes.post('/logout', (req, res) => {
    res.json({ success: true, message: 'ログアウトしました' })
})

authRoutes.get('/me', (req, res) => {
    const token = req.headers.authorization

    if (!token || token !== 'Bearer mock-jwt-token') {
        return res.status(401).json({ error: '認証が必要です' })
    }

    res.json({
        id: 1,
        email: 'test@example.com',
        name: 'テストユーザー',
    })
})
