'use client'

import { getSupabaseClient } from '@/db/supabase'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

/**
 * ハンバーガーメニューコンポーネント
 * @description
 * (protected)グループ内で共通使用するハンバーガーメニュー
 * ページ遷移、AIテスト、ログアウト機能を提供
 */
export const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleNavigate = useCallback(
        (path: string) => {
            router.push(path)
            handleClose()
        },
        [router, handleClose]
    )

    const handleLogout = useCallback(async () => {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut()
        router.push('/auth')
    }, [router])

    return (
        <>
            <button
                onClick={handleToggle}
                className="relative z-50 flex h-10 w-full flex-col items-end justify-center gap-1.5 pr-3"
                aria-label="メニュー">
                <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                        isOpen ? 'translate-y-2 rotate-45' : ''
                    }`}
                />
                <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                        isOpen ? 'opacity-0' : ''
                    }`}
                />
                <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${
                        isOpen ? '-translate-y-2 -rotate-45' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={handleClose}
                    />
                    <div className="fixed top-0 right-0 z-50 flex h-full w-64 flex-col bg-white shadow-lg">
                        <div className="flex items-center justify-end p-4">
                            <button
                                onClick={handleClose}
                                className="text-2xl text-gray-600 hover:text-gray-900"
                                aria-label="閉じる">
                                ×
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2 px-4">
                            <button
                                onClick={() => handleNavigate('/calendar')}
                                className="rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
                                カレンダー
                            </button>
                            <button
                                onClick={() => handleNavigate('/calendar/list')}
                                className="rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
                                イベント一覧
                            </button>
                            <button
                                onClick={() => handleNavigate('/line-register')}
                                className="rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
                                LINE登録
                            </button>
                            <button
                                onClick={() => handleNavigate('/settings')}
                                className="rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
                                設定
                            </button>
                            <button
                                onClick={() => handleNavigate('/ai-test')}
                                className="rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100">
                                AIテスト
                            </button>
                            <div className="my-2 border-t border-gray-200" />
                            <button
                                onClick={handleLogout}
                                className="rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50">
                                ログアウト
                            </button>
                        </nav>
                    </div>
                </>
            )}
        </>
    )
}
