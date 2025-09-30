import { useItemsQuery } from '../api/items-query'

export const useItems = () => {
    const { data: items, isLoading, error, refetch } = useItemsQuery()

    return {
        items: items || [],
        isLoading,
        error,
        refetch,
    }
}
