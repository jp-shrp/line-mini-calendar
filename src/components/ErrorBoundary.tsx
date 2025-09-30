'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const errorStatus = (this.state.error as any)?.status

            // 400, 404, 422エラーの場合は専用のエラー表示
            if (errorStatus === 400) {
                return (
                    <div className="text-center">
                        <div className="mb-4 text-lg text-red-600">
                            無効なリクエストです
                        </div>
                        <div className="text-gray-600">
                            指定されたIDが無効です
                        </div>
                    </div>
                )
            }

            if (errorStatus === 404) {
                return (
                    <div className="text-center">
                        <div className="mb-4 text-lg text-red-600">
                            アイテムが見つかりません
                        </div>
                        <div className="text-gray-600">
                            指定されたアイテムは存在しません
                        </div>
                    </div>
                )
            }

            if (errorStatus === 422) {
                return (
                    <div className="text-center">
                        <div className="mb-4 text-lg text-red-600">
                            入力エラーです
                        </div>
                        <div className="text-gray-600">
                            入力内容を確認してください
                        </div>
                    </div>
                )
            }

            // その他のエラー
            return (
                <div className="text-center">
                    <div className="mb-4 text-lg text-red-600">
                        エラーが発生しました
                    </div>
                    <div className="text-gray-600">
                        {this.state.error?.message ||
                            '予期しないエラーが発生しました'}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
