/**
 * Calendar APIのクエリキー定義
 *
 * 階層構造でクエリキーを定義し、キャッシュの無効化を容易にします。
 * 例:
 * - ['events'] - すべてのイベント関連キャッシュを無効化
 * - ['events', 'items', 'list'] - リスト系のキャッシュを無効化
 * - ['events', 'items', 'detail', '123'] - 特定のイベント詳細キャッシュを無効化
 */

export const eventQueryKeys = {
    all: ['events'] as const,
    items: () => [...eventQueryKeys.all, 'items'] as const,
    lists: () => [...eventQueryKeys.items(), 'list'] as const,
    list: (filters: {
        startDate?: string
        endDate?: string
        category?: string
        page?: number
        limit?: number
    }) => [...eventQueryKeys.lists(), { filters }] as const,
    details: () => [...eventQueryKeys.items(), 'detail'] as const,
    detail: (id: string) => [...eventQueryKeys.details(), id] as const,
}
