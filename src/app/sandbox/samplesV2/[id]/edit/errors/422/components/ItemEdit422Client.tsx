'use client'

import { ItemForm422 } from '@/app/sandbox/samplesV2/[id]/edit/errors/422/components/ItemForm422'
import { useItemEdit } from '@/app/sandbox/samplesV2/[id]/edit/hooks/useItemEdit'
import { QueryStateHandler } from '@/components/QueryStateHandler'

interface ItemEdit422ClientProps {
    id: string
}

export const ItemEdit422Client = ({ id }: ItemEdit422ClientProps) => {
    const itemId = parseInt(id, 10)
    const { data: item, isLoading, error } = useItemEdit(itemId)

    return (
        <QueryStateHandler
            data={item}
            isLoading={isLoading}
            error={error}
            suppressErrorThrow={false}
            useGlobalLoading={false}
            loadingMessage="編集データを読み込み中...">
            {(data) => (
                <div className="space-y-8">
                    <div className="rounded-lg bg-orange-50 p-4">
                        <h2 className="text-lg font-semibold text-orange-800">
                            バリデーションエラーテスト（422）
                        </h2>
                        <p className="mt-1 text-sm text-orange-600">
                            フォームを送信すると、サーバーバリデーションエラー（422
                            Unprocessable Entity）が発生し、
                            フォームの各フィールドにエラーメッセージが表示されます
                        </p>
                        <div className="mt-4 rounded bg-orange-100 p-3">
                            <h4 className="font-medium text-orange-800">
                                このページで確認できること:
                            </h4>
                            <ul className="mt-2 list-disc pl-5 text-sm text-orange-700">
                                <li>
                                    フォーム送信時のサーバーバリデーションエラー
                                </li>
                                <li>
                                    422エラー時のフィールド別エラーメッセージ表示
                                </li>
                                <li>バリデーションエラーのユーザー体験</li>
                            </ul>
                        </div>
                    </div>

                    {data && <ItemForm422 initialData={data} />}
                </div>
            )}
        </QueryStateHandler>
    )
}
