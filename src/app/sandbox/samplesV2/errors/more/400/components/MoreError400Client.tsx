'use client'

import { ItemCard } from '@/app/sandbox/samplesV2/components/ItemCard'
import { IItemResponse } from '@/models/samples/Item'
import { useMoreError400 } from '@/app/sandbox/samplesV2/errors/more/400/hooks/useMoreError400'

const MainView = ({
    items,
    isLoadingMore,
    loadMoreError,
    showLoadMore,
    showError,
    handleLoadMore,
}: ReturnType<typeof useMoreError400>) => {
    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-yellow-50 p-4">
                <h2 className="text-lg font-semibold text-yellow-800">
                    「もっと見る」400エラーテスト
                </h2>
                <p className="mt-1 text-sm text-yellow-600">
                    初期データ5件は正常にSSRで取得済み。「もっと見る」ボタン押下時にCSRで400エラーが発生します
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
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {showError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <span className="text-red-600">⚠️</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800">
                                追加データ読み込みエラー（400 Bad Request）
                            </h3>
                            <p className="mt-2 text-red-600">
                                「もっと見る」ボタンでの追加データ取得時に400エラーが発生しました。
                            </p>
                            {loadMoreError && (
                                <p className="mt-2 text-sm text-red-500">
                                    エラー詳細: {loadMoreError.message}
                                </p>
                            )}
                            <div className="mt-4 rounded bg-red-100 p-3">
                                <h4 className="font-medium text-red-800">
                                    このページで確認できること:
                                </h4>
                                <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
                                    <li>CSRでのAPIエラーハンドリング</li>
                                    <li>
                                        部分的な成功状態での追加データエラー
                                    </li>
                                    <li>ユーザーアクション起因のエラー体験</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLoadMore && (
                <div className="flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoadingMore && '読み込み中...'}
                        {!isLoadingMore &&
                            'もっと見る（400エラーが発生します）'}
                    </button>
                </div>
            )}
        </div>
    )
}

interface MoreError400ClientProps {
    initialItems: IItemResponse[]
}

export const MoreError400Client = ({
    initialItems,
}: MoreError400ClientProps) => {
    const hookData = useMoreError400(initialItems)
    return <MainView {...hookData} />
}
