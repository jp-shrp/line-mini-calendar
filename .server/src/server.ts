import express from 'express'
import cors from 'cors'
import { mockRoutes } from './routes'

const app = express()
const PORT = process.env.MOCK_PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', mockRoutes)

app.get('/health', (_, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
    console.log(`Mock server is running on http://localhost:${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
})
