'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppMenu from '@/components/AppMenu'
import AppContents from '@/components/AppContents'

export default function AboutIconsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const menuItems = [
        { href: '/about-icons/fire-resistance', label: '耐火性能' },
        { href: '/about-icons/anti-theft', label: '盗難性能' },
        { href: '/about-icons/waterproof', label: '防水性能' },
        { href: '/about-icons/lock-types', label: '錠前の種類' },
        { href: '/about-icons/storage-size', label: '収納サイズ' },
        { href: '/about-icons/delivery-date', label: '納期' },
        { href: '/about-icons/functions-and-structure', label: '機能・構造' },
        { href: '/about-icons/others', label: 'その他' },
    ]

    return (
        <div>
            <AppContainerHeader
                title={'About Icons'}
                subtitle={'アイコンについて'}
            />
            <div className="mb-12 flex flex-col gap-12 md:mb-8 md:flex-row md:gap-6">
                <AppMenu menuitems={menuItems} pathname={pathname} />
                <AppContents>
                    <div id="about_icons">{children}</div>
                </AppContents>
            </div>
        </div>
    )
}
