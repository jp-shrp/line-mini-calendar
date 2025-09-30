import { CamelToSnake } from '@/app/utils/typeUtil'
import { ArrayMappable, Model } from '@team-decorate/alcts'
import { IPerformance, Performance } from './Performance'
import { IProductDetail, ProductDetail } from './ProductDetail'

export interface ProductCardData {
    imageSrc: string
    imageAlt?: string
    lead?: string
    title: string
    description?: string
    price?: string
    isShippingIncluded?: boolean
    performanceIcons?: {
        id: string
        name: string
        image_path: string
        alt?: string
    }[]
    linkUrl: string
}

export type IProduct = {
    id: number
    directId?: number
    janCode?: string
    isEn: number
    name?: string
    description?: string
    categoryId?: number
    subcategoryId?: number
    productTypeId?: number
    lockSystemId?: number
    specification?: string
    imagePath?: string
    regularPrice?: string
    sellingPrice?: string
    isShow: number
    isShippingIncluded: boolean
    sort: number
    lockSystemTypeName: string
    storeListDescription: string
    storeImages: string[]
    mediaList: string[]
    performances: Array<IPerformance>[]
    detail: IProductDetail
}

export type IProductResponse = CamelToSnake<IProduct>

export class Product extends Model implements IProduct {
    id = 0
    directId = 0
    janCode = ''
    isEn = 0
    name = ''
    description = ''
    categoryId = 0
    subcategoryId = 0
    productTypeId = 0
    lockSystemId = 0
    specification = ''
    imagePath = ''
    regularPrice = ''
    sellingPrice = ''
    isShow = 0
    isShippingIncluded = false
    sort = 0

    lockSystemTypeName = ''
    storeListDescription = ''
    storeImages = []
    mediaList = []
    performances = []
    detail = new ProductDetail()

    constructor(data: object = {}) {
        super()

        this.arrayMap(new ArrayMappable(Performance))
        this.data = data
    }
}
