'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
    getFavoriteItems,
    changeFavorite,
    FavoriteFormData,
} from '@/actions/favoriteAction'
import { useLoading } from '@/contexts/LoadingContext'
import { useForm } from 'react-hook-form'
import { Product, IProductResponse } from '@/models/Product'

export default function Favorites() {
    const { setLoading } = useLoading()
    const [favorites, setFavorites] = useState<Product[]>([])
    const form = useForm<FavoriteFormData>({
        defaultValues: {
            product_id: 0,
        },
    })

    const fetch = async () => {
        await getFavoriteItems({
            setGlobalLoading: setLoading,
            onSuccess: (data) => {
                setFavorites(
                    data.data.map((x: IProductResponse) => new Product(x))
                )
            },
            onError: (error) => {
                console.error('取得エラー:', error)
            },
        })
    }

    useEffect(() => {
        fetch()
    }, [])

    const deleteFavorite = async (id: number) => {
        form.setValue('product_id', id)
        await changeFavorite(form, {
            setLoading: setLoading,
            onSuccess: (data) => {
                if (!data.isAdd) {
                    alert('お気に入りを解除しました。')
                }
                fetch()
            },
            onError: (error) => {
                console.error('更新エラー:', error)
            },
        })
    }

    return (
        <div>
            <h1 className="mb-12 text-3xl">お気に入り一覧</h1>
            <div className="space-y-6">
                {favorites.map((item) => (
                    <div key={item.id} className="flex border-b pb-6">
                        <div className="h-auto max-h-[182px] w-full max-w-[182px]">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.imagePath}`}
                                alt={item.name}
                                className="h-full w-full object-contain"
                                width={182}
                                height={182}
                            />
                        </div>

                        <div className="ml-4 flex-1">
                            <p className="text-xs text-gray-500">
                                {item.lockSystemTypeName}
                            </p>
                            <p className="mt-4 mb-5 text-2xl font-bold">
                                {item.name}
                            </p>
                            <p className="text-sm">
                                {item.storeListDescription}
                            </p>
                        </div>

                        <div className="flex flex-col items-end">
                            <p className="text-base font-bold">
                                ¥{item.sellingPrice}
                            </p>
                            <button
                                className="mt-14 hover:cursor-pointer"
                                onClick={() => deleteFavorite(item.id)}>
                                <Image
                                    src="/images/icon/trash.svg"
                                    alt="trash"
                                    width={28}
                                    height={28}
                                />
                            </button>
                        </div>
                    </div>
                ))}

                {!favorites.length && (
                    <div className="">
                        <Image
                            src="/images/my-page/heart.svg"
                            alt="not-favorites"
                            className="m-auto object-contain"
                            width={216}
                            height={216}
                        />
                        <p className="text-center text-xl text-zinc-400">
                            お気に入りした商品はありません
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
