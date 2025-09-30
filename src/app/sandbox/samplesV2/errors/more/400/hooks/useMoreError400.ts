import { useOnLoading } from '@/contexts/OnLoadingContext'
import { IItemResponse } from '@/models/samples/Item'
import { useState } from 'react'
import { useItemsWithErrorQuery } from '@/app/sandbox/samplesV2/api/samples-query'

export const useMoreError400 = (initialItems: IItemResponse[]) => {
    const [items, _setItems] = useState<IItemResponse[]>(initialItems)
    const [showLoadMore, _setShowLoadMore] = useState(true)
    const [hasTriedLoadMore, setHasTriedLoadMore] = useState(false)
    const { onLoad } = useOnLoading()

    const {
        data: _moreItems,
        isLoading: isLoadingMore,
        error: loadMoreError,
        refetch: loadMore,
    } = useItemsWithErrorQuery('400', 5, 5, {
        enabled: false,
    })

    const handleLoadMore = async () => {
        setHasTriedLoadMore(true)
        await onLoad(async () => {
            const result = await loadMore()

            // React Queryのrefetchは例外をthrowしないため、手動でエラーチェック
            if (result.error) {
                throw result.error
            }

            return result
        })
    }

    return {
        items,
        isLoadingMore,
        loadMoreError,
        showLoadMore: showLoadMore && !hasTriedLoadMore,
        showError: hasTriedLoadMore && loadMoreError,
        handleLoadMore,
    }
}
