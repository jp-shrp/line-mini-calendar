import type { FC } from 'react'
import type { useEventEdit } from '../hooks/useEventEdit'
import { EventFormFields } from '../../../components/EventFormFields'

type MainViewProps = ReturnType<typeof useEventEdit>

/**
 * イベント編集フォームのメインビューコンポーネント
 *
 * @description
 * Hook+Viewパターンに従い、useEventEditの返り値を受け取って表示します。
 * スタイリングはTailwind CSSのみを使用し、インラインstyleは禁止です。
 * Early returnパターンを使用（三項演算子禁止）
 */
const MainView: FC<MainViewProps> = ({
    form,
    event,
    isLoadingEvent,
    isSubmitting,
    handleSubmit,
    handleCancel,
}) => {
    const {
        register,
        formState: { errors },
    } = form

    if (isLoadingEvent) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">読み込み中...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">イベントが見つかりません</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">
                    イベントを編集
                </h1>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <EventFormFields register={register} errors={errors} />

                        {/* ボタン */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {isSubmitting ? '更新中...' : 'イベントを更新'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                                キャンセル
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default MainView
