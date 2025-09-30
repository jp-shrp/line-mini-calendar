import { createItem, getItem, updateItem } from '@/actions/ItemAction'
import { ICreateItem, IUpdateItem } from '@/models/samples/Item'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { itemsQueryKeys } from '../../api/query-key'
import { itemDetailQueryKeys } from './query-key'

export const useItemDetailQuery = (id: number) => {
    return useQuery({
        queryKey: itemDetailQueryKeys.detail(id),
        queryFn: () => getItem(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 0,
        enabled: !!id,
    })
}

export const useCreateItemMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (item: ICreateItem) => createItem(item),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: itemsQueryKeys.all,
            })
        },
    })
}

export const useUpdateItemMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (item: IUpdateItem) => updateItem(item),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: itemsQueryKeys.all,
            })
            queryClient.invalidateQueries({
                queryKey: itemDetailQueryKeys.detail(variables.id),
            })
        },
    })
}
