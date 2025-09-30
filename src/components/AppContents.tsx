'use client'

import React from 'react'

export default function AppContents({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            className="flex-1 bg-white px-0 px-4 py-8 md:rounded-2xl md:px-6 md:py-10"
            style={{ height: 'fit-content' }}>
            {children}
        </div>
    )
}
