'use client'
import { createContext, ReactNode, useContext, useRef, useState } from 'react'
import { useModal } from './ModalContext'

interface OnLoadingResult<T> {
    success: boolean
    data?: T
    error?: Error
    message?: string
}

interface OnLoadingOptions {
    throw?: boolean
}

interface OnLoadingContextType {
    isLoading: boolean
    onLoad: <T>(
        loadingFn: () => Promise<T>,
        options?: OnLoadingOptions
    ) => Promise<OnLoadingResult<T>>
    setLoading: (loading: boolean) => void
}

const OnLoadingContext = createContext<OnLoadingContextType | undefined>(
    undefined
)

export function useOnLoading() {
    const context = useContext(OnLoadingContext)
    if (!context) {
        throw new Error('useOnLoading must be used within an OnLoadingProvider')
    }
    return context
}

interface OnLoadingProviderProps {
    children: ReactNode
}

export function OnLoadingProvider({ children }: OnLoadingProviderProps) {
    const [isLoading, setIsLoadingState] = useState(false)
    const loadingCountRef = useRef(0)
    const manualLoadingRef = useRef(false)
    const { openModal } = useModal()

    const updateLoadingState = () => {
        const shouldBeLoading =
            loadingCountRef.current > 0 || manualLoadingRef.current
        setIsLoadingState(shouldBeLoading)
    }

    const onLoad = async <T,>(
        loadingFn: () => Promise<T>,
        options: OnLoadingOptions = { throw: true }
    ): Promise<OnLoadingResult<T>> => {
        loadingCountRef.current++
        updateLoadingState()

        try {
            const result = await loadingFn()
            return {
                success: true,
                data: result,
            }
        } catch (error) {
            const errorObj = error as Error
            const result: OnLoadingResult<T> = {
                success: false,
                error: errorObj,
                message: errorObj.message,
            }

            // エラー時のモーダル表示（422エラーの場合は表示しない）
            if (result.error && result.message) {
                const errorStatus = (errorObj as any).status || 0
                if (errorStatus !== 422) {
                    setIsLoadingState(false)
                    openModal({
                        title: 'エラーが発生しました',
                        content: result.message,
                        type: 'error',
                    })
                }
            }

            // デフォルトでthrowする（throw: falseの場合はthrowしない）
            if (options.throw !== false) {
                setIsLoadingState(false)
                throw error
            }

            return result
        } finally {
            loadingCountRef.current--
            updateLoadingState()
        }
    }

    const setLoading = (loading: boolean) => {
        manualLoadingRef.current = loading
        updateLoadingState()
    }

    return (
        <OnLoadingContext.Provider value={{ isLoading, onLoad, setLoading }}>
            {children}

            {/* グローバルローディングオーバーレイ */}
            {isLoading && (
                <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/30 p-0">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </OnLoadingContext.Provider>
    )
}
