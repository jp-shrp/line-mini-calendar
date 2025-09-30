'use client'

import { useModal } from '@/contexts/ModalContext'
import { useOnLoading } from '@/contexts/OnLoadingContext'
import { ReactNode, useEffect } from 'react'

interface QueryStateHandlerProps<T> {
    /** クエリデータ */
    data?: T
    /** ローディング状態 */
    isLoading: boolean
    /** エラー */
    error?: Error | null
    /** 新規作成モードかどうか */
    isNewMode?: boolean
    /** ローディング時のUIカスタマイズ */
    loadingComponent?: ReactNode
    /** エラー時のUIカスタマイズ（エラーをthrowせずに表示したい場合） */
    errorComponent?: ReactNode
    /** データが見つからない時のUIカスタマイズ */
    notFoundComponent?: ReactNode
    /** 成功時に表示するコンテンツ */
    children: (data?: T) => ReactNode
    /** useOnLoadingとの連携設定 */
    useGlobalLoading?: boolean
    /** ローディング時に表示するメッセージ */
    loadingMessage?: string
    /** データ未取得時に表示するメッセージ */
    notFoundMessage?: string
    /** エラーをthrowしない（errorComponentを使用する）場合 */
    suppressErrorThrow?: boolean
}

export function QueryStateHandler<T>({
    data,
    isLoading,
    error,
    isNewMode = false,
    loadingComponent,
    errorComponent,
    notFoundComponent,
    children,
    useGlobalLoading = false,
    loadingMessage,
    notFoundMessage = 'データが見つかりません',
    suppressErrorThrow = false,
}: QueryStateHandlerProps<T>) {
    const { setLoading } = useOnLoading()
    const { openModal } = useModal()

    // useOnLoadingとの連携
    useEffect(() => {
        if (useGlobalLoading) {
            setLoading(isLoading)
        }
    }, [isLoading, useGlobalLoading, setLoading])

    // エラー処理のためのuseEffect
    useEffect(() => {
        if (error && !suppressErrorThrow) {
            setLoading(false)

            // 400, 422, 404エラーの場合はthrowして上位で処理
            const errorStatus = (error as any)?.status
            if (
                errorStatus === 422 ||
                errorStatus === 404 ||
                error.message.includes('422') ||
                error.message.includes('404')
            ) {
                throw error
            }

            // その他のエラーはモーダルで表示
            openModal({
                title: 'エラーが発生しました',
                content: error.message || '予期しないエラーが発生しました',
                type: 'error',
            })
        }
    }, [error, suppressErrorThrow])

    // 新規作成モードの場合はローディングや見つからない状態をスキップ
    if (isNewMode) {
        return <>{children(undefined)}</>
    }

    // ローディング状態
    if (isLoading) {
        if (loadingComponent) {
            return <>{loadingComponent}</>
        }

        // loadingMessageが指定されている場合は文字列表示、未指定の場合はローディングインジケーター
        if (loadingMessage) {
            return (
                <div className="flex min-h-[200px] items-center justify-center">
                    <div className="text-lg">{loadingMessage}</div>
                </div>
            )
        }

        // デフォルトはuseOnLoadingと同じスタイルのローディングインジケーター
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    // エラー状態（suppressErrorThrowがtrueの場合のみカスタムUIを表示）
    if (error && suppressErrorThrow) {
        if (errorComponent) {
            return <>{errorComponent}</>
        }
        return (
            <div className="text-center">
                <div className="mb-4 text-lg text-red-600">
                    エラーが発生しました
                </div>
                <div className="text-gray-600">
                    {error.message || '読み込みに失敗しました'}
                </div>
            </div>
        )
    }

    // エラーがあるがsuppressErrorThrowがfalseの場合はここには到達しない（useEffectでthrowまたはモーダル表示）

    // データが見つからない状態
    if (!data) {
        if (notFoundComponent) {
            return <>{notFoundComponent}</>
        }
        return (
            <div className="text-center">
                <div className="text-lg text-gray-600">{notFoundMessage}</div>
            </div>
        )
    }

    // 正常状態
    return <>{children(data)}</>
}
