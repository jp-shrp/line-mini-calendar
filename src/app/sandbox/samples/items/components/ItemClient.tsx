'use client'

import { useModal } from '@/contexts/ModalContext'
import { useOnLoading } from '@/contexts/OnLoadingContext'
import { apiClient, sleep } from '@/lib/universal-api-client'
import BaseButton from '@/components/BaseButton'

const useHook = () => {
    const { onLoad, isLoading } = useOnLoading()
    const { openModal, closeModal } = useModal()

    const test404 = async () => {
        const result = await onLoad(
            async () => {
                await sleep(2000)
                return await apiClient.get('/api/items/100', {
                    customErrorMessage: '404エラーです。',
                })
            },
            { throw: true }
        )
        console.log(result)
    }

    const testOpenModal = () => {
        openModal({
            title: 'TEST Modal',
            content: 'TEST Content',
        })
    }

    const testConfirmModal = () => {
        openModal({
            title: 'TEST Confirm',
            content: 'TEST Confirm Content',
            type: 'confirm',
            okText: 'OK',
            onOk: async () => {
                closeModal()
                await onLoad(async () => {
                    await sleep(1000)
                })
                openModal({ title: 'OK' })
            },
        })
    }

    return { isLoading, test404, testOpenModal, testConfirmModal }
}

const MainView: React.FC<ReturnType<typeof useHook>> = ({
    isLoading,
    test404,
    testOpenModal,
    testConfirmModal,
}) => {
    return (
        <div className="space-y-4">
            <div className="text-lg font-medium">
                {isLoading ? 'Loading..' : 'OK'}
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-medium text-gray-700">
                    モーダルテスト用ボタン
                </h3>

                <div className="grid max-w-sm gap-3">
                    <BaseButton
                        label="404エラーテスト"
                        onClick={test404}
                        variant="secondary"
                        className="text-sm"
                    />

                    <BaseButton
                        label="デフォルトモーダルテスト"
                        onClick={testOpenModal}
                        variant="primary"
                        className="text-sm"
                    />

                    <BaseButton
                        label="確認モーダルテスト"
                        onClick={testConfirmModal}
                        variant="outline"
                        className="text-sm"
                    />
                </div>
            </div>
        </div>
    )
}

export const ItemClient = () => {
    const hookItems = useHook()
    return <MainView {...hookItems} />
}
