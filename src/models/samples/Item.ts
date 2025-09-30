import { CamelToSnake, defineAllKeys } from '@/app/utils/typeUtil'
import { IIndexable, Model, Relation } from '@team-decorate/alcts'
import { z } from 'zod'
import { ItemDetail } from './ItemDetail'

export const ItemSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(1, '商品名は必須です')
        .max(100, '商品名は100文字以下で入力してください'),
    description: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 500, {
            message: '説明は500文字以下で入力してください',
        }),
    price: z
        .number()
        .min(0, '価格は0以上である必要があります')
        .max(10000000, '価格は10,000,000円以下で入力してください'),
    category: z
        .string()
        .min(1, 'カテゴリは必須です')
        .max(50, 'カテゴリは50文字以下で入力してください'),
    imagePath: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true
                try {
                    new URL(val)
                    return true
                } catch {
                    return false
                }
            },
            {
                message: '有効なURL形式で入力してください',
            }
        ),
    stock: z
        .number()
        .min(0, '在庫数は0以上である必要があります')
        .max(99999, '在庫数は99,999以下で入力してください'),
    isAvailable: z.boolean().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

// リクエスト用型定義（Create）
export const CreateItemSchema = ItemSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export type ICreateItem = z.infer<typeof CreateItemSchema>

// リクエスト用型定義（Update）
export const UpdateItemSchema = ItemSchema.partial().required({ id: true })

export type IUpdateItem = z.infer<typeof UpdateItemSchema>

// フォーム用型定義（Create）
export const CreateItemFormSchema = CreateItemSchema

export type ICreateItemForm = z.infer<typeof CreateItemFormSchema>

// フォーム用型定義（Update）
export const UpdateItemFormSchema = UpdateItemSchema.omit({ id: true })

export type IUpdateItemForm = z.infer<typeof UpdateItemFormSchema>

type IFillable = IUpdateItem & { detail: string }

const fillable = defineAllKeys<IFillable>()([
    'id',
    'name',
    'description',
    'price',
    'category',
    'imagePath',
    'stock',
    'isAvailable',
    'createdAt',
    'updatedAt',

    'detail',
])

export type IItem = z.infer<typeof ItemSchema>

// APIレスポンス型（snake_case）
export type IItemResponse = CamelToSnake<IItem>

export class Item extends Model implements IItem {
    id = 0
    name = ''
    description = ''
    price = 0
    category = ''
    imagePath = ''
    stock = 0
    isAvailable = true
    createdAt = ''
    updatedAt = ''

    // ItemDetailとのリレーション
    detail = new Relation(ItemDetail)

    convertCache: boolean

    constructor(data?: IIndexable) {
        super()

        this.fillable = fillable
        this.convertCache = this.convert

        if (data) {
            this.data = data
        }
    }

    beforePostable(): void {
        this.convert = false
    }
    afterPostable(_res: IIndexable): void {
        this.convert = this.convertCache
    }
}
