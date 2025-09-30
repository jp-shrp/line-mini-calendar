'use client'

import { useItems } from '../hooks/useItems'
import { ItemCard } from './ItemCard'

export const ItemList = () => {
    const { items, isLoading, error } = useItems()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">読み込み中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-lg text-red-600">
                    エラーが発生しました: {error.message}
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">
                    商品が見つかりませんでした
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}
