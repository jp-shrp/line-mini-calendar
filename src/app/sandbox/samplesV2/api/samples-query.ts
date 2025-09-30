import {
    createItem,
    getItem,
    getItemsWithError,
    getItemsWithLimit,
    getItemWithError,
    updateItem,
} from '@/actions/ItemAction'
import {
    ICreateItemForm,
    IItemResponse,
    IUpdateItem,
    IUpdateItemForm,
} from '@/models/samples/Item'
import {
    useApiMutation,
    UseApiMutationFormOptions,
} from '@/lib/universal-api-client'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { samplesV2QueryKeys } from './query-key'

export const useItemsWithLimitQuery = <TData = IItemResponse[]>(
    limit?: number,
    offset?: number,
    options?: Omit<
        UseQueryOptions<
            IItemResponse[],
            Error,
            TData,
            ReturnType<typeof samplesV2QueryKeys.itemsList>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: samplesV2QueryKeys.itemsList(limit, offset),
        queryFn: () => getItemsWithLimit(limit, offset),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    })
}

export const useItemsWithErrorQuery = <TData = IItemResponse[]>(
    errorType: '400' | '500',
    limit?: number,
    offset?: number,
    options?: Omit<
        UseQueryOptions<
            IItemResponse[],
            Error,
            TData,
            ReturnType<typeof samplesV2QueryKeys.itemsListWithError>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: samplesV2QueryKeys.itemsListWithError(
            errorType,
            limit,
            offset
        ),
        queryFn: () => getItemsWithError(errorType, limit, offset),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        ...options,
    })
}

export const useItemDetailQuery = <TData = IItemResponse | null>(
    id: number,
    options?: Omit<
        UseQueryOptions<
            IItemResponse | null,
            Error,
            TData,
            ReturnType<typeof samplesV2QueryKeys.itemDetail>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: samplesV2QueryKeys.itemDetail(id),
        queryFn: () => getItem(id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    })
}

export const useItemDetailWithErrorQuery = <TData = IItemResponse | null>(
    id: number,
    errorType: '400' | '404' | '422' | '500',
    options?: Omit<
        UseQueryOptions<
            IItemResponse | null,
            Error,
            TData,
            ReturnType<typeof samplesV2QueryKeys.itemDetailWithError>
        >,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: samplesV2QueryKeys.itemDetailWithError(id, errorType),
        queryFn: () => getItemWithError(id, errorType),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        ...options,
    })
}

// Create Item用のMutation Hook
export const useCreateItemMutation = <
    TForm extends FieldValues = ICreateItemForm,
>(
    form: UseFormReturn<TForm>,
    options?: Omit<UseApiMutationFormOptions<IItemResponse, TForm>, 'action'>
) => {
    return useApiMutation(form, {
        action: async (data: TForm) => {
            return (await createItem(data as unknown as ICreateItemForm)) as any
        },
        ...options,
    })
}

// Update Item用のMutation Hook
export const useUpdateItemMutation = <
    TForm extends FieldValues = IUpdateItemForm & { id: number },
>(
    form: UseFormReturn<TForm>,
    options?: Omit<UseApiMutationFormOptions<IItemResponse, TForm>, 'action'>
) => {
    return useApiMutation(form, {
        action: async (data: TForm) => {
            const updateData = data as unknown as IUpdateItemForm & {
                id: number
            }
            return (await updateItem({ ...updateData } as IUpdateItem)) as any
        },
        ...options,
    })
}
