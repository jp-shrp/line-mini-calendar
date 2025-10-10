/**
 * LIFFコンテキスト
 * LIFF SDKの状態をReact Contextで管理
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useLiff, type UseLiffReturn } from '@/src/hooks/useLiff'

/**
 * LIFFコンテキストの型定義
 */
export type LiffContextType = UseLiffReturn

/**
 * LIFFコンテキスト
 */
const LiffContext = createContext<LiffContextType | null>(null)

/**
 * LIFFプロバイダーのProps
 */
export interface LiffProviderProps {
    children: ReactNode
}

/**
 * LIFFプロバイダー
 */
export function LiffProvider({ children }: LiffProviderProps) {
    const liffState = useLiff()

    return (
        <LiffContext.Provider value={liffState}>
            {children}
        </LiffContext.Provider>
    )
}

/**
 * LIFFコンテキストを使用するフック
 */
export function useLiffContext(): LiffContextType {
    const context = useContext(LiffContext)

    if (!context) {
        throw new Error('useLiffContext must be used within LiffProvider')
    }

    return context
}
