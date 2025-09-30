import { getItem } from '@/actions/ItemAction'
import { ItemDetailCard } from './components/ItemDetailCard'

interface ItemDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
    const { id } = await params
    const itemId = parseInt(id, 10)
    const result = await getItem(itemId)

    return (
        <div className="container mx-auto px-4 py-8">
            <ItemDetailCard itemData={result!} />
        </div>
    )
}
