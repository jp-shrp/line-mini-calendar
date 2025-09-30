'use client'

import { QueryStateHandler } from '@/components/QueryStateHandler'
import { useItemDetailQuery } from '../../api/item-detail-query'
import { ItemForm } from './ItemForm'

interface ItemEditClientProps {
    id: string
}

export const ItemEditClient = ({ id }: ItemEditClientProps) => {
    const isNewItem = id === 'new'
    const itemId = isNewItem ? 0 : parseInt(id, 10)

    const { data: item, isLoading, error } = useItemDetailQuery(itemId)

    return (
        <QueryStateHandler
            data={item}
            isLoading={isLoading}
            error={error}
            isNewMode={isNewItem}
            useGlobalLoading={true}
            loadingMessage="読み込み中...."
            notFoundMessage="アイテムが見つかりません">
            {(data) => (
                <ItemForm
                    mode={isNewItem ? 'create' : 'edit'}
                    initialData={data}
                />
            )}
        </QueryStateHandler>
    )
}
