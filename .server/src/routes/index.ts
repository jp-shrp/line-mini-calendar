import { Router } from 'express'
import { authRoutes } from './auth'
import { itemsRoutes } from './items'
import { testRoutes } from './route-testing'
import { userRoutes } from './user'

export const mockRoutes = Router()

mockRoutes.use('/users', userRoutes)
mockRoutes.use('/auth', authRoutes)
mockRoutes.use('/items', itemsRoutes)
mockRoutes.use('/test', testRoutes)

mockRoutes.get('/', (req, res) => {
    res.json({
        message: 'Eiko Direct Mock API',
        version: '1.0.0',
        endpoints: ['/api/users', '/api/auth', '/api/items', '/api/test'],
    })
})
