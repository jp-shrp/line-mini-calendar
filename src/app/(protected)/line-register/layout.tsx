'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClient } from '@/src/lib/query-client'

interface LineRegisterLayoutProps {
    children: ReactNode
}

/**
 * LINE登録ページ専用レイアウト
 * @description
 * QueryClientProviderを再度ラップして、
 * useSearchParams使用時のQueryClient問題を解決
 */
export default function LineRegisterLayout({
    children,
}: LineRegisterLayoutProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
