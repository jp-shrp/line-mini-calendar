'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSearchProducts } from '@/actions/productAction'
import { useLoading } from '@/contexts/LoadingContext'
import AppContainerHeader from '@/components/AppContainerHeader'
import SearchMenu from '@/components/SearchMenu'
import AppContainer from '@/components/AppContainer'
import { ProductCardData } from '@/models/Product'
import ProductCard from '@/components/ProductCard'
import Image from 'next/image'
import ScrollButtons from '@/components/ScrollButtons'
import useHorizontalScroll from '@/hooks/useHorizontalScroll'
import BaseButton from '@/components/BaseButton'

export default function ProductListPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { setLoading } = useLoading()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [lastPage, setLastPage] = useState<number>(1)
    const [showModal, setShowModal] = useState(false)
    const [productsData, setProductsData] = useState<ProductCardData[]>([])
    const [productCount, setProductCount] = useState(0)

    const newProductsData: ProductCardData[] = [
        {
            imageSrc: '/images/test/top/sample-img.png',
            imageAlt: 'サンプル',
            lead: '貴重品向け',
            title: 'LK-312PSE',
            description:
                'ロックシステム:ダイヤルロック ｜ 外寸:W417×D320×H715(mm) ｜ 内寸:W160×D220×H87(mm) ｜ 列数/段数/人数:2列/6段/12人 ｜ 質量:26.4kg',
            price: '57,860',
            linkUrl: '/product/123',
        },
        {
            imageSrc: '/images/test/top/sample-img.png',
            imageAlt: 'サンプル',
            lead: '貴重品向け',
            title: 'LK-312PSE',
            description:
                'ロックシステム:ダイヤルロック ｜ 外寸:W417×D320×H715(mm) ｜ 内寸:W160×D220×H87(mm) ｜ 列数/段数/人数:2列/6段/12人 ｜ 質量:26.4kg',
            price: '57,860',
            linkUrl: '/product/123',
        },
        {
            imageSrc: '/images/test/top/sample-img.png',
            imageAlt: 'サンプル',
            lead: '貴重品向け',
            title: 'LK-312PSE',
            description:
                'ロックシステム:ダイヤルロック ｜ 外寸:W417×D320×H715(mm) ｜ 内寸:W160×D220×H87(mm) ｜ 列数/段数/人数:2列/6段/12人 ｜ 質量:26.4kg',
            price: '57,860',
            linkUrl: '/product/123',
        },
        {
            imageSrc: '/images/test/top/sample-img.png',
            imageAlt: 'サンプル',
            lead: '貴重品向け',
            title: 'LK-312PSE',
            description:
                'ロックシステム:ダイヤルロック ｜ 外寸:W417×D320×H715(mm) ｜ 内寸:W160×D220×H87(mm) ｜ 列数/段数/人数:2列/6段/12人 ｜ 質量:26.4kg',
            price: '57,860',
            linkUrl: '/product/123',
        },
        {
            imageSrc: '/images/test/top/sample-img.png',
            imageAlt: 'サンプル',
            lead: '貴重品向け',
            title: 'LK-312PSE',
            description:
                'ロックシステム:ダイヤルロック ｜ 外寸:W417×D320×H715(mm) ｜ 内寸:W160×D220×H87(mm) ｜ 列数/段数/人数:2列/6段/12人 ｜ 質量:26.4kg',
            price: '57,860',
            linkUrl: '/product/123',
        },
    ]

    const parseSearchParams = (searchParams: URLSearchParams) => {
        return {
            word: searchParams.get('word') || '',
            page: searchParams.get('page') || '1',
            per_page: searchParams.get('per_page') || '15',
        }
    }
    const query = parseSearchParams(searchParams)

    useEffect(() => {
        const params = new URLSearchParams(query)
        const fetch = async () => {
            await getSearchProducts(params, {
                setLoading: setLoading,
                onSuccess: (data) => {
                    setCurrentPage(data.current_page)
                    setLastPage(data.last_page)
                    setProductCount(data.total)

                    const mapped = data.data.map(
                        (item: any): ProductCardData => ({
                            imageSrc: item.image_path
                                ? `${process.env.NEXT_PUBLIC_API_URL}${item.image_path}`
                                : '/images/test/top/sample-img.png',
                            imageAlt: item.imageAlt,
                            lead: item.lock_system_type_name,
                            title: item.name,
                            performanceIcons: item.performances,
                            description: item.store_list_description,
                            price: item.selling_price?.toLocaleString(),
                            isShippingIncluded: item.is_shipping_included === 1,
                            linkUrl: `/product/detail/${item.id}`,
                        })
                    )

                    setProductsData(mapped)
                },
                onError: (error) => {
                    console.error('送信エラー:', error)
                    alert(error)
                },
            })
        }
        fetch()
    }, [JSON.stringify(query)])

    const goToPage = (pageNumber: number) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set('page', String(pageNumber))
        router.push(`/product/list?${newParams}`)
    }

    const getPageRange = () => {
        const range: number[] = []
        const maxPages = 5
        let start = Math.max(1, currentPage - Math.floor(maxPages / 2))
        let end = start + maxPages - 1

        if (end > lastPage) {
            end = lastPage
            start = Math.max(1, end - maxPages + 1)
        }

        for (let i = start; i <= end; i++) {
            range.push(i)
        }
        return range
    }

    const handleClose = () => setShowModal(false)

    const newProductsScroll = useHorizontalScroll()

    return (
        <AppContainer>
            <AppContainerHeader title="Products" subtitle="商品" isPxNone />
            <div className="flex flex-col gap-12 md:mb-8 md:flex-row md:gap-6">
                {/*モバイル表示*/}
                <div className="md:hidden">
                    <BaseButton
                        onClick={() => setShowModal(true)}
                        label="絞り込み"
                        variant="outline"
                    />

                    {/*モーダル*/}
                    {showModal && (
                        <div className="jutify-center bg-opacity-50 fixed inset-0 z-50 flex items-center bg-black">
                            <div className="max-h-[100vh] w-full max-w-md overflow-auto bg-white p-4">
                                <div className="mt-2 text-end">
                                    <BaseButton
                                        onClick={handleClose}
                                        iconSrc="/images/icon/close.svg"
                                        variant="icon"
                                        className="justify-end"
                                    />
                                </div>
                                <SearchMenu onClose={handleClose} />
                            </div>
                        </div>
                    )}
                </div>

                {/*PC表示*/}
                <div className="mt-16 hidden md:block">
                    <SearchMenu />
                </div>

                <div>
                    <div className="mb-6 flex items-center justify-between md:px-0">
                        <div className="text-sm">
                            {productCount}個の商品が見つかりました
                        </div>
                        <div>
                            <select className="h-[40px] w-[125px] rounded border border-gray-300">
                                <option value="price">価格順</option>
                                <option value="name">商品名順</option>
                            </select>
                        </div>
                    </div>
                    {productCount > 0 && (
                        <div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {productsData.map(
                                    (card: ProductCardData, idx: number) => (
                                        <div
                                            key={idx}
                                            className="md: rounded-0 h-full w-full rounded-[20px] bg-white md:max-w-[472px] md:bg-transparent">
                                            <ProductCard
                                                data={card}
                                                className="h-full w-full"
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="mt-12 flex justify-center gap-6 px-3 md:gap-9 md:px-0">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}>
                                    <Image
                                        src="/images/icon/arrow-back.svg"
                                        alt="前へ"
                                        width="16"
                                        height="16"
                                    />
                                </button>

                                {getPageRange().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`h-[36px] w-[36px] text-sm md:text-base ${pageNum === currentPage ? 'font-bold' : 'normal'} ${pageNum === currentPage ? 'bg-zinc-300' : ''} ${pageNum === currentPage ? 'text-zinc-600' : 'text-zinc-400'} `}>
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}>
                                    <Image
                                        src="/images/icon/arrow-forward.svg"
                                        alt="次へ"
                                        width="16"
                                        height="16"
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                    {!productCount && (
                        <div>
                            <div className="text-center md:rounded-2xl md:bg-white md:px-6 md:py-10">
                                <Image
                                    src="/images/icon/exclamation-circle.svg"
                                    alt=""
                                    width="216"
                                    height="216"
                                    className="mx-auto mb-7 block"
                                />
                                <p className="mb-2 text-zinc-400">
                                    申し訳ございませんが結果が見つかりませんでした。
                                </p>
                                <p className="text-zinc-400 md:mb-12">
                                    より良い検索結果を得るために、スペルミスやタイプミスをチェックするか、または一般的なキーワードを使用してください。
                                </p>
                                <BaseButton
                                    to="/custom-search"
                                    label="カスタム検索に戻る"
                                    variant="primary"
                                    className="mx-auto hidden w-[294px] py-3 md:block"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {!productCount && (
                <div className="mt-6 mb-16 md:mt-0 md:mb-24">
                    <div className="mb-6 flex items-center justify-between md:mb-0">
                        <AppContainerHeader
                            title="Recommendation"
                            subtitle="おすすめ"
                            showBreadcrumb={false}
                            isPxNone
                        />
                        <ScrollButtons
                            onLeft={newProductsScroll.scrollLeft}
                            onRight={newProductsScroll.scrollRight}
                        />
                    </div>
                    <div
                        ref={newProductsScroll.scrollRef}
                        className="hidden-scrollbar relative w-full snap-x snap-mandatory overflow-x-auto">
                        <div className="flex scroll-smooth">
                            <div className="container mx-auto flex">
                                {newProductsData.map(
                                    (card: ProductCardData, idx: number) => (
                                        <ProductCard key={idx} data={card} />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppContainer>
    )
}
