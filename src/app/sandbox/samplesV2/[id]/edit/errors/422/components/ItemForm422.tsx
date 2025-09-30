'use client'

import FormCheckbox from '@/components/FormCheckbox'
import FormField from '@/components/FormField'
import FormTextArea from '@/components/FormTextArea'
import { useOnLoading } from '@/contexts/OnLoadingContext'
import { apiClient, useApiMutation } from '@/lib/universal-api-client'
import {
    IItemResponse,
    Item,
    IUpdateItemForm,
    UpdateItemFormSchema,
} from '@/models/samples/Item'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { useForm } from 'react-hook-form'

type ItemEditFormData = IUpdateItemForm

interface ItemForm422Props {
    initialData: IItemResponse
}

const useItemForm422 = ({ initialData }: ItemForm422Props) => {
    const router = useRouter()
    const { onLoad } = useOnLoading()

    const item = new Item(initialData)

    const form = useForm<ItemEditFormData>({
        resolver: zodResolver(UpdateItemFormSchema),
        defaultValues: {
            ...item.getPostable(),
        } as IUpdateItemForm,
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form

    const updateWithValidationError = async (
        formData: ItemEditFormData
    ): Promise<any> => {
        const invalidUpdateData = {
            name: '',
            description: formData.description,
            price: -1,
            category: '',
            imagePath: formData.imagePath,
            stock: -1,
            isAvailable: formData.isAvailable,
        }

        return await apiClient.put<IItemResponse>(
            `/api/items/${initialData.id}`,
            invalidUpdateData,
            {
                fallbackData: null,
                customErrorMessage: 'アイテムの更新に失敗しました',
            }
        )
    }

    const editMutation = useApiMutation(form, {
        action: async (formData: ItemEditFormData) => {
            return await updateWithValidationError(formData)
        },
        onSuccess: (_data) => {
            // 成功処理はuseApiMutationで処理済み
        },
        onError: (_error) => {
            // 422バリデーションエラーの場合、useApiMutationが自動的にformのsetErrorを呼び出す
        },
    })

    const onSubmit = async (data: ItemEditFormData) => {
        await onLoad(async () => {
            return await editMutation.mutateAsync(data)
        })
    }

    const handleCancel = () => {
        router.push(`/sandbox/samplesV2/${initialData.id}`)
    }

    const getButtonText = (): string => {
        if (isSubmitting) return '更新中（422エラーテスト）...'
        return '更新（422エラーテスト）'
    }

    return {
        register,
        handleSubmit,
        errors,
        isSubmitting,
        onSubmit,
        handleCancel,
        getButtonText,
    }
}

const MainView: FC<ReturnType<typeof useItemForm422>> = ({
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    handleCancel,
    getButtonText,
}) => {
    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h3 className="text-lg font-semibold text-orange-800">
                    422 バリデーションエラーテスト
                </h3>
                <p className="mt-2 text-sm text-orange-600">
                    このフォームを送信すると、サーバー側でバリデーションエラーが発生し、
                    422エラーレスポンスが返されます。フォームの下部にエラーメッセージが表示されることを確認してください。
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    label="商品名"
                    id="name"
                    register={register('name')}
                    error={errors.name}
                    placeholder="商品名を入力"
                />

                <FormTextArea
                    label="説明"
                    id="description"
                    register={register('description')}
                    error={errors.description}
                    placeholder="商品の説明を入力"
                    rows={3}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        label="価格（円）"
                        id="price"
                        type="number"
                        register={register('price', { valueAsNumber: true })}
                        error={errors.price}
                        placeholder="0"
                    />

                    <FormField
                        label="在庫数"
                        id="stock"
                        type="number"
                        register={register('stock', { valueAsNumber: true })}
                        error={errors.stock}
                        placeholder="0"
                    />
                </div>

                <FormField
                    label="カテゴリ"
                    id="category"
                    register={register('category')}
                    error={errors.category}
                    placeholder="カテゴリを入力"
                />

                <FormField
                    label="画像URL"
                    id="imagePath"
                    type="url"
                    register={register('imagePath')}
                    error={errors.imagePath}
                    placeholder="https://example.com/image.jpg"
                />

                <FormCheckbox
                    label="販売可能"
                    id="isAvailable"
                    register={register('isAvailable')}
                />

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none disabled:bg-orange-300">
                        {getButtonText()}
                    </button>
                </div>
            </form>
        </div>
    )
}

export const ItemForm422 = ({ initialData }: ItemForm422Props) => {
    const hookItems = useItemForm422({ initialData })
    return <MainView {...hookItems} />
}
