'use client'

import { createItem, updateItem } from '@/actions/ItemAction'
import { useOnLoading } from '@/contexts/OnLoadingContext'
import { useApiMutation } from '@/lib/universal-api-client'
import { CreateItemSchema, IItemResponse } from '@/models/samples/Item'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// フォーム用のスキーマ（isAvailableをrequiredとして扱う）
const ItemFormSchema = CreateItemSchema.extend({
    isAvailable: z.boolean(),
})

type ItemFormData = z.infer<typeof ItemFormSchema>

interface ItemFormProps {
    mode: 'create' | 'edit'
    initialData?: IItemResponse | null
}

export const ItemForm = ({ mode, initialData }: ItemFormProps) => {
    const router = useRouter()
    const { onLoad } = useOnLoading()

    const form = useForm<ItemFormData>({
        resolver: zodResolver(ItemFormSchema),
        defaultValues:
            mode === 'edit' && initialData
                ? {
                      name: initialData.name,
                      description: initialData.description || '',
                      price: initialData.price,
                      category: initialData.category,
                      imagePath: initialData.image_path || '',
                      stock: initialData.stock,
                      isAvailable: initialData.is_available,
                  }
                : {
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      imagePath: '',
                      stock: 0,
                      isAvailable: true,
                  },
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form

    // useApiMutationでaction指定を使用
    const itemMutation = useApiMutation(form, {
        action: async (data: ItemFormData & { id?: number }) => {
            if (mode === 'create') {
                return await createItem(data)
            } else {
                return await updateItem(data as any)
            }
        },
        onSuccess: (data) => {
            console.log(
                `アイテム${mode === 'create' ? '作成' : '更新'}成功:`,
                data
            )
            if (mode === 'create') {
                router.push('/sandbox/samples/items')
            } else {
                router.push(`/sandbox/samples/items/${initialData?.id}`)
            }
        },
        onError: (error) => {
            console.log('API エラー詳細:', error)
        },
    })

    const onSubmit = async (data: ItemFormData) => {
        if (mode === 'edit' && !initialData?.id) {
            console.error('編集モードではIDが必要です')
            return
        }

        // PUTの場合はIDを含める
        const submitData =
            mode === 'edit' ? { id: initialData!.id, ...data } : data

        await onLoad(async () => {
            return await itemMutation.mutateAsync(submitData)
        })
    }

    const handleCancel = () => {
        if (mode === 'edit' && initialData?.id) {
            router.push(`/sandbox/samples/items/${initialData.id}`)
        } else {
            router.push('/sandbox/samples/items')
        }
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="mb-6 text-2xl font-bold">
                {mode === 'create' ? 'アイテムを作成' : 'アイテムを編集'}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700">
                        商品名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700">
                        説明
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700">
                        価格 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="price"
                        type="number"
                        min="0"
                        {...register('price', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.price.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700">
                        カテゴリ <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category"
                        type="text"
                        {...register('category')}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="imagePath"
                        className="block text-sm font-medium text-gray-700">
                        画像パス
                    </label>
                    <input
                        id="imagePath"
                        type="text"
                        {...register('imagePath')}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.imagePath && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.imagePath.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-gray-700">
                        在庫数 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="stock"
                        type="number"
                        min="0"
                        {...register('stock', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.stock && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.stock.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('isAvailable')}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            販売可能
                        </span>
                    </label>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || itemMutation.isPending}
                        className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50">
                        {itemMutation.isPending
                            ? '処理中...'
                            : mode === 'create'
                              ? '作成'
                              : '更新'}
                    </button>
                </div>

                {/* API エラー表示 */}
                {itemMutation.error && (
                    <div className="rounded border border-red-300 bg-red-50 p-4">
                        <h3 className="font-semibold text-red-800">
                            API エラー
                        </h3>
                        <p className="text-sm text-red-700">
                            ステータス: {itemMutation.error.status}
                        </p>
                        <p className="text-sm text-red-700">
                            メッセージ: {itemMutation.error.message}
                        </p>
                        {itemMutation.error.status === 422 && (
                            <div className="mt-2">
                                <p className="text-xs text-red-600">
                                    422エラー:
                                    上記のフォームフィールドにサーバーバリデーションエラーが表示されています
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* 成功メッセージ */}
                {itemMutation.isSuccess && (
                    <div className="rounded border border-green-300 bg-green-50 p-4">
                        <p className="text-green-800">
                            アイテムが正常に
                            {mode === 'create' ? '作成' : '更新'}されました！
                        </p>
                    </div>
                )}
            </form>
        </div>
    )
}
