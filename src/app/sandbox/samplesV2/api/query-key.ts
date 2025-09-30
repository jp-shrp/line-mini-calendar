export const samplesV2QueryKeys = {
    all: ['samplesV2'] as const,
    items: () => [...samplesV2QueryKeys.all, 'items'] as const,
    itemsList: (limit?: number, offset?: number) =>
        [...samplesV2QueryKeys.items(), 'list', { limit, offset }] as const,
    itemsListWithError: (errorType: string, limit?: number, offset?: number) =>
        [
            ...samplesV2QueryKeys.items(),
            'list',
            'error',
            { errorType, limit, offset },
        ] as const,
    itemDetail: (id: number) =>
        [...samplesV2QueryKeys.items(), 'detail', id] as const,
    itemDetailWithError: (id: number, errorType: string) =>
        [
            ...samplesV2QueryKeys.items(),
            'detail',
            id,
            'error',
            errorType,
        ] as const,
}
