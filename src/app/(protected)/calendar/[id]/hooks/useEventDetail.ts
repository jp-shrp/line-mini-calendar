import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEventDetailQuery } from '@/src/app/(protected)/calendar/api/event-query'
import { useDeleteEventMutation } from '@/src/app/(protected)/calendar/api/event-mutation'
import { useModal } from '@/src/contexts/ModalContext'

/**
 * イベント詳細のビジネスロジックHook
 *
 * @description
 * イベント詳細表示、編集、削除のビジネスロジックを管理します
 * Hook+Viewパターンに従い、ビジネスロジックを分離
 *
 * @param eventId イベントID
 */
export const useEventDetail = (eventId: string) => {
    const router = useRouter()
    const { openModal, closeModal } = useModal()

    // イベント詳細取得Query
    const { data, isLoading, error } = useEventDetailQuery(eventId)

    // イベント削除Mutation
    const deleteMutation = useDeleteEventMutation(eventId)

    // 編集画面への遷移ハンドラー
    const handleEdit = useCallback(() => {
        router.push(`/calendar/${eventId}/edit`)
    }, [eventId, router])

    // 削除実行ハンドラー
    const handleDelete = useCallback(async () => {
        await deleteMutation.mutateAsync()
        closeModal()
        router.push('/calendar')
    }, [deleteMutation, closeModal, router])

    // 削除確認ダイアログを開く
    const handleOpenDeleteDialog = useCallback(() => {
        openModal({
            title: 'イベントを削除しますか？',
            content: 'この操作は取り消すことができません。',
            type: 'confirm',
            okText: '削除',
            closeText: 'キャンセル',
            onOk: handleDelete,
        })
    }, [openModal, handleDelete])

    // 戻るボタンハンドラー
    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    return {
        event: data?.event,
        isLoading,
        error,
        isDeleting: deleteMutation.isPending,
        handleEdit,
        handleOpenDeleteDialog,
        handleBack,
    }
}
