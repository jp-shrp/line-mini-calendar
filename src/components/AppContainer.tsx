'use client'

import React from 'react'

type AppContainerProps = {
    children: React.ReactNode
}

export default function AppContainer({ children }: AppContainerProps) {
    return <div className="mx-auto max-w-[1312px]">{children}</div>
}
