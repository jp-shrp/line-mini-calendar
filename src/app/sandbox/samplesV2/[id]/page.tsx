import { getItem } from '@/actions/ItemAction'
import { ItemDetailCard } from './components/ItemDetailCard'
import { notFound } from 'next/navigation'

export default async function ItemDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
        notFound()
    }

    const item = await getItem(id)

    if (!item) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 rounded-lg bg-green-50 p-4">
                <h2 className="text-lg font-semibold text-green-800">
                    商品詳細（正常系・SSR）
                </h2>
                <p className="mt-1 text-sm text-green-600">
                    商品詳細データをサーバーサイドレンダリングで取得して表示
                </p>
            </div>

            <ItemDetailCard itemData={item} />
        </div>
    )
}
