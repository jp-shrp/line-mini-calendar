import { useItemDetailQuery } from '../api/item-detail-query'

export const useItemDetail = (id: number) => {
    const { data: item, isLoading, error, refetch } = useItemDetailQuery(id)

    return {
        item,
        isLoading,
        error,
        refetch,
    }
}
