import { getItems } from '@/actions/ItemAction'
import { ItemCard } from './components/ItemCard'
import { ItemClient } from './components/ItemClient'

export default async function ItemsPage() {
    const items = await getItems()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">商品一覧</h1>
                <p className="mt-2 text-gray-600">
                    サンプル商品の一覧を表示しています
                </p>
            </div>

            <ItemClient />

            {!items || items.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-lg text-gray-600">
                        商品が見つかりませんでした
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
