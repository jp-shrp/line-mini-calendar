'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { LockSystemType } from '../../model/LockSystemType'
import { SubCategory } from '../../model/SubCategory'

type items = {
    name: string
    path: string
}

type HeaderProps = {
    locks: LockSystemType[]
    subCategories: SubCategory[]
    supports: items[]
    quotations: items[]
}

export default function Header({
    locks,
    subCategories,
    supports,
    quotations,
}: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [accordion, setAccordion] = useState<{ [key: string]: boolean }>({})

    const toggleAccordion = (key: string) => {
        setAccordion((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const subCategoryMid = Math.ceil(subCategories.length / 2)
    const lockMid = Math.ceil(locks.length / 2)

    return (
        <header>
            <div className="container m-auto flex items-center justify-between p-4">
                <div className="flex flex-col items-start md:flex-row md:items-center">
                    <Link href="/">
                        <Image
                            src="/images/logo.svg"
                            alt="logo"
                            width={100}
                            height={100}
                            className="cursor-pointer"
                        />
                    </Link>
                    <h1 className="ml-0 text-lg font-bold md:ml-4">
                        エイコー金庫ダイレクト
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <Image
                        src="/images/icon/search.svg"
                        alt="search"
                        width={26}
                        height={26}
                    />
                    <div className="h-6 w-px bg-gray-400" />
                    <Image
                        src="/images/icon/user.svg"
                        alt="user"
                        width={26}
                        height={26}
                    />
                    <Image
                        src="/images/icon/cart.svg"
                        alt="cart"
                        width={26}
                        height={26}
                    />
                </div>
            </div>

            <div className="hidden items-center justify-center bg-black py-4 text-sm text-white md:flex">
                <Link
                    href="/custom-search"
                    className="px-3 py-1 font-semibold hover:underline hover:underline-offset-8">
                    カスタム検索
                </Link>

                <div className="group relative">
                    <div className="cursor-pointer px-3 py-1 font-semibold group-hover:underline group-hover:underline-offset-8">
                        機種で選ぶ
                    </div>
                    <div className="absolute top-full left-0 z-10 mt-0 hidden min-w-[400px] grid-cols-2 gap-2 rounded bg-black p-2 group-hover:grid">
                        <ul className="space-y-1">
                            {subCategories
                                .slice(0, subCategoryMid)
                                .map((val) => (
                                    <li key={val.id}>
                                        <Link
                                            href={`/${val.id}`}
                                            className="block p-2 hover:underline hover:underline-offset-8">
                                            {val.name}
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                        <ul className="space-y-1">
                            {subCategories.slice(subCategoryMid).map((val) => (
                                <li key={val.id}>
                                    <Link
                                        href={`/${val.id}`}
                                        className="block p-2 hover:underline hover:underline-offset-8">
                                        {val.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="group relative">
                    <div className="cursor-pointer px-3 py-1 font-semibold group-hover:underline group-hover:underline-offset-8">
                        ロックで選ぶ
                    </div>
                    <div className="absolute top-full left-0 z-10 mt-0 hidden min-w-[400px] grid-cols-2 gap-2 rounded bg-black p-2 group-hover:grid">
                        <ul className="space-y-1">
                            {locks.slice(0, lockMid).map((val) => (
                                <li key={val.id}>
                                    <Link
                                        href={`/${val.id}`}
                                        className="block p-2 hover:underline hover:underline-offset-8">
                                        {val.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="space-y-1">
                            {locks.slice(lockMid).map((val) => (
                                <li key={val.id}>
                                    <Link
                                        href={`/${val.id}`}
                                        className="block p-2 hover:underline hover:underline-offset-8">
                                        {val.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="group relative">
                    <div className="cursor-pointer px-3 py-1 font-semibold group-hover:underline group-hover:underline-offset-8">
                        お客様サポート
                    </div>
                    <div className="absolute top-full left-0 z-10 mt-0 hidden min-w-[200px] flex-col gap-1 rounded bg-black p-2 group-hover:flex">
                        {supports.map((val) => (
                            <Link
                                key={val.name}
                                href={`${val.path}`}
                                className="block p-2 hover:underline hover:underline-offset-8">
                                {val.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="group relative">
                    <div className="cursor-pointer px-3 py-1 font-semibold group-hover:underline group-hover:underline-offset-8">
                        お見積り
                    </div>
                    <div className="absolute top-full left-0 z-10 mt-0 hidden min-w-[200px] flex-col gap-1 rounded bg-black p-2 group-hover:flex">
                        {quotations.map((val) => (
                            <Link
                                key={val.name}
                                href={`${val.path}`}
                                className="block p-2 leading-[25px] hover:underline hover:underline-offset-8">
                                {val.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <Link
                    href="/help/contact"
                    className="px-3 py-1 font-semibold hover:underline hover:underline-offset-8">
                    お問い合わせ
                </Link>

                <Link
                    href="/help/contact"
                    className="px-3 py-1 font-semibold hover:underline hover:underline-offset-8">
                    鍵でお困りの方
                </Link>
            </div>

            {/* スマホメニュー */}
            <div className="bg-black text-white md:hidden">
                <div className="container m-auto px-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="メニュー">
                        <div className="py-2 text-sm font-bold">
                            メニュー {isOpen ? '▲' : '▼'}
                        </div>
                    </button>

                    {isOpen && (
                        <div className="space-y-2 text-sm font-medium">
                            <Link
                                href="/"
                                onClick={() => setIsOpen(false)}
                                className="block">
                                ホーム
                            </Link>

                            {/* 製品アコーディオン */}
                            <div>
                                <button
                                    onClick={() => toggleAccordion('products')}
                                    className="w-full text-left">
                                    製品 {accordion['products'] ? '▲' : '▼'}
                                </button>
                                {accordion['products'] && (
                                    <div className="space-y-1 pl-4">
                                        <Link
                                            href="/products"
                                            onClick={() => setIsOpen(false)}>
                                            製品一覧
                                        </Link>
                                        <Link
                                            href="/products/popular"
                                            onClick={() => setIsOpen(false)}>
                                            人気商品
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/news"
                                onClick={() => setIsOpen(false)}
                                className="block">
                                お知らせ
                            </Link>

                            {/* サポートアコーディオン */}
                            <div>
                                <button
                                    onClick={() => toggleAccordion('support')}
                                    className="w-full text-left">
                                    サポート {accordion['support'] ? '▲' : '▼'}
                                </button>
                                {accordion['support'] && (
                                    <div className="space-y-1 pl-4">
                                        <Link
                                            href="/guide"
                                            onClick={() => setIsOpen(false)}>
                                            ご利用ガイド
                                        </Link>
                                        <Link
                                            href="/contact"
                                            onClick={() => setIsOpen(false)}>
                                            お問い合わせ
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
