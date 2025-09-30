'use client'

import { FC } from 'react'
import { useItemEdit } from '@/app/sandbox/samplesV2/[id]/edit/hooks/useItemEdit'
import { ItemForm } from '@/app/sandbox/samplesV2/[id]/edit/components/ItemForm'
import { QueryStateHandler } from '@/components/QueryStateHandler'
import { IItemResponse } from '@/models/samples/Item'

const MainView: FC<ReturnType<typeof useItemEdit>> = ({
    data: item,
    isLoading,
    error,
}) => {
    return (
        <QueryStateHandler
            data={item || undefined}
            isLoading={isLoading}
            error={error}
            suppressErrorThrow={true}
            useGlobalLoading={false}
            notFoundMessage="アイテムが見つかりませんでした"
            errorComponent={
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                                <span className="text-red-600">⚠️</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-semibold text-red-800">
                                データ取得エラー
                            </h3>
                            <p className="mt-2 text-red-600">
                                編集対象のアイテムデータの取得に失敗しました。
                            </p>
                            <p className="mt-2 text-sm text-red-500">
                                エラー詳細:{' '}
                                {error?.message || '予期しないエラー'}
                            </p>
                            <div className="mt-4 rounded bg-red-100 p-3">
                                <h4 className="font-medium text-red-800">
                                    このページで確認できること:
                                </h4>
                                <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
                                    <li>CSRでのデータ取得エラーハンドリング</li>
                                    <li>編集フォーム表示前のエラー状態</li>
                                    <li>エラー時のユーザー体験</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }>
            {(item: IItemResponse | undefined) => (
                <ItemForm mode="edit" initialData={item} />
            )}
        </QueryStateHandler>
    )
}

interface ItemEditClientProps {
    id: number
}

export const ItemEditClient = ({ id }: ItemEditClientProps) => {
    const hookItems = useItemEdit(id)
    return <MainView {...hookItems} />
}
