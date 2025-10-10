import type { FC } from 'react'
import type { useEventForm } from '../hooks/useEventForm'
import { EventFormFields } from '../../components/EventFormFields'

/**
 * イベントフォームのメインビューコンポーネント
 * @description
 * Hook+Viewパターンに従い、useEventFormの返り値を受け取って表示します。
 * スタイリングはTailwind CSSのみを使用し、インラインstyleは禁止です。
 */
export const MainView: FC<ReturnType<typeof useEventForm>> = ({
    form,
    isSubmitting,
    handleSubmit,
    handleCancel,
}) => {
    const {
        register,
        formState: { errors },
    } = form

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <EventFormFields register={register} errors={errors} />

            {/* ボタン */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSubmitting ? '作成中...' : 'イベントを作成'}
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
    )
}
