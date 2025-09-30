import { Model } from '@team-decorate/alcts'

export type IProductDetail = {
    id: number
    productId?: number
    isExample: number
    usage?: string
    helpfulBody?: string
    spHelpfulBody?: string
    optionBody?: string
    spOptionBody?: string
    columnNumber?: number
    step?: number
    sizeImagePath?: string
    outsideWidth?: number
    outsideDepth?: number
    outsideHeight?: number
    insideWidth?: number
    insideDepth?: number
    insideHeight?: number
    frontageWidth?: number
    frontageDepth?: number
    frontageHeight?: number
    mass?: number
    capacity?: number
    accessories?: string
    drawerInsideWidth?: number
    drawerInsideDepth?: number
    drawerInsideHeight?: number
    historyCount?: number
    remarks?: string
    displayHelpfulBody?: string
    displayOptionBody?: string
}

export type IProductDetailResponse = CamelToSnake<IProductDetail>

export class ProductDetail extends Model implements IProductDetail {
    id = 0
    productId = 0
    isExample = 0
    usage = ''
    helpfulBody = ''
    spHelpfulBody = ''
    optionBody = ''
    spOptionBody = ''
    columnNumber = 0
    step = 0
    sizeImagePath = ''
    outsideWidth = 0
    outsideDepth = 0
    outsideHeight = 0
    insideWidth = 0
    insideDepth = 0
    insideHeight = 0
    frontageWidth = 0
    frontageDepth = 0
    frontageHeight = 0
    mass = 0
    capacity = 0
    accessories = ''
    drawerInsideWidth = 0
    drawerInsideDepth = 0
    drawerInsideHeight = 0
    historyCount = 0
    remarks = ''
    displayHelpfulBody = ''
    displayOptionBody = ''

    constructor(data: object = {}) {
        super()

        this.arrayMap()
        this.data = data
    }
}
