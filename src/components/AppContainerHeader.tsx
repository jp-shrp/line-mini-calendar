'use client'

import React from 'react'
import Breadcrumb from '@/components/Breadcrumb'

type AppContainerHeaderProps = {
    title?: string
    subtitle?: string
    showBreadcrumb?: boolean
    isPxNone?: boolean
}

export default function AppContainerHeader({
    title,
    subtitle,
    showBreadcrumb = true,
    isPxNone,
}: AppContainerHeaderProps) {
    return (
        <div
            className={`mt-4 pb-8 md:mt-9 md:pb-13 ${isPxNone ? 'px-0' : 'px-4'} `}>
            {showBreadcrumb && <Breadcrumb />}
            <div className="mt-4 md:mt-6">
                <div v-if="title" className="mb-3 text-3xl md:mb-5 md:text-6xl">
                    {title}
                </div>
                <div v-if="subtitle" className="text-sm md:text-xl">
                    {subtitle}
                </div>
            </div>
        </div>
    )
}
