export const itemsQueryKeys = {
    all: ['items'] as const,
    lists: () => [...itemsQueryKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
        [...itemsQueryKeys.lists(), { filters }] as const,
    details: () => [...itemsQueryKeys.all, 'detail'] as const,
    detail: (id: number) => [...itemsQueryKeys.details(), id] as const,
}
