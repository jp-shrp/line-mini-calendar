/**
 * 認証Context
 * 統合認証（匿名認証 + LINE認証）の状態を管理します
 */

'use client'

import {
    useIntegratedAuth,
    type AuthMethod,
} from '@/src/hooks/useIntegratedAuth'
import type { Profile } from '@line/liff'
import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    userId: string | null
    error: Error | null
    authMethod: AuthMethod
    lineProfile: Profile | null
    switchToLineAuth: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useIntegratedAuth()

    // ローディング中は何も表示しない
    if (auth.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">
                        {auth.authMethod === 'line'
                            ? 'LINE認証中...'
                            : '認証中...'}
                    </p>
                </div>
            </div>
        )
    }

    // エラーが発生した場合
    if (auth.error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-red-600">
                        認証エラーが発生しました
                    </p>
                    <p className="text-gray-600">{auth.error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        再読み込み
                    </button>
                </div>
            </div>
        )
    }

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}

/**
 * 認証ガード
 * 認証が完了していない場合はエラー画面を表示
 */
interface AuthGuardProps {
    children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-red-600">認証が必要です</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        再読み込み
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
