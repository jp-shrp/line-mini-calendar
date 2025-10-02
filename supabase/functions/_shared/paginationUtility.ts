import type { PaginationInfo } from '_shared/types/pagination-types'

export type { PaginationInfo } from '_shared/types/pagination-types'

export function getPaginationInfo(pagination: Partial<PaginationInfo>) {
    const limit = pagination.limit || 15
    const currentPage = pagination.currentPage || 1
    const offset = (currentPage - 1) * limit
    return {
        limit,
        offset,
        total: pagination.total || 0,
        currentPage,
    }
}

export function getPaginationInfoFromRequest(c: any) {
    const limit = parseInt(c.req.query('limit') || '20', 10)
    const page = parseInt(c.req.query('page') || '1', 10)
    return getPaginationInfo({ limit, currentPage: page })
}
