'use client'
import { LoadingProvider } from '@/src/contexts/LoadingContext'
import { ModalProvider, useModal } from '@/src/contexts/ModalContext'
import { OnLoadingProvider } from '@/src/contexts/OnLoadingContext'
import { AuthProvider } from '@/src/contexts/AuthContext'
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
        setGlobalErrorHandler(async (error: any) => {
            // 401エラーの場合は自動的にサインアウトして再ログイン
            if (error?.status === 401) {
                const { getSupabaseClient } = await import('@/db/supabase')
                const supabase = getSupabaseClient()

                // サインアウト
                await supabase.auth.signOut()

                // 再ログイン
                const { error: signInError } =
                    await supabase.auth.signInAnonymously({
                        options: {
                            data: {
                                display_name: 'Anonymous User',
                                is_anonymous: true,
                            },
                        },
                    })

                if (!signInError) {
                    // 再ログイン成功したらページをリロード
                    window.location.reload()
                    return
                }
            }

            // 401以外のエラーはモーダル表示
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
                        <OnLoadingProvider>
                            <AuthProvider>{children}</AuthProvider>
                        </OnLoadingProvider>
                    </ErrorHandlerSetup>
                </ModalProvider>
            </LoadingProvider>
        </QueryClientProvider>
    )
}
