import { IItemResponse, Item } from '@/models/samples/Item'
import Link from 'next/link'

interface ItemCardProps {
    item: IItemResponse
}

export const ItemCard = ({ item }: ItemCardProps) => {
    const itemModel = new Item(item)
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <Link href={`/sandbox/samples/items/${itemModel.id}`}>
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200">
                    {itemModel.imagePath ? (
                        <img
                            src={itemModel.imagePath}
                            alt={itemModel.name}
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <div className="mt-4 space-y-2">
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                        {itemModel.name}
                    </h3>
                    {itemModel.description && (
                        <p className="line-clamp-2 text-sm text-gray-500">
                            {itemModel.description}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900">
                            ¥{itemModel.price.toLocaleString()}
                        </p>
                        <span className="text-sm text-gray-500">
                            {itemModel.category}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span
                            className={`rounded-full px-2 py-1 text-xs ${
                                itemModel.isAvailable
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                            {itemModel.isAvailable ? '在庫あり' : '在庫なし'}
                        </span>
                        <span className="text-gray-500">
                            在庫: {itemModel.stock}個
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    )
}
