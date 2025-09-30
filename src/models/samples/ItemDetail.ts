import { CamelToSnake } from '@/app/utils/typeUtil'
import { IIndexable, Model } from '@team-decorate/alcts'
import { z } from 'zod'

export const ItemDetailSchema = z.object({
    id: z.number(),
    itemId: z.number(),
    specification: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.number().optional(),
    warranty: z.string().optional(),
    features: z.array(z.string()).default([]),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

const fillable = [
    'id',
    'itemId',
    'specification',
    'dimensions',
    'weight',
    'warranty',
    'features',
    'createdAt',
    'updatedAt',
]

export type IItemDetail = z.infer<typeof ItemDetailSchema>

// APIレスポンス型（snake_case）
export type IItemDetailResponse = CamelToSnake<IItemDetail>

export class ItemDetail extends Model implements IItemDetail {
    id = 0
    itemId = 0
    specification = ''
    dimensions = ''
    weight = 0
    warranty = ''
    features: string[] = []
    createdAt = ''
    updatedAt = ''

    constructor(data?: IIndexable) {
        super()

        this.fillable = fillable

        if (data) {
            this.data = data
        }
    }
}
