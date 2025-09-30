'use client'

import React from 'react'

type AppContentsCardProps = {
    title?: string
    isNoBorder?: boolean
    children: React.ReactNode
}

export default function AppContentsCard({
    title,
    isNoBorder,
    children,
}: AppContentsCardProps) {
    return (
        <div>
            <div
                className="pb-6 text-xl md:pb-12 md:text-3xl"
                style={{ borderBottom: isNoBorder ? '' : '1px solid #e9eaeb' }}>
                {title}
            </div>
            <div className="text-sm md:text-base">{children}</div>
        </div>
    )
}
