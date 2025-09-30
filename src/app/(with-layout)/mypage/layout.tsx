'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppMenu from '@/components/AppMenu'
import AppContents from '@/components/AppContents'

export default function MypageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const menuItems = [
        { href: '/mypage/order-history', label: 'ご注文履歴' },
        { href: '/mypage/favorites', label: 'お気に入り一覧' },
        { href: '/mypage/edit', label: '会員情報編集' },
        { href: '/mypage/delivery-address', label: 'お届け先情報' },
        { href: '/mypage/withdrawal', label: '退会手続き' },
    ]

    return (
        <>
            <AppContainerHeader />
            <div className="flex flex-col gap-0 md:flex-row md:gap-6">
                <AppMenu menuitems={menuItems} pathname={pathname} />
                <AppContents>{children}</AppContents>
            </div>
        </>
    )
}
