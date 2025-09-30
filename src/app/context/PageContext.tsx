'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type PageContextType = {
    cardTitle: string
    setCardTitle: (title: string) => void
    subtitle: string
    setSubtitle: (title: string) => void
    breadcrumb: string[]
    setBreadcrumb: (crumbs: string[]) => void
}

const defaultValue: PageContextType = {
    cardTitle: '',
    setCardTitle: () => {},
    subtitle: '',
    setSubtitle: () => {},
    breadcrumb: [],
    setBreadcrumb: () => {},
}

export const PageContext = createContext<PageContextType>(defaultValue)

export function PageProvider({ children }: { children: ReactNode }) {
    const [cardTitle, setCardTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [breadcrumb, setBreadcrumb] = useState<string[]>([])

    return (
        <PageContext.Provider
            value={{
                cardTitle,
                setCardTitle,
                subtitle,
                setSubtitle,
                breadcrumb,
                setBreadcrumb,
            }}>
            {children}
        </PageContext.Provider>
    )
}

export function usePageContext() {
    return useContext(PageContext)
}
