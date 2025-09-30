'use client'

import { QueryStateHandler } from '@/components/QueryStateHandler'
import { useItemEditWithError } from '@/app/sandbox/samplesV2/[id]/edit/hooks/useItemEdit'

interface ItemEdit500ClientProps {
    id: string
}

export const ItemEdit500Client = ({ id }: ItemEdit500ClientProps) => {
    const itemId = parseInt(id, 10)
    const { data: item, isLoading, error } = useItemEditWithError(itemId, '500')

    return (
        <QueryStateHandler
            data={item}
            isLoading={isLoading}
            error={error}
            suppressErrorThrow={true}
            useGlobalLoading={false}
            loadingMessage="編集データを読み込み中..."
            errorComponent={
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <span className="text-red-600">💥</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800">
                                500 Internal Server Error
                            </h3>
                            <p className="mt-2 text-red-600">
                                編集フォーム表示用のデータ取得時に500エラーが発生しました。
                            </p>
                            <p className="mt-2 text-sm text-red-500">
                                エラー詳細:{' '}
                                {error?.message ||
                                    '予期しないサーバーエラーが発生しました'}
                            </p>
                            <div className="mt-4 rounded bg-red-100 p-3">
                                <h4 className="font-medium text-red-800">
                                    このページで確認できること:
                                </h4>
                                <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
                                    <li>
                                        CSRでの編集データ取得500エラーハンドリング
                                    </li>
                                    <li>
                                        QueryStateHandlerを使用したサーバーエラー表示
                                    </li>
                                    <li>
                                        クライアントサイドでのサーバーエラー体験
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }>
            {(data) => (
                <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <span className="text-green-600">✅</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-green-800">
                                データ取得成功
                            </h3>
                            <p className="mt-2 text-green-600">
                                編集データが正常に取得されました（通常はここにフォームが表示されます）
                            </p>
                            {data && (
                                <div className="mt-4 rounded bg-green-100 p-3">
                                    <p className="text-sm text-green-700">
                                        アイテム名: {data.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </QueryStateHandler>
    )
}
