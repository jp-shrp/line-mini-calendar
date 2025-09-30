'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ProductCardData } from '@/models/Product'
import ScrollButtons from '@/components/ScrollButtons'
import useHorizontalScroll from '@/hooks/useHorizontalScroll'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppButton from '@/components/AppButton'
import NewsCard from '@/components/NewsCard'
import { NewsData } from '@/models/News'
import FullWidth from '@/components/FullWidth'
import ScrollCardContents from '@/components/ScrollCardContents'

interface TabButtonProps {
    children: React.ReactNode
    variant: 'blue' | 'border'
    onClick?: () => void
    className?: string
}

const TabButton: React.FC<TabButtonProps> = ({
    children,
    variant,
    onClick,
    className,
}) => {
    return (
        <div onClick={onClick} className="w-full md:w-fit">
            <AppButton variant={variant} className={className}>
                {children}
            </AppButton>
        </div>
    )
}

const imageMaskClass =
    'absolute inset-0 bg-gradient-to-t from-zinc-700/70 via-transparent to-transparent rounded-[16px] md:rounded-[20px]'
const centerCardListClass =
    'flex pl-[14px] 2xl:pl-0 justify-start 2xl:justify-center overflow-x-auto gap-5 md:gap-10 hidden-scrollbar'
const lockTypeListClass =
    'container mx-auto pl-4 sm:pl-6 grid grid-flow-col grid-rows-2 gap-x-5 gap-y-9 md:flex 2xl:gap-12 scroll-smooth'

export default function Home() {
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/application`).then(
            (res) => {
                console.log(res)
                res.json()
            }
        )
    }, [])

    const news: NewsData[] = [
        {
            date: '2025.06.04',
            content:
                'NHKドラマ『これは経費で落ちません！』7月26日(金)スタート！経理部の演出として顔認証式耐火金庫CSG-92FIDSが使用されます。',
            link: '#',
        },
        {
            date: '2025.06.04',
            content:
                'NHKドラマ『これは経費で落ちません！』7月26日(金)スタート！経理部の演出として顔認証式耐火金庫CSG-92FIDSが使用されます。',
            link: '#',
        },
        {
            date: '2025.06.04',
            content:
                'NHKドラマ『これは経費で落ちません！』7月26日(金)スタート！経理部の演出として顔認証式耐火金庫CSG-92FIDSが使用されます。',
            link: '#',
        },
    ]

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

    const newProductsScroll = useHorizontalScroll()

    const [selectedRankingTab, setSelectedRankingTab] = useState('office')

    const bestRankingTabs = [
        {
            label: 'オフィスセーフ',
            key: 'office',
        },
        {
            label: 'ファミリーセーフ',
            key: 'family',
        },
    ]

    const bestRankingDataMap: { [key: string]: ProductCardData[] } = {
        office: [
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
        ],
        family: [
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
            {
                imageSrc: '/images/test/top/sample-img2.png',
                imageAlt: 'サンプル',
                lead: 'マルチロック式小型耐火金庫',
                title: 'MC-40PRWH',
                description:
                    'ロックシステム:指紋認証ロック式、テンキー式 ｜ 耐火性能:RISE90分耐火性能 ｜ 外寸:W422×D450×H538(mm) ｜ 質量/内容量:53kg/41L',
                price: '97,350',
                linkUrl: '/product/123',
            },
        ],
    }

    const bestRankingScroll = useHorizontalScroll()

    const categoryData = [
        {
            imageSrc: '/images/test/top/sample-img3.png',
            imageAlt: 'サンプル3',
            title: 'データセーフ',
            description:
                '記憶メディア媒体を守る専用の耐火金庫。独自開発の二重構造で温度上昇をしっかりガード。',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img4.png',
            imageAlt: 'サンプル3',
            title: '投入式耐火金庫',
            description:
                'たとえば、従業員は引出しから入金。店長だけが扉から出勤。利用者の使用範囲を明確にする金庫。',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img5.png',
            imageAlt: 'サンプル3',
            title: '大型耐火金庫',
            description:
                '万一の火災から収納物を守る。収納スペースに応じたサイズが豊富にそろったオフィスの定番。',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img3.png',
            imageAlt: 'サンプル3',
            title: 'データセーフ',
            description:
                '記憶メディア媒体を守る専用の耐火金庫。独自開発の二重構造で温度上昇をしっかりガード。',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img4.png',
            imageAlt: 'サンプル3',
            title: '投入式耐火金庫',
            description:
                'たとえば、従業員は引出しから入金。店長だけが扉から出勤。利用者の使用範囲を明確にする金庫。',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img5.png',
            imageAlt: 'サンプル3',
            title: '大型耐火金庫',
            description:
                '万一の火災から収納物を守る。収納スペースに応じたサイズが豊富にそろったオフィスの定番。',
            linkUrl: '#',
        },
    ]

    const categoryScroll = useHorizontalScroll()

    const lockTypeData = [
        {
            imageSrc: '/images/test/top/sample-img6.png',
            imageAlt: 'サンプル6',
            title: 'ダイヤル式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img7.png',
            imageAlt: 'サンプル7',
            title: '100万変換ダイヤル式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img8.png',
            imageAlt: 'サンプル8',
            title: 'シリンダー式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img9.png',
            imageAlt: 'サンプル9',
            title: 'ダブルシリンダー式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img10.png',
            imageAlt: 'サンプル10',
            title: 'テンキー式（2登録）',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img6.png',
            imageAlt: 'サンプル6',
            title: 'ダイヤル式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img7.png',
            imageAlt: 'サンプル7',
            title: '100万変換ダイヤル式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img8.png',
            imageAlt: 'サンプル8',
            title: 'シリンダー式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img9.png',
            imageAlt: 'サンプル9',
            title: 'ダブルシリンダー式',
            linkUrl: '#',
        },
        {
            imageSrc: '/images/test/top/sample-img10.png',
            imageAlt: 'サンプル10',
            title: 'テンキー式（2登録）',
            linkUrl: '#',
        },
    ]

    const lockTypeScroll = useHorizontalScroll()

    const bannerData = [
        {
            imageSrc: '/images/top/banner01.png',
            imageAlt: 'エーコー金庫の性能',
            link: 'https://www.eiko.co.jp/safe/technology',
        },
        {
            imageSrc: '/images/top/banner02.png',
            imageAlt: '指紋登録・認証スライドのコツ',
            link: 'https://www.eiko.co.jp/safe/technology',
        },
        {
            imageSrc: '/images/top/banner03.png',
            imageAlt:
                '鍵を失くした！暗証番号を忘れた！故障して開かない！金庫のトラブルでお困りの方はこちら',
            link: '',
        },
        {
            imageSrc: '/images/top/banner04.png',
            imageAlt:
                '金庫の修理！日本全国対応出張修理エーコーメンテナンスショップ。修理ご希望の方はコチラ',
            link: '',
        },
    ]

    return (
        <div>
            <section>
                <FullWidth>
                    <img src="/images/test/top/mv-sample-pc.png" alt="" />
                </FullWidth>
            </section>
            <section className="mt-20 mb-14 md:mb-22">
                <AppContainerHeader
                    title="News"
                    subtitle="お知らせ"
                    showBreadcrumb={false}
                />
                <div className="flex flex-col gap-0 px-4 sm:px-6 md:flex-row md:gap-8">
                    {news.map((news, idx) => (
                        <NewsCard key={idx} {...news} />
                    ))}
                </div>
                <Link href="/news">
                    <AppButton
                        variant="border"
                        icon={<img src="/images/icon/arrow-right.svg" alt="" />}
                        className="mt-10 ml-auto w-fit">
                        お知らせ一覧
                    </AppButton>
                </Link>
            </section>
            <section className="mb-18 md:mb-31">
                <div className="mb-6 flex items-center justify-between md:mb-8">
                    <AppContainerHeader
                        title="New Products"
                        subtitle="新着商品"
                        showBreadcrumb={false}
                    />
                    <ScrollButtons
                        className="mt-22"
                        onLeft={newProductsScroll.scrollLeft}
                        onRight={newProductsScroll.scrollRight}
                    />
                </div>
                <FullWidth>
                    <div
                        ref={newProductsScroll.scrollRef}
                        className="hidden-scrollbar relative w-full snap-x snap-mandatory overflow-x-auto">
                        <div className="flex scroll-smooth">
                            <div className="container mx-auto flex pl-4 sm:pl-6">
                                {newProductsData.map(
                                    (card: ProductCardData, idx: number) => (
                                        <ProductCard key={idx} data={card} />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </FullWidth>
            </section>
            <section className="mb-14 md:mb-22">
                <div className="mb-8 md:mb-13">
                    <AppContainerHeader
                        title="Best Ranking"
                        subtitle="売れ筋ランキング"
                        showBreadcrumb={false}
                    />
                    <div className="-mt-1 mb-8 flex items-end justify-between px-4 sm:px-6 md:-mt-4 md:mb-13">
                        <div className="flex w-full gap-3 md:gap-6">
                            {bestRankingTabs.map(
                                (tab: { label: string; key: string }) => (
                                    <TabButton
                                        key={tab.key}
                                        variant="border"
                                        onClick={() =>
                                            setSelectedRankingTab(tab.key)
                                        }
                                        className={`w-full md:w-fit ${selectedRankingTab === tab.key ? 'opacity-100' : 'opacity-30'}`}>
                                        {tab.label}
                                    </TabButton>
                                )
                            )}
                        </div>
                        <ScrollButtons
                            onLeft={newProductsScroll.scrollLeft}
                            onRight={newProductsScroll.scrollRight}
                        />
                    </div>
                </div>
                <FullWidth>
                    <ScrollCardContents ref={bestRankingScroll.scrollRef}>
                        {bestRankingDataMap[selectedRankingTab].map(
                            (card: ProductCardData, idx: number) => (
                                <ProductCard key={idx} data={card} />
                            )
                        )}
                    </ScrollCardContents>
                </FullWidth>
            </section>
            <section className="mb-14 md:mb-22">
                <div className="mb-6 flex items-center justify-between md:mb-8">
                    <AppContainerHeader
                        title="Category"
                        subtitle="種類で選ぶ"
                        showBreadcrumb={false}
                    />
                    <ScrollButtons
                        className="mt-22"
                        onLeft={newProductsScroll.scrollLeft}
                        onRight={newProductsScroll.scrollRight}
                    />
                </div>
                <FullWidth>
                    <ScrollCardContents ref={categoryScroll.scrollRef}>
                        {categoryData.map((cat, idx) => (
                            <Link
                                key={idx}
                                href={cat.linkUrl}
                                className="mr-5 last:pr-[14px] 2xl:mr-10 2xl:last:mr-[200px]">
                                <div className="relative h-[300px] w-[320px] flex-shrink-0 md:h-[350px] md:w-[480px]">
                                    <Image
                                        src={cat.imageSrc}
                                        alt={cat.imageAlt || cat.title}
                                        fill
                                        className="rounded-[16px] object-cover md:rounded-[20px]"
                                    />
                                    <div className={imageMaskClass} />
                                    <div className="absolute bottom-0 left-0 flex w-full flex-col items-center p-6 text-center text-white md:p-4">
                                        <div className="text-bold mb-1.5 text-xl md:text-3xl">
                                            {cat.title}
                                        </div>
                                        <p className="text-xs md:text-sm">
                                            {cat.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </ScrollCardContents>
                </FullWidth>
            </section>
            <section className="mb-18 md:mb-28">
                <div className="mb-6 flex items-center justify-between md:mb-8">
                    <AppContainerHeader
                        title="Lock Type"
                        subtitle="ロックで選ぶ"
                        showBreadcrumb={false}
                    />
                    <ScrollButtons
                        className="mt-22"
                        onLeft={newProductsScroll.scrollLeft}
                        onRight={newProductsScroll.scrollRight}
                    />
                </div>
                <FullWidth>
                    <div
                        ref={lockTypeScroll.scrollRef}
                        className="hidden-scrollbar relative w-full snap-x snap-mandatory overflow-x-auto">
                        <div className={lockTypeListClass}>
                            {lockTypeData.map((lock, idx) => (
                                <Link
                                    key={idx}
                                    href={lock.linkUrl}
                                    className="last:pr-[14px] md:last:pr-10">
                                    <div className="flex w-[180px] flex-col items-center gap-5 md:w-[312px] md:gap-9">
                                        <Image
                                            src={lock.imageSrc}
                                            alt={lock.imageAlt || lock.title}
                                            width={312}
                                            height={248}
                                            className="rounded-[20px]"
                                        />
                                        <div className="text-bold text-base md:text-lg">
                                            {lock.title}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </FullWidth>
            </section>
            <FullWidth>
                <div className="mb-14 md:mb-22">
                    <div className="mb-10 text-center text-2xl">Instagram</div>
                    <div className={centerCardListClass}>
                        {[...Array(5)].map((_, idx) => (
                            <div
                                key={idx}
                                className="relative h-[287px] flex-shrink-0">
                                <Image
                                    src={`/sample-img11.png`}
                                    alt={`インスタ${idx + 1}`}
                                    height={287}
                                    width={272}
                                    className="h-[287px] w-auto rounded-[20px] object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </FullWidth>
            <FullWidth>
                <div className="bg-gray-200">
                    <div className={`${centerCardListClass} py-16 md:py-20`}>
                        {bannerData.map((banner, idx) => (
                            <Link
                                href={banner.link}
                                key={idx}
                                className="relative h-[142px] flex-shrink-0"
                                target="_blank">
                                <Image
                                    src={banner.imageSrc}
                                    alt={banner.imageAlt}
                                    height={142}
                                    width={99}
                                    className="h-[128px] w-auto rounded-[16px] object-cover md:h-[142px] md:rounded-[20px]"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </FullWidth>
        </div>
    )
}
