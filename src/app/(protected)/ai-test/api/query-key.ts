/**
 * AI API用のReact Query Keys
 */
export const aiQueryKeys = {
    all: ['ai'] as const,
    search: (query: string) => [...aiQueryKeys.all, 'search', query] as const,
    register: (query: string) =>
        [...aiQueryKeys.all, 'register', query] as const,
}
