/**
 * ページネーション情報の基本型
 * フロントエンド・バックエンド共通で使用
 */
export type PaginationInfo = {
    limit: number
    offset: number
    total: number
    currentPage: number
}

/**
 * ページネーション結果の型
 */
export interface PaginationResult {
    page: number
    limit: number
    total: number
    totalPages: number
}

/**
 * usePaginationフックのオプション型
 */
export interface UsePaginationOptions {
    initialPage?: number
    initialLimit?: number
    total?: number
}

/**
 * usePaginationフックの戻り値型
 */
export interface UsePaginationReturn {
    currentPage: number
    limit: number
    total: number
    totalPages: number
    offset: number
    hasNext: boolean
    hasPrevious: boolean
    nextPage: () => void
    previousPage: () => void
    goToPage: (page: number) => void
    setLimit: (limit: number) => void
    setTotal: (total: number) => void
    reset: () => void
    getPaginationInfo: () => PaginationInfo
}
