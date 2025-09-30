import { fakerJA as faker } from '@faker-js/faker'
import { Request, Response, Router } from 'express'
import { sleep } from '../lib/util'

export const itemsRoutes = Router()

// サンプルデータ (snake_case)
const sampleItemsSnakeCase = [
    {
        id: 1,
        name: 'スマートセーフ Pro',
        description:
            '最新のBluetooth技術を搭載したスマートセーフです。アプリから開閉状態を確認でき、遠隔操作も可能です。',
        price: 89800,
        category: '家庭用金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 15,
        is_available: true,
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-09-18T10:30:00Z',
        detail: {
            id: 1,
            item_id: 1,
            specification: 'Bluetooth 5.0対応、リモート操作機能',
            dimensions: '35cm × 25cm × 25cm',
            weight: 12.5,
            warranty: '3年保証',
            features: ['Bluetooth対応', 'アプリ連携', '緊急開錠機能'],
            created_at: '2024-01-15T09:00:00Z',
            updated_at: '2024-09-18T10:30:00Z',
        },
    },
    {
        id: 2,
        name: 'ファイアセーフ Standard',
        description:
            '耐火性能に優れた金庫です。1時間の耐火テストをクリアし、重要書類を火災から守ります。',
        price: 45600,
        category: '耐火金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 8,
        is_available: true,
        created_at: '2024-02-01T14:20:00Z',
        updated_at: '2024-09-15T16:45:00Z',
        detail: {
            id: 2,
            item_id: 2,
            specification: '1時間耐火、JIS規格適合',
            dimensions: '40cm × 30cm × 30cm',
            weight: 18.2,
            warranty: '5年保証',
            features: ['1時間耐火', 'JIS規格適合', '重要書類保護'],
            created_at: '2024-02-01T14:20:00Z',
            updated_at: '2024-09-15T16:45:00Z',
        },
    },
    {
        id: 3,
        name: 'コンパクトセーフ Mini',
        description:
            '小型でありながら高いセキュリティを提供します。デスクの下や棚に設置できるコンパクトサイズです。',
        price: 12800,
        category: '小型金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 25,
        is_available: true,
        created_at: '2024-03-10T11:15:00Z',
        updated_at: '2024-09-10T13:20:00Z',
        detail: {
            id: 3,
            item_id: 3,
            specification: 'コンパクト設計、鍵+ダイヤルロック',
            dimensions: '25cm × 20cm × 15cm',
            weight: 5.8,
            warranty: '2年保証',
            features: ['コンパクト', 'デスクトップ置き', 'ダブルロック'],
            created_at: '2024-03-10T11:15:00Z',
            updated_at: '2024-09-10T13:20:00Z',
        },
    },
    {
        id: 4,
        name: 'ビジネスセーフ Enterprise',
        description:
            '法人向けの大容量金庫です。複数の認証方式に対応し、監査ログ機能も搭載しています。',
        price: 156000,
        category: '業務用金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 3,
        is_available: true,
        created_at: '2024-04-05T08:30:00Z',
        updated_at: '2024-09-12T09:15:00Z',
        detail: {
            id: 4,
            item_id: 4,
            specification: 'マルチ認証、監査ログ機能、ネットワーク対応',
            dimensions: '60cm × 45cm × 50cm',
            weight: 35.6,
            warranty: '10年保証',
            features: ['マルチ認証', '監査ログ', 'ネットワーク連携'],
            created_at: '2024-04-05T08:30:00Z',
            updated_at: '2024-09-12T09:15:00Z',
        },
    },
    {
        id: 5,
        name: 'ウォーターセーフ Aqua',
        description:
            '防水機能付きの金庫です。水害や洪水からも貴重品を守る特殊構造を採用しています。',
        price: 67500,
        category: '防水金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 0,
        is_available: false,
        created_at: '2024-05-20T15:45:00Z',
        updated_at: '2024-09-16T17:30:00Z',
        detail: {
            id: 5,
            item_id: 5,
            specification: 'IP67防水、水深120cmまで対応',
            dimensions: '45cm × 35cm × 35cm',
            weight: 22.8,
            warranty: '7年保証',
            features: ['IP67防水', '水害対策', 'シール構造'],
            created_at: '2024-05-20T15:45:00Z',
            updated_at: '2024-09-16T17:30:00Z',
        },
    },
    {
        id: 6,
        name: 'ポータブルセーフ Travel',
        description:
            '持ち運び可能な軽量金庫です。出張や旅行時の貴重品保管に最適です。',
        price: 8900,
        category: '携帯用金庫',
        image_path: faker.image.urlPicsumPhotos(),
        stock: 42,
        is_available: true,
        created_at: '2024-06-12T12:00:00Z',
        updated_at: '2024-09-14T14:25:00Z',
        detail: {
            id: 6,
            item_id: 6,
            specification: '軽量設計、ハンドル付き',
            dimensions: '30cm × 20cm × 10cm',
            weight: 2.5,
            warranty: '1年保証',
            features: ['軽量ポータブル', 'ハンドル付き', '旅行用'],
            created_at: '2024-06-12T12:00:00Z',
            updated_at: '2024-09-14T14:25:00Z',
        },
    },
]

let nextId = sampleItemsSnakeCase.length + 1

// GET /api/items - 商品一覧取得
itemsRoutes.get('/', async (req: Request, res: Response) => {
    await sleep(1)
    try {
        // クエリパラメータでエラーを強制発生させる場合（テスト用）
        if (req.query.forceError === 'true') {
            throw new Error('Forced server error for testing')
        }

        // errorパラメータでエラーを強制発生させる場合（テスト用）
        if (req.query.error === '400') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'リクエストが無効です',
            })
        }

        if (req.query.error === '422') {
            return res.status(422).json({
                message: 'The given data was invalid.',
                errors: {
                    name: ['商品名は必須です'],
                    price: ['価格は正の数値である必要があります'],
                },
            })
        }

        if (req.query.error === '500') {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'サーバー内部エラーが発生しました',
            })
        }

        res.json(sampleItemsSnakeCase)
    } catch (error) {
        console.error('Items API Error:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: 'アイテムの取得に失敗しました',
        })
    }
})

// GET /api/items/:id - 商品詳細取得
itemsRoutes.get('/:id', async (req: Request, res: Response) => {
    await sleep(1)
    try {
        const id = parseInt(req.params.id, 10)

        // errorパラメータでエラーを強制発生させる場合（テスト用）
        if (req.query.error === '400') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'リクエストが無効です',
            })
        }

        if (req.query.error === '404') {
            return res.status(404).json({
                error: 'Not Found',
                message: 'アイテムが見つかりません',
            })
        }

        if (req.query.error === '422') {
            return res.status(422).json({
                message: 'The given data was invalid.',
                errors: {
                    name: ['商品名は必須です'],
                    price: ['価格は正の数値である必要があります'],
                },
            })
        }

        if (req.query.error === '500') {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'サーバー内部エラーが発生しました',
            })
        }

        const item = sampleItemsSnakeCase.find((item) => item.id === id)

        if (!item) {
            return res.status(404).json({ error: 'Item not found' })
        }

        res.json(item)
    } catch (_error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/items - 商品作成
itemsRoutes.post('/', (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            price,
            category,
            imagePath,
            stock,
            isAvailable,
        } = req.body

        // バリデーション - 複数のエラーを収集
        const validationErrors: Record<string, string[]> = {}

        if (!name || typeof name !== 'string') {
            validationErrors.name = ['商品名は必須です']
        }

        if (typeof price !== 'number' || price < 0) {
            validationErrors.price = ['価格は0以上である必要があります']
        }

        if (!category || typeof category !== 'string') {
            validationErrors.category = ['カテゴリは必須です']
        }

        if (typeof stock !== 'number' || stock < 0) {
            validationErrors.stock = ['在庫数は0以上である必要があります']
        }

        // バリデーションエラーがある場合は422を返す
        if (Object.keys(validationErrors).length > 0) {
            return res.status(422).json({
                message: 'The given data was invalid.',
                errors: validationErrors,
            })
        }

        const newItemId = nextId++
        const newItemSnakeCase = {
            id: newItemId,
            name,
            description: description || '',
            price,
            category,
            image_path: imagePath || '',
            stock: stock || 0,
            is_available: isAvailable !== undefined ? isAvailable : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            detail: {
                id: newItemId,
                item_id: newItemId,
                specification: 'デフォルト仕様',
                dimensions: '未設定',
                weight: 0,
                warranty: '1年保証',
                features: ['基本機能'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        }

        sampleItemsSnakeCase.push(newItemSnakeCase)
        res.status(201).json(newItemSnakeCase)
    } catch (_error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/items/:id - 商品更新
itemsRoutes.put('/:id', async (req: Request, res: Response) => {
    await sleep(1.5)
    try {
        const id = parseInt(req.params.id, 10)
        const itemIndex = sampleItemsSnakeCase.findIndex(
            (item) => item.id === id
        )
        if (id === 4) {
            return res.status(400).json({ error: 'Bad Request' })
        }

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' })
        }

        const {
            name,
            description,
            price,
            category,
            imagePath,
            stock,
            isAvailable,
        } = req.body

        // バリデーション - 複数のエラーを収集
        const validationErrors: Record<string, string[]> = {}

        if (!name || typeof name !== 'string') {
            validationErrors.name = ['商品名は必須です。']
        }

        if (price !== undefined && (typeof price !== 'number' || price < 1)) {
            validationErrors.price = ['価格は0以上である必要があります']
        }

        if (!category || typeof category !== 'string') {
            validationErrors.category = ['カテゴリは必須です']
        }

        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            validationErrors.stock = ['在庫数は0以上である必要があります']
        }

        // バリデーションエラーがある場合は422を返す
        if (Object.keys(validationErrors).length > 0) {
            return res.status(422).json({
                message: 'The given data was invalid.',
                errors: validationErrors,
            })
        }

        // 更新
        const updatedItemSnakeCase = {
            ...sampleItemsSnakeCase[itemIndex],
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price }),
            ...(category && { category }),
            ...(imagePath !== undefined && { image_path: imagePath }),
            ...(stock !== undefined && { stock }),
            ...(isAvailable !== undefined && { is_available: isAvailable }),
            updated_at: new Date().toISOString(),
        }

        sampleItemsSnakeCase[itemIndex] = updatedItemSnakeCase
        res.json(updatedItemSnakeCase)
    } catch (_error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// DELETE /api/items/:id - 商品削除
itemsRoutes.delete('/:id', (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10)
        const itemIndex = sampleItemsSnakeCase.findIndex(
            (item) => item.id === id
        )

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' })
        }

        sampleItemsSnakeCase.splice(itemIndex, 1)
        res.status(204).send()
    } catch (_error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})
