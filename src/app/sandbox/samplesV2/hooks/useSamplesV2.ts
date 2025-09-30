import { IItemResponse } from '@/models/samples/Item'
import { useState } from 'react'
import { useItemsWithLimitQuery } from '@/app/sandbox/samplesV2/api/samples-query'

export const useSamplesV2 = (initialItems: IItemResponse[]) => {
    const [items, setItems] = useState<IItemResponse[]>(initialItems)
    const [offset, setOffset] = useState(5)
    const [showLoadMore, setShowLoadMore] = useState(true)

    const {
        data: _moreItems,
        isLoading: isLoadingMore,
        error: loadMoreError,
        refetch: loadMore,
    } = useItemsWithLimitQuery(5, offset, {
        enabled: false,
    })

    const handleLoadMore = async () => {
        try {
            const result = await loadMore()
            if (result.data && result.data.length > 0) {
                setItems((prev) => [...prev, ...result.data])
                setOffset((prev) => prev + 5)

                if (result.data.length < 5) {
                    setShowLoadMore(false)
                }
            } else {
                setShowLoadMore(false)
            }
        } catch (_error) {
            // エラーハンドリングはloadMoreErrorで処理済み
        }
    }

    return {
        items,
        isLoadingMore,
        loadMoreError,
        showLoadMore,
        handleLoadMore,
    }
}
