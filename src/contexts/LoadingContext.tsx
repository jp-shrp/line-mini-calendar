'use client'
import { createContext, ReactNode, useContext, useState } from 'react'

interface LoadingContextType {
    isLoading: boolean
    showLoading: (message?: string) => void
    hideLoading: () => void
    setLoading: (loading: boolean, message?: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
    const context = useContext(LoadingContext)
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider')
    }
    return context
}

interface LoadingProviderProps {
    children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
    const [isLoading, setIsLoading] = useState(false)

    const showLoading = () => {
        setIsLoading(true)
    }

    const hideLoading = () => {
        setIsLoading(false)
    }

    const setLoading = (loading: boolean) => {
        if (loading) {
            showLoading()
        } else {
            hideLoading()
        }
    }

    return (
        <LoadingContext.Provider
            value={{ isLoading, showLoading, hideLoading, setLoading }}>
            {children}

            {/* グローバルローディングオーバーレイ */}
            {isLoading && (
                <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/30 p-0">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </LoadingContext.Provider>
    )
}
