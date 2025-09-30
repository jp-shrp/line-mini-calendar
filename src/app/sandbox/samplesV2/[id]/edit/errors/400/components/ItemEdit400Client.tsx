'use client'

import { useItemEditWithError } from '@/app/sandbox/samplesV2/[id]/edit/hooks/useItemEdit'
import { QueryStateHandler } from '@/components/QueryStateHandler'

interface ItemEdit400ClientProps {
    id: string
}

export const ItemEdit400Client = ({ id }: ItemEdit400ClientProps) => {
    const itemId = parseInt(id, 10)
    const { data: item, isLoading, error } = useItemEditWithError(itemId, '400')

    return (
        <QueryStateHandler
            data={item}
            isLoading={isLoading}
            error={error}
            suppressErrorThrow={false}
            useGlobalLoading={false}
            loadingMessage="編集データを読み込み中...">
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
