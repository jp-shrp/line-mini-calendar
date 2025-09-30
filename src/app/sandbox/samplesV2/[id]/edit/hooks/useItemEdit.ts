import {
    useItemDetailQuery,
    useItemDetailWithErrorQuery,
} from '@/app/sandbox/samplesV2/api/samples-query'
import { useCallback } from 'react'

export const useItemEdit = (id: number) => {
    const {
        data: item,
        isLoading,
        error: fetchError,
        refetch,
    } = useItemDetailQuery(id)

    const handleRetry = useCallback(async () => {
        return refetch()
    }, [refetch])

    return {
        data: item,
        isLoading,
        error: fetchError,
        handleRetry,
        refetch,
    }
}

export const useItemEditWithError = (
    id: number,
    errorType: '400' | '422' | '500'
) => {
    const {
        data: item,
        isLoading,
        error: fetchError,
        refetch,
    } = useItemDetailWithErrorQuery(id, errorType)

    const handleRetry = useCallback(async () => {
        return refetch()
    }, [refetch])

    return {
        data: item,
        isLoading,
        error: fetchError,
        handleRetry,
        refetch,
    }
}
