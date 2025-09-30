'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type PathMap = {
    name?: string
    display?: boolean
    children?: {
        [key: string]: PathMap
    }
}

type Props = {
    customLabels?: Record<string, string>
}

const pathNameMap: Record<string, PathMap> = {
    help: {
        display: false,
        children: {
            payment: { name: 'お支払い方法' },
            process: { name: 'ご購入の手順' },
            postage: { name: '納品方法について' },
            reexca: { name: '返品・交換・キャンセル' },
            delivery: { name: '送料・お届けについて' },
            repair: { name: '修理について' },
            faq: { name: '製品不都合のよくある質問' },
        },
    },
    about: {
        name: '会社情報',
    },
    tradelaw: {
        name: '特定商取引法に基づく表記',
    },
    'terms-of-use': {
        name: 'ご利用にあたって',
    },
    'membership-terms': {
        name: '会員規約',
    },
    'about-icons': {
        display: false,
        children: {
            'fire-resistance': { name: '耐火性能' },
            'anti-theft': { name: '盗難性能' },
            waterproof: { name: '防水性能' },
            'lock-types': { name: '錠前の種類' },
            'storage-size': { name: '収納サイズ' },
            'delivery-date': { name: '納期' },
            'functions-and-structure': { name: '機能・構造' },
            others: { name: 'その他' },
        },
    },
    'custom-search': {
        name: 'カスタム検索',
    },
    product: {
        display: false,
        children: {
            list: { name: '商品' },
        },
    },
}

export default function Breadcrumb({ customLabels = {} }: Props) {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbItems = []
    let pathAcc = ''
    let mapCursor: Record<string, PathMap> | undefined = pathNameMap

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const next: PathMap | undefined = mapCursor?.[segment]

        if (!next || next.display === false) {
            pathAcc += '/' + segment
            mapCursor = next?.children
            continue
        }

        pathAcc += '/' + segment
        breadcrumbItems.push({
            href: pathAcc,
            label: customLabels[segment] ?? next.name ?? segment,
        })

        mapCursor = next.children
    }

    return (
        <nav area-label="breadcrumb">
            <ol className="flex space-x-2 text-sm">
                <li>
                    <Link href="/">ホーム</Link>
                    {breadcrumbItems.length > 0 && (
                        <span className="mx-1">/</span>
                    )}
                </li>
                {breadcrumbItems.map((crumb, idx) => (
                    <li key={idx}>
                        {idx < breadcrumbItems.length - 1 ? (
                            <>
                                <Link href={crumb.href}>{crumb.label}</Link>
                                <span className="mx-1">/</span>
                            </>
                        ) : (
                            <span className="text-zinc-400">{crumb.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
