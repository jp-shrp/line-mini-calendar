import type { FC } from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'

/**
 * イベントフォームフィールドのProps型
 */
interface EventFormFieldsProps {
    register: UseFormRegister<any>
    errors: FieldErrors
}

/**
 * システムデフォルトカテゴリ定義
 */
export const EVENT_CATEGORIES = [
    { value: 'premier_league', label: 'プレミアリーグ', color: '#E91E63' },
    { value: 'serie_a', label: 'セリエA', color: '#2196F3' },
    { value: 'la_liga', label: 'ラ・リーガ', color: '#FF9800' },
    { value: 'bundesliga', label: 'ブンデスリーガ', color: '#FFC107' },
    { value: 'wbc', label: 'WBC', color: '#4CAF50' },
    { value: 'netflix', label: 'Netflix', color: '#E50914' },
    { value: 'other', label: 'その他', color: '#9E9E9E' },
] as const

/**
 * イベントフォームフィールドの共通コンポーネント
 *
 * @description
 * イベント作成と編集で共通するフォームフィールドを提供します。
 * DRY原則に従い、重複コードを削減します。
 * スタイリングはTailwind CSSのみを使用し、インラインstyleは禁止です。
 */
export const EventFormFields: FC<EventFormFieldsProps> = ({
    register,
    errors,
}) => {
    return (
        <>
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
                        {errors.title.message as string}
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
                        {errors.description.message as string}
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
                    {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.category.message as string}
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
                        {errors.startDatetime.message as string}
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
                        {errors.endDatetime.message as string}
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
                        {errors.color.message as string}
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
                        {errors.iconUrl.message as string}
                    </p>
                )}
            </div>
        </>
    )
}
