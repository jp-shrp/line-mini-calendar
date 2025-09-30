import { getItems } from '@/actions/ItemAction'
import { useQuery } from '@tanstack/react-query'
import { itemsQueryKeys } from './query-key'

export const useItemsQuery = () => {
    return useQuery({
        queryKey: itemsQueryKeys.lists(),
        queryFn: () => getItems(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}
