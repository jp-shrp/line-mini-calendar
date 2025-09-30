'use client'

import { IItemResponse, Item } from '@/models/samples/Item'
import Link from 'next/link'

interface ItemDetailCardProps {
    itemData: IItemResponse
}

export const ItemDetailCard = ({ itemData }: ItemDetailCardProps) => {
    const item = new Item(itemData)
    const detail = item.detail.get()
    return (
        <div className="mx-auto max-w-2xl lg:max-w-7xl">
            <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
                <Link
                    href="/sandbox/samples/items"
                    className="hover:text-gray-700">
                    商品一覧
                </Link>
                <span>/</span>
                <span className="text-gray-900">{item.name}</span>
            </nav>

            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                    {item.imagePath ? (
                        <img
                            src={item.imagePath}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="mb-4 text-6xl">📦</div>
                                <div>No Image</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {item.name}
                    </h1>

                    <div className="mt-3">
                        <p className="text-3xl tracking-tight text-gray-900">
                            ¥{item.price.toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center space-x-4">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                    item.isAvailable
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                {item.isAvailable ? '在庫あり' : '在庫なし'}
                            </span>
                            <span className="text-sm text-gray-500">
                                在庫数: {item.stock}個
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900">
                            カテゴリ
                        </h3>
                        <div className="mt-2">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                                {item.category}
                            </span>
                        </div>
                    </div>

                    {item.description && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">
                                商品説明
                            </h3>
                            <div className="prose prose-sm mt-2 text-gray-500">
                                <p>{item.description}</p>
                            </div>
                        </div>
                    )}

                    {detail && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">
                                詳細仕様
                            </h3>
                            <div className="mt-2 space-y-4">
                                {detail.specification && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-600">
                                            仕様
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {detail.specification}
                                        </dd>
                                    </div>
                                )}

                                {detail.dimensions && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-600">
                                            サイズ
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {detail.dimensions}
                                        </dd>
                                    </div>
                                )}

                                {detail.weight > 0 && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-600">
                                            重量
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {detail.weight}g
                                        </dd>
                                    </div>
                                )}

                                {detail.warranty && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-600">
                                            保証
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {detail.warranty}
                                        </dd>
                                    </div>
                                )}

                                {detail.features &&
                                    detail.features.length > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-600">
                                                機能・特徴
                                            </dt>
                                            <dd className="mt-1">
                                                <ul className="list-disc space-y-1 pl-5">
                                                    {detail.features.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className="text-sm text-gray-900">
                                                                {feature}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </dd>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex">
                        <button
                            type="button"
                            className={`flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-none sm:w-full ${
                                item.isAvailable && item.stock > 0
                                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                    : 'cursor-not-allowed bg-gray-400'
                            }`}
                            disabled={!item.isAvailable || item.stock === 0}>
                            {item.isAvailable && item.stock > 0
                                ? 'カートに追加'
                                : '在庫切れ'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/sandbox/samples/items"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            ← 商品一覧に戻る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
