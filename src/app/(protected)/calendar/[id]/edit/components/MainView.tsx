import type { FC } from 'react'
import type { useEventEdit } from '../hooks/useEventEdit'

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

    // システムデフォルトカテゴリ一覧
    const categories = [
        { value: 'premier_league', label: 'プレミアリーグ', color: '#E91E63' },
        { value: 'serie_a', label: 'セリエA', color: '#2196F3' },
        { value: 'la_liga', label: 'ラ・リーガ', color: '#FF9800' },
        { value: 'bundesliga', label: 'ブンデスリーガ', color: '#FFC107' },
        { value: 'wbc', label: 'WBC', color: '#4CAF50' },
        { value: 'netflix', label: 'Netflix', color: '#E50914' },
        { value: 'other', label: 'その他', color: '#9E9E9E' },
    ]

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
                        {/* イベント名 */}
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700">
                                イベント名
                                <span className="ml-1 text-red-600">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                {...register('title')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="例: トッテナム vs アーセナル"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        {/* 説明 */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700">
                                説明
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                {...register('description')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="イベントの詳細を入力してください"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* カテゴリ */}
                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700">
                                カテゴリ
                                <span className="ml-1 text-red-600">*</span>
                            </label>
                            <select
                                id="category"
                                {...register('category')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                                <option value="">カテゴリを選択</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>

                        {/* 開始日時 */}
                        <div>
                            <label
                                htmlFor="startDatetime"
                                className="block text-sm font-medium text-gray-700">
                                開始日時
                                <span className="ml-1 text-red-600">*</span>
                            </label>
                            <input
                                id="startDatetime"
                                type="datetime-local"
                                {...register('startDatetime')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            {errors.startDatetime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.startDatetime.message}
                                </p>
                            )}
                        </div>

                        {/* 終了日時 */}
                        <div>
                            <label
                                htmlFor="endDatetime"
                                className="block text-sm font-medium text-gray-700">
                                終了日時
                                <span className="ml-1 text-red-600">*</span>
                            </label>
                            <input
                                id="endDatetime"
                                type="datetime-local"
                                {...register('endDatetime')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            {errors.endDatetime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.endDatetime.message}
                                </p>
                            )}
                        </div>

                        {/* カラー（オプション） */}
                        <div>
                            <label
                                htmlFor="color"
                                className="block text-sm font-medium text-gray-700">
                                カラー（オプション）
                            </label>
                            <input
                                id="color"
                                type="color"
                                {...register('color')}
                                className="mt-1 block h-10 w-20 cursor-pointer rounded-md border border-gray-300"
                            />
                            {errors.color && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.color.message}
                                </p>
                            )}
                        </div>

                        {/* アイコンURL（オプション） */}
                        <div>
                            <label
                                htmlFor="iconUrl"
                                className="block text-sm font-medium text-gray-700">
                                アイコンURL（オプション）
                            </label>
                            <input
                                id="iconUrl"
                                type="url"
                                {...register('iconUrl')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://example.com/icon.png"
                            />
                            {errors.iconUrl && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.iconUrl.message}
                                </p>
                            )}
                        </div>

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
