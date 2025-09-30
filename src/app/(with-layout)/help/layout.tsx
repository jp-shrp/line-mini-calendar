'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppContainerHeader from '@/components/AppContainerHeader'
import AppMenu from '@/components/AppMenu'
import AppContents from '@/components/AppContents'
import AppContainer from '@/components/AppContainer'

export default function CustomerSupportLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const menuItems = [
        { href: '/help/process', label: 'ご購入の手順' },
        { href: '/help/payment', label: 'お支払い方法' },
        { href: '/help/delivery', label: '納品方法について' },
        { href: '/help/reexca', label: '返品・交換・キャンセル' },
        { href: '/help/postage', label: '送料・お届けについて' },
        { href: '/help/repair', label: '修理・アフターサポート' },
        { href: '/help/faq', label: '製品不都合のよくある質問' },
    ]

    return (
        <AppContainer>
            <AppContainerHeader title={'FAQ'} subtitle={'お客様サポート'} />
            <div className="mb-12 flex flex-col gap-12 md:mb-8 md:flex-row md:gap-6">
                <AppMenu menuitems={menuItems} pathname={pathname} />
                <AppContents>
                    <div id="help">{children}</div>
                </AppContents>
            </div>
            <style jsx global>{`
                #help .headline {
                    color: #89b631;
                }
            `}</style>
        </AppContainer>
    )
}
