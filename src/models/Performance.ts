import { Model } from '@team-decorate/alcts'

export type IPerformance = {
    id: number
    type: number
    name: string
    description?: string
    descriptionEn?: string
    imagePath?: string
    imagePathEn?: string
    storeDescription?: string
    spStoreDescription?: string
    storeIsShow: number
    sort: number
    typeName: string
    mediaList: string[]
    displayStoreDescription?: string
}

export type IPerformanceResponse = CamelToSnake<IPerformance>

export class Performance extends Model implements IPerformance {
    id = 0
    type = 1
    name = ''
    description = ''
    descriptionEn = ''
    imagePath = ''
    imagePathEn = ''
    storeDescription = ''
    spStoreDescription = ''
    storeIsShow = 0
    sort = 0
    typeName = ''
    mediaList = []
    displayStoreDescription = ''
}
