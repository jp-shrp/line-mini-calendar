'use client'
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import Accordion from '@/components/Accordion'
import QuantitySelector from '@/components/QuantitySelector'
import Link from 'next/link'
import AppButton from '@/components/AppButton'
import { isProductHeavy } from '@/lib/weight-limits'
import SelectField from '@/components/SelectField'
import { useForm } from 'react-hook-form'
import useImageSlider from '@/hooks/useImageSlider'
import { ProductCardData } from '@/models/Product'
import Breadcrumb from '@/components/Breadcrumb'
import RecommendCarousel from '@/components/RecommendCarousel'
import { changeFavorite, FavoriteFormData } from '@/actions/favoriteAction'
import { useLoading } from '@/contexts/LoadingContext'
import { useParams } from 'next/navigation'
import { userAtom } from '../../../../../model/User'
import { useAtom } from 'jotai'

const product = {
    id: '123',
    slide: [
        '/images/test/product/slide1.png',
        '/images/test/product/slide2.png',
        '/images/test/product/slide3.png',
        '/images/test/product/slide4.png',
        '/images/test/product/slide5.png',
        '/images/test/product/slide6.png',
    ],
    name: 'LK-312PSE',
    type: 'テンキー式',
    description: 'LED画面搭載のマルチロック式小型対価金庫',
    is_favorite: false,
    icons: [
        '/images/icon/about-icons/s_icon_f30.svg',
        '/images/icon/about-icons/s_icon_f60.svg',
        '/images/icon/about-icons/s_icon_f120.svg',
        '/images/icon/about-icons/s_icon_fdc1.svg',
    ],
    price: '57,860',
    info: [
        {
            title: '耐火性能',
            description: 'RISE90分耐火性能',
        },
        {
            title: 'ロックシステム',
            description: 'テンキー式',
        },
        {
            title: '外寸',
            description: 'W422×D450×H538(mm)',
        },
        {
            title: '内寸',
            description: 'W160×D220×H87(mm)',
        },
        {
            title: '質量',
            description: '53kg',
        },
        {
            title: '内容積',
            description: '41L',
        },
        {
            title: '付属品',
            description:
                'トレー1枚、警報装置1個、単4形乾電池3本（警報装置用）、USB電源供給ケース1個',
        },
    ],
    performance: [
        {
            image: '/images/test/product/sample0.png',
            title: '万一の火災から収納物を守る − 耐火性能',
            lead: '火災発生からの温度上昇を想定して試験炉内0〜1006℃で90分間の加熱をおこない、金庫内の温度が150℃以下に抑えられることを適合基準とする厳格な試験に合格しています。',
            description:
                '※宝石や貴金属、アクセサリーなど高価な物、現金などは一時的な保管としてご利用ください。長期不在等の場合には、侵入窃盗犯による金庫破りに合う恐れがあります。',
            mark: '/images/product/sample1.png',
        },
    ],
    system: {
        thumbnail: '/images/test/product/sample2.png',
        systemName: 'タッチテンキー式(暗証登録数:2種類)',
        details: [
            {
                title: 'LCD画面搭載のタッチパネルテンキーロック',
                description:
                    '4～20桁の暗証番号を2種類登録・変更が可能 で す 。L C D 画 面 で 、鍵 の 施 解 錠・バッテリー交換時期・金庫の操作状況を確認できます。暗証番号の入力を5回続けて間違えると､3分間警告音で異常をお知らせします。',
            },
            {
                title: '10指まで登録できる 指紋照合式テンキー式対応',
                description:
                    'センサーに指を置くと指紋を読み取り照合します。人数や指の種類を問わず、10指まで登録できます。',
            },
            {
                title: '閉め忘れ防止お知らせ機能',
                description:
                    '扉を開けてから1分後に、『ピピ・・・ピピ・・・』と扉が空いていることを警告音でお知らせします。',
            },
            {
                title: 'イタズラ防止機能',
                description:
                    'タッチパネルに触れても操作できないようにロックできます。',
            },
        ],
    },
    design: [
        {
            image: '/images/test/product/sample3.png',
            title: '強固に守るカンヌキと警報機 − 防盗性能',
            description:
                '同サイズの金庫より多い３本仕様のカンヌキ（Φ19mm）が、施錠状態を強固に守ります。警報機は、作動中に金庫を移動したり衝撃を与えると、センサーが反応し約80〜90dBの警報音で威嚇し、周囲へ異常を知らせます。（９Ｖ乾電池付）',
            annotation: '',
        },
        {
            image: '/images/test/product/sample4.png',
            title: '電池残量がない場合は外部から電源供給',
            description:
                '通常の電池ボックスは扉庫内側にあります。電池残量が無く解錠できない場合は、操作パネルに設けたUSBコネクターへ付属の「電源供給ケース」を接続し、一時的に解錠できます。',
            annotation: '',
        },
        {
            image: '/images/test/product/sample5.png',
            title: 'モータードライブ搭載でラクラク開閉',
            description:
                'モータードライブ方式の採用により、カンヌキを自動で引き込みます。扉の開扉時に、鍵を回したり、ハンドルを回す手間がありません。',
            annotation: '',
        },
        {
            image: '/images/test/product/sample6.png',
            title: '扉を開くと充実した収納空間',
            description:
                'A4用紙を収納できるトレーとお好みの位置に変えられる棚板（※）を標準装備しています。',
            annotation: '※棚板は、40タイプのみ付属',
        },
    ],
    option: [
        {
            title: '',
        },
    ],
}

const link = [
    {
        link: '#',
        text: '室内のご指定場所までの搬入・設置を依頼する。',
    },
    {
        link: '#',
        text: '複数ご購入のお客様は別途見積もりいたします。',
    },
    {
        link: '#',
        text: 'この商品に関するお問い合わせはこちら',
    },
]

const recommendDummy: ProductCardData[] = [
    {
        imageSrc: '/sample-img.png',
        imageAlt: 'サンプル',
        lead: '貴重品向け',
        title: 'LK-312PSE',
        linkUrl: '#',
    },
    {
        imageSrc: '/sample-img.png',
        imageAlt: 'サンプル',
        lead: '貴重品向け',
        title: 'LK-312PSE',
        linkUrl: '#',
    },
    {
        imageSrc: '/sample-img.png',
        imageAlt: 'サンプル',
        lead: '貴重品向け',
        title: 'LK-312PSE',
        linkUrl: '#',
    },
    {
        imageSrc: '/sample-img.png',
        imageAlt: 'サンプル',
        lead: '貴重品向け',
        title: 'LK-312PSE',
        linkUrl: '#',
    },
    {
        imageSrc: '/sample-img.png',
        imageAlt: 'サンプル',
        lead: '貴重品向け',
        title: 'LK-312PSE',
        linkUrl: '#',
    },
]

interface FormData {
    targetArea: string
    deliveryArea: string
}

export default function ProductDetailPage() {
    const [quantity, setQuantity] = useState(1)
    const params = useParams<{ id: string }>()
    const form = useForm<FavoriteFormData>({
        defaultValues: {
            product_id: Number(params.id),
        },
    })
    const { setLoading } = useLoading()
    const [user] = useAtom(userAtom)
    const isLoggedIn = !!user && user !== ''

    const imageSlider = useImageSlider({ images: product.slide })
    const handleThumbnail = useCallback(
        (index: number) => {
            return () => imageSlider.goToIndex(index)
        },
        [imageSlider]
    )

    const {
        register,
        formState: { errors },
        watch,
    } = useForm<FormData>()
    const watchedTargetArea = watch('targetArea')
    const watchedDeliveryArea = watch('deliveryArea')

    const targetAreaOptions = [
        { label: '対象地域ではありません。', value: 'not-target' },
        { label: '対象地域です。軒先渡しで注文します。', value: 'target' },
    ]

    const deliveryAreaOption = [
        { label: '配送不可地域ではありません。', value: 'delivery' },
    ]

    const isHeavy = isProductHeavy(product.info)

    const canPurchase = () => {
        const isDisplayingShippingInfo = !isHeavy
        if (!isDisplayingShippingInfo) return true
        return watchedTargetArea && watchedDeliveryArea
    }

    const updateFavorite = async () => {
        if (!isLoggedIn) {
            return
        }
        await changeFavorite(form, {
            setLoading: setLoading,
            onSuccess: (data) => {
                if (data.isAdd) {
                    alert('お気に入りに登録しました。')
                } else {
                    alert('お気に入りを解除しました。')
                }
            },
            onError: (error) => {
                console.error('更新エラー:', error)
            },
        })
    }

    return (
        <div>
            <Breadcrumb />
            <div className="container mx-auto mt-5 flex flex-col gap-9 md:mt-9 md:flex-row md:gap-12">
                <div className="relative md:sticky md:top-16 md:self-start">
                    <div className="hidden md:block">
                        <Image
                            src={imageSlider.currentImage}
                            alt="商品画像"
                            width={514}
                            height={514}
                            className="rounded-[20px] object-cover"
                        />
                    </div>
                    <div className="mt-7 hidden gap-4 md:flex">
                        {product.slide.map((img, idx) => (
                            <div
                                key={idx}
                                className="h-60p w-[60px] cursor-pointer transition-opacity"
                                onClick={handleThumbnail(idx)}>
                                <Image
                                    src={img}
                                    alt="商品画像"
                                    width={60}
                                    height={60}
                                    className="overflow-cover rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="relative md:hidden">
                        <div
                            ref={imageSlider.containerRef}
                            className="relative overflow-hidden rounded-[20px]"
                            onTouchStart={imageSlider.handleTouchStart}
                            onTouchMove={imageSlider.handleTouchMove}
                            onTouchEnd={imageSlider.handleTouchEnd}>
                            <div
                                className="flex transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translateX(${imageSlider.translateX}px)`,
                                }}>
                                <div className="w-full flex-shrink-0">
                                    <Image
                                        src={
                                            product.slide[
                                                imageSlider.currentIndex
                                            ]
                                        }
                                        alt="商品画像"
                                        width={514}
                                        height={514}
                                        className="w-full rounded-[20px] object-cover"
                                    />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 rounded-[6px] bg-black/60 px-2 py-1 text-xs text-white">
                                {imageSlider.currentIndex + 1}/
                                {imageSlider.totalImages}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex-1">
                    <div className="mb-6">
                        <div className="text-2xl md:text-4xl">
                            {product.name}
                        </div>
                        <span className="text-xs text-zinc-500 md:text-sm">
                            {product.type}
                        </span>
                    </div>
                    <div className="mb-5 text-sm md:mb-8 md:text-base">
                        {product.description}
                    </div>
                    <div className="mb-4 flex gap-3 md:gap-4">
                        {product.icons.map((icon, idx) => (
                            <div key={idx} className="w-[40px] md:w-[48px]">
                                <Image
                                    src={icon}
                                    alt="アイコン"
                                    width={48}
                                    height={48}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="item-center mb-5 flex justify-end gap-1 md:mb-8">
                        <div className="w-[22px] md:w-6">
                            <Image
                                src="/images/icon/about-info.svg"
                                alt="アイコン"
                                width={24}
                                height={24}
                            />
                        </div>
                        <Link
                            href="/about-icons/fire-resistance"
                            className="text-sm text-blue-600 md:text-base">
                            アイコンについて
                        </Link>
                    </div>
                    <div className="mb-14 flex items-end gap-5">
                        <div className="text-2xl md:text-3xl">
                            <span className="pr-1 text-base md:text-xl">¥</span>
                            {product.price}
                        </div>
                        <div className="pb-1 text-sm text-red-600 md:text-base">
                            送料込み ※一部地域を除く
                        </div>
                    </div>
                    {!isHeavy && (
                        <div className="mb-12 text-sm md:mb-16 md:text-base">
                            <div className="mb-1 text-lg font-bold md:text-xl">
                                【配送・設置に関するご案内】
                            </div>
                            <p className="mb-10 md:mb-14">
                                本製品は、
                                <span className="text-bold">
                                    一部地域を除き「配送設置料込み」の価格
                                </span>
                                でご案内しております。
                                <br />
                                ただし、以下の地域に該当する場合は、
                                <span className="text-bold text-red-600">
                                    表示価格での配送・設置が制限される
                                </span>
                                ため、ご注文前に必ずご確認ください。
                            </p>
                            <div className="mb-1 text-lg font-bold md:text-xl">
                                【A】表示金額で「軒先渡し」のみ対応可能な地域
                            </div>
                            <p className="mb-1">
                                下記の地域は、「軒先渡し（建物前での引き渡し）」のみが表示金額に含まれます。
                            </p>
                            <p className="text-xs text-zinc-500 md:text-sm">
                                {' '}
                                ※屋内への搬入・設置をご希望の場合は、別途お見積りが必要です。
                            </p>
                            <div className="mt-6">
                                ▼ 下記より対象地域をご確認ください
                            </div>
                            <Link
                                href="#"
                                className="border-b border-blue-600 text-sm text-blue-600 md:text-base">
                                軒先渡しのみ対応可能な地域一覧
                            </Link>
                            <div className="mt-5">
                                ▼ ご注文時に選択してください。
                                <span className="text-red-600">※必須</span>
                            </div>
                            <SelectField
                                id="targetArea"
                                options={targetAreaOptions}
                                placeholder="選択してください"
                                register={register('targetArea', {
                                    required: '確認してください。',
                                })}
                                error={errors.targetArea}
                                className="mt-1 mb-2"
                            />
                            <div className="mb-10 text-sm md:mb-14">
                                ※配送不可地域に該当する場合は、
                                <span className="border-b border-blue-600 text-blue-600">
                                    金庫お見積りフォーム
                                </span>
                                よりお問い合わせください。
                            </div>
                            <div className="mb-1 text-lg font-bold md:text-xl">
                                【B】表示金額では「配送不可」の地域
                            </div>
                            <p className="mb-1">
                                以下の地域は、表示金額では配送・設置が一切対応できません。ご注文をご希望の場合は、必ずお見積りフォームからお問い合わせください。
                            </p>
                            <p className="text-xs text-zinc-500 md:text-sm">
                                {' '}
                                ※屋内への搬入・設置をご希望の場合は、別途お見積りが必要です。
                            </p>
                            <div className="mt-6">
                                ▼ 下記より対象地域をご確認ください
                            </div>
                            <Link
                                href="#"
                                className="border-b border-blue-600 text-sm text-blue-600 md:text-base">
                                送料込み金額にて配送不可の地域一覧
                            </Link>
                            <div className="mt-5">
                                ▼ ご注文時に選択してください。
                                <span className="text-red-600">※必須</span>
                            </div>
                            <SelectField
                                id="deliveryArea"
                                options={deliveryAreaOption}
                                placeholder="選択してください"
                                register={register('deliveryArea', {
                                    required: '確認してください。',
                                })}
                                error={errors.deliveryArea}
                                className="mt-1 mb-2"
                            />
                            <div className="mb-10 text-sm md:mb-14">
                                ※配送不可地域に該当する場合は、
                                <Link
                                    href="#"
                                    className="border-b border-blue-600 text-blue-600">
                                    金庫お見積りフォーム
                                </Link>
                                よりお問い合わせください。
                            </div>
                            <div className="mb-1 text-lg font-bold md:text-xl">
                                【ご注文前のお願い】
                            </div>
                            <p>
                                お届け先が該当地域に含まれている場合、本ページからのご注文は無効となる可能性があります。
                                <br />
                                必ず事前に対象地域をご確認の上、適切な方法でお手続きをお願いいたします。
                            </p>
                        </div>
                    )}
                    <div className="mb-8">
                        <QuantitySelector
                            value={quantity}
                            onChange={setQuantity}
                        />
                    </div>
                    <div className="mb-10 grid grid-cols-1 gap-5 md:mb-14 md:grid-cols-2 md:gap-8">
                        {isHeavy ? (
                            <Link href="#" className="w-full">
                                <AppButton variant="blue" className="w-full">
                                    見積もりフォームへ
                                </AppButton>
                            </Link>
                        ) : (
                            <Link href="#" className="w-full">
                                <AppButton
                                    variant="blue"
                                    disabled={!canPurchase()}
                                    className="w-full">
                                    購入する
                                </AppButton>
                            </Link>
                        )}
                        <AppButton
                            variant={product.is_favorite ? 'black' : 'border'}
                            disabled={!isLoggedIn}
                            onClick={updateFavorite}>
                            {product.is_favorite
                                ? 'お気に入りを解除する'
                                : 'お気に入りに追加する'}
                        </AppButton>
                    </div>
                    <div className="mb-8 bg-zinc-100 px-3 py-4 md:px-4 md:py-5">
                        {product.info.map((info, idx) => (
                            <div
                                key={idx}
                                className="mb-6 flex justify-between gap-16 last:mb-0 md:mb-9">
                                <div className="mb:text-base text-sm font-bold">
                                    {info.title}
                                </div>
                                <div className="mb:text-base flex-1 text-right text-sm">
                                    {info.description}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mb-14 flex flex-col gap-4">
                        {link.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.link}
                                className="w-fit border-b text-sm text-blue-600 md:text-base">
                                {link.text}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-gray-200">
                        {product.performance &&
                            product.performance.length > 0 && (
                                <Accordion
                                    title={'製品性能'}
                                    className="!border-b-none !bg-transparent"
                                    defaultOpen>
                                    {product.performance
                                        .filter(
                                            (x) =>
                                                x &&
                                                (x.image ||
                                                    x.title ||
                                                    x.lead ||
                                                    x.description ||
                                                    x.mark)
                                        )
                                        .map((perf, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
                                                <div className="relative">
                                                    {perf.image && (
                                                        <Image
                                                            src={perf.image}
                                                            alt={perf.title}
                                                            width={200}
                                                            height={203}
                                                            className="rounded-[16px] md:rounded-[20px]"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    {perf.title && (
                                                        <div className="text-bold mb-4 text-lg md:text-xl">
                                                            {perf.title}
                                                        </div>
                                                    )}
                                                    {perf.lead && (
                                                        <div className="mb-3 text-sm text-zinc-700 md:text-base">
                                                            {perf.lead}
                                                        </div>
                                                    )}
                                                    {perf.description && (
                                                        <div className="text-xs text-zinc-500 md:text-sm">
                                                            {perf.description}
                                                        </div>
                                                    )}
                                                    {perf.mark && (
                                                        <Image
                                                            src={perf.mark}
                                                            alt={perf.title}
                                                            width={198}
                                                            height={239}
                                                            className="mt-9"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </Accordion>
                            )}
                        {product.system &&
                            product.system.details &&
                            product.system.details.length > 0 && (
                                <Accordion
                                    title={'ロックシステム'}
                                    className="!bg-transparent">
                                    {product.system.systemName &&
                                        product.system.systemName !== '' && (
                                            <div className="mb-4 text-lg md:text-xl">
                                                {product.system.systemName}
                                            </div>
                                        )}
                                    {product.system.thumbnail &&
                                        product.system.thumbnail !== '' && (
                                            <div className="relative mb-8">
                                                <Image
                                                    src={
                                                        product.system.thumbnail
                                                    }
                                                    alt={
                                                        product.system
                                                            .systemName
                                                    }
                                                    width={710}
                                                    height={215}
                                                    className="rounded-[16px] md:rounded-[20px]"
                                                />
                                            </div>
                                        )}
                                    {product.system.details
                                        .filter(
                                            (x) =>
                                                x && (x.title || x.description)
                                        )
                                        .map((sys, idx) => (
                                            <div key={idx} className="mt-8">
                                                {sys.title && (
                                                    <div className="mb-4 text-lg text-zinc-700 md:text-xl">
                                                        {sys.title}
                                                    </div>
                                                )}
                                                {sys.description && (
                                                    <div className="text-sm text-zinc-500 md:text-base">
                                                        {sys.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </Accordion>
                            )}
                        {product.design && product.design.length > 0 && (
                            <Accordion
                                title={'親切設計'}
                                className="!bg-transparent">
                                {product.design
                                    .filter(
                                        (x) =>
                                            x &&
                                            (x.image ||
                                                x.title ||
                                                x.description ||
                                                x.annotation)
                                    )
                                    .map((design, idx) => (
                                        <div
                                            key={idx}
                                            className="mb-8 flex flex-col items-center gap-6 last:mb-0 md:flex-row md:gap-10">
                                            <div className="relative">
                                                {design.image && (
                                                    <Image
                                                        src={design.image}
                                                        alt={design.title}
                                                        width={205}
                                                        height={205}
                                                        className="rounded-[16px] md:rounded-[20px]"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                {design.title && (
                                                    <div className="mb-4 text-lg md:text-xl">
                                                        {design.title}
                                                    </div>
                                                )}
                                                {design.description && (
                                                    <div className="mb-3 text-sm text-zinc-700 md:text-base">
                                                        {design.description}
                                                    </div>
                                                )}
                                                {design.annotation && (
                                                    <div className="text-xs text-zinc-500 md:text-sm">
                                                        {design.annotation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </Accordion>
                        )}
                        {product.option &&
                            product.option.filter(
                                (opt) => opt && opt.title && opt.title !== ''
                            ).length > 0 && (
                                <Accordion
                                    title={'オプション'}
                                    className="!bg-transparent">
                                    {product.option
                                        .filter((x) => x && x.title)
                                        .map((opt, idx) => (
                                            <div key={idx}>
                                                {opt.title && (
                                                    <div>{opt.title}</div>
                                                )}
                                            </div>
                                        ))}
                                </Accordion>
                            )}
                    </div>
                </div>
            </div>
            <RecommendCarousel cards={recommendDummy}></RecommendCarousel>
        </div>
    )
}
