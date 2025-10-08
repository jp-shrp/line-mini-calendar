'use client'

import { CustomError } from '@/src/types/api'
import Link from 'next/link'

/**
 * Event Detail Error Boundary
 * Server Componentでエラーが発生した際にこのコンポーネントが表示される
 */

interface ErrorPageProps {
    error: (Error | CustomError) & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    // エラーメッセージからエラー情報を抽出
    const errorData = CustomError.parseErrorMessage(error.message)

    // CustomErrorからstatus情報を取得（fallback: プロパティから直接取得）
    const status =
        errorData?.status ||
        (error instanceof CustomError ? error.status : undefined)
    const code =
        errorData?.code ||
        (error instanceof CustomError ? error.code : undefined)
    const title =
        errorData?.title ||
        (error instanceof CustomError ? error.title : undefined)
    const displayMessage = errorData?.message || error.message

    // statusに応じたメッセージとスタイル
    const getErrorStyle = () => {
        if (status === 404) {
            return {
                colorClass: 'text-yellow-600',
                bgClass: 'bg-yellow-50',
                borderClass: 'border-yellow-200',
                iconColor: 'text-yellow-600',
            }
        }
        if (status && status >= 400 && status < 500) {
            return {
                colorClass: 'text-orange-600',
                bgClass: 'bg-orange-50',
                borderClass: 'border-orange-200',
                iconColor: 'text-orange-600',
            }
        }
        return {
            colorClass: 'text-red-600',
            bgClass: 'bg-red-50',
            borderClass: 'border-red-200',
            iconColor: 'text-red-600',
        }
    }

    const style = getErrorStyle()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <div className="mb-8 w-full max-w-2xl text-center">
                    <h1
                        className={`mb-4 text-4xl font-bold ${style.colorClass}`}>
                        {title || 'エラーが発生しました'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {displayMessage || 'イベント情報の取得に失敗しました'}
                    </p>

                    {/* ステータス情報の表示 */}
                    {(status || code) && (
                        <div
                            className={`mt-6 rounded-lg border ${style.borderClass} ${style.bgClass} p-4`}>
                            <div className="flex items-center justify-center gap-4 text-sm">
                                {status && (
                                    <div>
                                        <span className="font-semibold">
                                            ステータス:
                                        </span>{' '}
                                        {status}
                                    </div>
                                )}
                                {code && (
                                    <div>
                                        <span className="font-semibold">
                                            コード:
                                        </span>{' '}
                                        {code}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={reset}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                        再試行
                    </button>
                    <Link
                        href="/calendar"
                        className="rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700">
                        カレンダーに戻る
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && error.digest && (
                    <div className="mt-8 rounded border border-gray-300 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">
                            Error Digest: {error.digest}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
