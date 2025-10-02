'use client'
import { LoadingProvider } from '@/src/contexts/LoadingContext'
import { ModalProvider } from '@/src/contexts/ModalContext'
import { OnLoadingProvider } from '@/src/contexts/OnLoadingContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

interface ClientWrapperProps {
    children: ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 5 * 60 * 1000, // 5分
            refetchOnWindowFocus: false,
        },
    },
})

export default function ClientWrapper({ children }: ClientWrapperProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <LoadingProvider>
                <ModalProvider>
                    <OnLoadingProvider>{children}</OnLoadingProvider>
                </ModalProvider>
            </LoadingProvider>
        </QueryClientProvider>
    )
}
