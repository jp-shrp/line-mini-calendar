'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { LockSystemType } from '../../model/LockSystemType'
import { SubCategory } from '../../model/SubCategory'

type items = {
    name: string
    path: string
}

type FooterProps = {
    locks: LockSystemType[]
    subCategories: SubCategory[]
    supports: items[]
    quotations: items[]
}

export default function Footer({
    locks,
    subCategories,
    supports,
    quotations,
}: FooterProps) {
    const [date, setDate] = useState<Date | null>(null)

    useEffect(() => {
        setDate(new Date())
    }, [])

    const footerLinks = [
        { name: '会社情報', path: '/about' },
        { name: '会員規約', path: '/' },
        { name: '利用規約', path: '/' },
        { name: 'プライバシーポリシー', path: '/' },
        { name: 'クッキーポリシー', path: '/' },
        { name: '特定商取引に関する法律に基づく表記', path: '/tradelaw' },
    ]

    const subCategoryMid = Math.ceil(subCategories.length / 2)

    return (
        <footer className="bg-black text-sm text-white">
            <div className="container mx-auto flex-col px-4 py-6 md:flex">
                <div className="hidden md:block">
                    <div className="flex">
                        <div className="mb-4 md:mb-0 md:w-1/5">
                            <div className="mb-2 text-base font-bold">
                                カスタム検索
                            </div>
                            <div className="space-y-1">
                                <Link
                                    href="/custom-search"
                                    className="block hover:underline">
                                    カスタム検索
                                </Link>
                            </div>
                        </div>

                        <div className="mb-4 md:mb-0 md:w-2/5">
                            <div className="mb-2 text-base font-bold">
                                種類で選ぶ
                            </div>
                            <div className="flex">
                                <ul className="w-1/2">
                                    {subCategories
                                        .slice(0, subCategoryMid)
                                        .map((val) => (
                                            <li key={val.id} className="py-0.5">
                                                <Link
                                                    href={`/${val.id}`}
                                                    className="block hover:underline hover:underline-offset-6">
                                                    {val.name}
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                                <ul className="w-1/2">
                                    {subCategories
                                        .slice(subCategoryMid)
                                        .map((val) => (
                                            <li key={val.id} className="py-0.5">
                                                <Link
                                                    href={`/${val.id}`}
                                                    className="block hover:underline hover:underline-offset-6">
                                                    {val.name}
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mb-4 md:mb-0 md:w-1/5">
                            <div className="mb-2 text-base font-bold">
                                ロックで選ぶ
                            </div>
                            <div className="flex">
                                <ul>
                                    {locks.map((val) => (
                                        <li key={val.id} className="py-0.5">
                                            <Link
                                                href={`/${val.id}`}
                                                className="block hover:underline hover:underline-offset-6">
                                                {val.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mb-4 md:mb-0 md:w-1/5">
                            <div className="mb-2 text-base font-bold">
                                {date && (
                                    <Calendar
                                        value={date}
                                        className="mx-auto rounded bg-white text-black"
                                        formatDay={(locale, date) =>
                                            String(date.getDate())
                                        }
                                        prev2Label={null}
                                        next2Label={null}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="mb-4 md:mb-0 md:w-1/5">
                            <div className="mb-2 text-base font-bold">
                                お客様サポート
                            </div>
                            <div>
                                <ul>
                                    {supports.map((val, index) => (
                                        <li key={index} className="py-0.5">
                                            <Link
                                                href={val.path}
                                                className="block hover:underline hover:underline-offset-6">
                                                {val.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mb-4 md:mb-0 md:w-1/5">
                            <div className="mb-2 text-base font-bold">
                                お見積もり
                            </div>
                            <div className="flex">
                                <ul>
                                    {quotations.map((val, index) => (
                                        <li key={index} className="py-0.5">
                                            <Link
                                                href={val.path}
                                                className="block hover:underline hover:underline-offset-6">
                                                {val.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden">
                    <div>アコーディオン</div>
                </div>
            </div>

            <div className="container m-auto px-4">
                <div className="flex flex-wrap justify-center border-t border-white py-4 text-center text-xs">
                    {footerLinks.map((val, index) => (
                        <Link
                            href={val.path}
                            key={index}
                            className="mx-2 block hover:underline hover:underline-offset-6">
                            {val.name}
                        </Link>
                    ))}
                </div>
                <div className="pb-4 text-center">© EIKO Co.Ltd.</div>
            </div>
        </footer>
    )
}
