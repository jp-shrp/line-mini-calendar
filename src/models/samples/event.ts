import { IIndexable, Model } from '@team-decorate/alcts'
import { SelectEvent } from '_shared/schemas/events'

const fillable: (keyof SelectEvent)[] = [
    'id',
    'title',
    'description',
    'startDatetime',
    'endDatetime',
    'userId',
    'category',
    'iconUrl',
    'color',
    'isDeleted',
    'searchKeywords',
    'createdAt',
    'updatedAt',
]

/**
 * Eventモデルクラス
 * イベント情報を管理するモデル
 */
export class Event extends Model implements SelectEvent {
    id = ''
    title = ''
    description: string | null = null
    image: string | null = null
    startDatetime = new Date()
    endDatetime = new Date()
    userId = ''
    category = ''
    iconUrl = ''
    color = ''
    isDeleted = false
    searchKeywords: string | null = null
    createdAt = new Date()
    updatedAt = new Date()

    constructor(data?: IIndexable) {
        super()
        this.convert = false

        this.fillable = fillable

        if (data) {
            this.data = data
        }
    }
}
