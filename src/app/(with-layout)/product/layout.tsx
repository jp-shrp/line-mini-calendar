'use client'

import React from 'react'

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="mt-4 md:mt-9">
            <div className="px-[14px]">{children}</div>
        </div>
    )
}
