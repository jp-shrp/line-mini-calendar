'use client'
import { LoadingProvider } from '@/src/contexts/LoadingContext'
import { ModalProvider, useModal } from '@/src/contexts/ModalContext'
import { OnLoadingProvider } from '@/src/contexts/OnLoadingContext'
import { queryClient, setGlobalErrorHandler } from '@/src/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'

interface ClientWrapperProps {
    children: ReactNode
}

/**
 * エラーハンドラーのセットアップ
 * useModalを使用するため、ModalProviderの内側に配置する必要がある
 */
function ErrorHandlerSetup({ children }: { children: ReactNode }) {
    const { openModal } = useModal()

    useEffect(() => {
        setGlobalErrorHandler((error: any) => {
            openModal({
                title: error?.title || 'エラーが発生しました',
                content: error?.message || '予期しないエラーが発生しました',
                type: 'error',
            })
        })
    }, [openModal])

    return <>{children}</>
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <LoadingProvider>
                <ModalProvider>
                    <ErrorHandlerSetup>
                        <OnLoadingProvider>{children}</OnLoadingProvider>
                    </ErrorHandlerSetup>
                </ModalProvider>
            </LoadingProvider>
        </QueryClientProvider>
    )
}
