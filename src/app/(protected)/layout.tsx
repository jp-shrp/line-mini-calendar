/**
 * 保護されたルートのレイアウト
 * このグループ内のすべてのページは認証が必要
 * 注: AuthProviderはClientWrapperで提供されているため、ここではAuthGuardのみを使用
 */
'use client'

import { AuthGuard } from '@/src/contexts/AuthContext'
import { ReactNode } from 'react'

interface ProtectedLayoutProps {
    children: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return <AuthGuard>{children}</AuthGuard>
}
