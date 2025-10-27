import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Liff } from '@line/liff'
import { initializeLiff } from '@/src/lib/liff-client'
import { useLineRegisterSessionQuery } from '../api/line-register-query'
import { useLineBatchRegisterMutation } from '../api/line-register-mutation'

/**
 * LINE登録画面のビジネスロジックHook
 * @description
 * LIFF SDKの初期化、セッション取得、イベント登録を管理します
 */
export const useLineRegister = () => {
    const searchParams = useSearchParams()
    const sessionId = searchParams?.get('sessionId')
    const mode = (searchParams?.get('mode') as 'all' | 'select') || 'all'

    const [liff, setLiff] = useState<Liff | null>(null)
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])

    // セッション取得Query
    const {
        data: sessionData,
        isLoading,
        error: sessionError,
    } = useLineRegisterSessionQuery(sessionId)

    // 一括登録Mutation
    const batchRegisterMutation = useLineBatchRegisterMutation()

    // LIFF初期化
    useEffect(() => {
        const initialize = async () => {
            try {
                const liffInstance = await initializeLiff()
                setLiff(liffInstance)
            } catch (_err) {
                // LIFF初期化エラーは無視（モック環境でも動作するように）
            }
        }

        initialize()
    }, [])

    // mode=allの場合は全て選択
    useEffect(() => {
        if (sessionData?.candidates && mode === 'all') {
            setSelectedIndexes(sessionData.candidates.map((_, index) => index))
        }
    }, [sessionData?.candidates, mode])

    // チェックボックストグル
    const handleToggleCandidate = useCallback((index: number) => {
        setSelectedIndexes((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index)
            }
            return [...prev, index]
        })
    }, [])

    // 全選択/全解除
    const handleToggleAll = useCallback(() => {
        if (!sessionData?.candidates) return

        if (selectedIndexes.length === sessionData.candidates.length) {
            setSelectedIndexes([])
        } else {
            setSelectedIndexes(sessionData.candidates.map((_, index) => index))
        }
    }, [selectedIndexes.length, sessionData?.candidates])

    // イベント一括登録
    const handleRegister = useCallback(async () => {
        if (selectedIndexes.length === 0 || !sessionData?.candidates) {
            return
        }

        try {
            await batchRegisterMutation.mutateAsync({
                candidateIndexes: selectedIndexes,
                candidates: sessionData.candidates,
            })

            // LIFFを閉じる
            if (liff) {
                liff.closeWindow()
            }
        } catch (_err) {
            // エラーはuseSupabaseMutationで自動処理される
        }
    }, [selectedIndexes, sessionData?.candidates, batchRegisterMutation, liff])

    return {
        mode,
        isLoading,
        error: sessionError ? 'セッション情報の取得に失敗しました' : null,
        aiMessage: sessionData?.aiMessage || '',
        candidates: sessionData?.candidates || [],
        selectedIndexes,
        isRegistering: batchRegisterMutation.isPending,
        handleToggleCandidate,
        handleToggleAll,
        handleRegister,
    }
}
