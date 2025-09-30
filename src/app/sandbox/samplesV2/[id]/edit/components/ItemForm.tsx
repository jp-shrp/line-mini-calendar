'use client'

import FormCheckbox from '@/components/FormCheckbox'
import FormField from '@/components/FormField'
import FormTextArea from '@/components/FormTextArea'
import { useOnLoading } from '@/contexts/OnLoadingContext'
import {
    CreateItemFormSchema,
    ICreateItemForm,
    IItemResponse,
    Item,
    IUpdateItemForm,
    UpdateItemFormSchema,
} from '@/models/samples/Item'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import {
    useCreateItemMutation,
    useUpdateItemMutation,
} from '../../../api/samples-query'

type ItemFormData = ICreateItemForm | IUpdateItemForm

interface ItemFormProps {
    mode: 'create' | 'edit'
    initialData?: IItemResponse | null
}

const useItemForm = ({ mode, initialData }: ItemFormProps) => {
    const router = useRouter()
    const { onLoad } = useOnLoading()

    const item = new Item(initialData ?? {})

    const getDefaultValues = (): ICreateItemForm | IUpdateItemForm => {
        if (mode === 'edit' && initialData) {
            return {
                ...item.getPostable(),
            } as IUpdateItemForm
        }
        return {
            ...item.getPostable(),
        } as ICreateItemForm
    }

    const form = useForm<ItemFormData>({
        resolver: zodResolver(
            mode === 'create' ? CreateItemFormSchema : UpdateItemFormSchema
        ),
        defaultValues: getDefaultValues(),
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form

    // onSuccessコールバックを設定
    const handleSuccess = () => {
        if (mode === 'create') {
            router.push('/sandbox/samplesV2')
        } else {
            router.push(`/sandbox/samplesV2/${initialData?.id}`)
        }
    }

    // 早期リターンパターンでMutation Hookを選択
    const itemMutation =
        mode === 'create'
            ? useCreateItemMutation(form, { onSuccess: handleSuccess })
            : useUpdateItemMutation(form, { onSuccess: handleSuccess })

    const onSubmit = async (data: ItemFormData) => {
        if (mode === 'edit' && !initialData?.id) {
            return
        }

        await onLoad(async () => {
            if (mode === 'create') {
                return await itemMutation.mutateAsync(data)
            } else {
                const submitData = { id: initialData!.id, ...data }
                return await itemMutation.mutateAsync(submitData)
            }
        })
    }

    const handleCancel = () => {
        if (mode === 'edit' && initialData?.id) {
            router.push(`/sandbox/samplesV2/${initialData.id}`)
        } else {
            router.push('/sandbox/samplesV2')
        }
    }

    const getButtonText = (): string => {
        if (isSubmitting) return '保存中...'
        if (mode === 'create') return '作成'
        return '更新'
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

const MainView: FC<ReturnType<typeof useItemForm>> = ({
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
                        className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:bg-indigo-300">
                        {getButtonText()}
                    </button>
                </div>
            </form>
        </div>
    )
}

export const ItemForm = ({ mode, initialData }: ItemFormProps) => {
    const hookItems = useItemForm({ mode, initialData })
    return <MainView {...hookItems} />
}
