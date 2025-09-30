'use client'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getSearchFields } from '@/actions/productAction'

type searchField = { id: number; name: string }

type SearchFieldsResponse = {
    sub_categories: searchField[]
    lock_system_types: searchField[]
    '30min': searchField[]
    '1hour': searchField[]
    '2hour': searchField[]
    fire_proofs: searchField[]
    rapid_heat_shocks: searchField[]
    melt_proofs: searchField[]
    tool_proofs: searchField[]
    water_proofs: searchField[]
    alarm: searchField[]
    standards: searchField[]
}

export const useSearchFields = <TData = SearchFieldsResponse>(
    options?: Omit<
        UseQueryOptions<SearchFieldsResponse, Error, TData, [string]>,
        'queryKey' | 'queryFn'
    >
) => {
    return useQuery({
        queryKey: [queryKeys.searchField],
        queryFn: () => getSearchFields(),
        retry: false,
        refetchOnWindowFocus: false,
        ...options,
    })
}
