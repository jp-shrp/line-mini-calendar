/**
 * 保護されたルートのレイアウト
 * このグループ内のすべてのページは認証が必要
 * 注: AuthProviderはClientWrapperで提供されているため、ここではAuthGuardのみを使用
 */
'use client'

import { HamburgerMenu } from '@/src/components/HamburgerMenu'
import { AuthGuard } from '@/src/contexts/AuthContext'
import { ReactNode } from 'react'

interface ProtectedLayoutProps {
    children: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <AuthGuard>
            <div className="relative">
                <div className="fixed top-0 z-50 w-full bg-gray-300">
                    <HamburgerMenu />
                </div>
                <div className="mt-8">{children}</div>
            </div>
        </AuthGuard>
    )
}
