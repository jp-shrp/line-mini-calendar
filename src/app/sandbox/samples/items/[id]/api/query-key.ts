export const itemDetailQueryKeys = {
    all: ['itemDetail'] as const,
    details: () => [...itemDetailQueryKeys.all, 'detail'] as const,
    detail: (id: number) => [...itemDetailQueryKeys.details(), id] as const,
}
