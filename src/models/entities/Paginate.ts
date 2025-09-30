import type { Model, IIndexable } from '@team-decorate/alcts'

export type IPaginate<T> = {
    current_page: number
    first_page_url: string
    last_page_url: string
    from?: number
    path: string
    per_page: number
    last_page: number
    to?: number
    total: number
    next_page_url?: string
    prev_page_url?: string
    data: T[]
}

export class Paginate<T extends Model> {
    current_page = 0
    first_page_url = ''
    last_page_url = ''
    from = 0
    path = ''
    per_page = 0
    last_page = 0
    to = 0
    total = 0
    next_page_url = ''
    prev_page_url = ''
    data: T[] = []

    constructor(model: { new (data: IIndexable): T }, data?: IPaginate<T>) {
        if (data) {
            this.current_page = data.current_page
            this.first_page_url = data.first_page_url
            this.last_page_url = data.last_page_url
            this.prev_page_url = data.prev_page_url ?? ''
            this.from = data.from ?? 0
            this.path = data.path
            this.per_page = data.per_page
            this.last_page = data.last_page
            this.to = data.to ?? 0
            this.total = data.total
            this.data = data.data.map((x) => new model(x))
        }
    }

    static initializeData<T>() {
        return {
            current_page: 0,
            first_page_url: '',
            last_page_url: '',
            from: 0,
            path: '',
            per_page: 0,
            last_page: 0,
            to: 0,
            total: 0,
            next_page_url: '',
            prev_page_url: '',
            data: [] as T[],
        }
    }
}
