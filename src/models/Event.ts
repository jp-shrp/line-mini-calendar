import { IIndexable, Model } from '@team-decorate/alcts'
import { SelectEvent } from '_shared/schemas/events'
import { format } from 'date-fns'

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
    startDatetime = new Date()
    endDatetime = new Date()
    userId = ''
    category = ''
    iconUrl: string | null = null
    color: string | null = null
    isDeleted = false
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

    /**
     * 開始時刻を "HH:MM" 形式で取得
     */
    get startTime(): string {
        return format(new Date(this.startDatetime), 'HH:mm')
    }

    /**
     * 終了時刻を "HH:MM" 形式で取得
     */
    get endTime(): string {
        return format(new Date(this.endDatetime), 'HH:mm')
    }

    /**
     * アイコンURLを取得（画面表示用）
     */
    get icon(): string | undefined {
        return this.iconUrl || undefined
    }

    /**
     * カラークラスを取得（デフォルトはbg-gray-500）
     */
    get colorClass(): string {
        return this.color || 'bg-gray-500'
    }
}

/**
 * 今後のイベント用の型定義
 * Event型のサブセット
 */
export type UpcomingEvent = Pick<
    Event,
    'id' | 'title' | 'startTime' | 'endTime' | 'colorClass'
>
