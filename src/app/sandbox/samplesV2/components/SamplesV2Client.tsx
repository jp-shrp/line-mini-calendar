'use client'

import { IItemResponse } from '@/models/samples/Item'
import { useSamplesV2 } from '@/app/sandbox/samplesV2/hooks/useSamplesV2'
import { ItemCard } from '@/app/sandbox/samplesV2/components/ItemCard'

const MainView = ({
    items,
    isLoadingMore,
    loadMoreError,
    showLoadMore,
    handleLoadMore,
}: ReturnType<typeof useSamplesV2>) => {
    if (loadMoreError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="text-lg font-semibold text-red-800">
                    データ追加読み込みエラー
                </h3>
                <p className="mt-2 text-red-600">
                    {loadMoreError.message || '追加データの取得に失敗しました'}
                </p>
                <button
                    onClick={handleLoadMore}
                    className="mt-3 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                    再試行
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4">
                <h2 className="text-lg font-semibold text-green-800">
                    アイテム一覧（正常系）
                </h2>
                <p className="mt-1 text-sm text-green-600">
                    初期データ5件をSSRで取得済み。「もっと見る」ボタンでCSRによる追加読み込み
                </p>
            </div>

            {items.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">
                        アイテムが見つかりませんでした
                    </div>
                </div>
            )}

            {items.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item, i) => (
                        <ItemCard key={`${item.id}-${i}`} item={item} />
                    ))}
                </div>
            )}

            {showLoadMore && (
                <div className="flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoadingMore && '読み込み中...'}
                        {!isLoadingMore && 'もっと見る'}
                    </button>
                </div>
            )}
        </div>
    )
}

interface SamplesV2ClientProps {
    initialItems: IItemResponse[]
}

export const SamplesV2Client = ({ initialItems }: SamplesV2ClientProps) => {
    const hookData = useSamplesV2(initialItems)
    return <MainView {...hookData} />
}
