'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// import button from '@/components/Appbutton'
import FormField from '@/components/FormField'
import {
    getSuccessTest,
    getErrorTest,
    postSuccessTest,
    postErrorTest,
    postValidationTest,
    putSuccessTest,
    putErrorTest,
    putValidationTest,
    TestData,
} from '@/actions/TestAction'

// バリデーションスキーマ
const testFormSchema = z.object({
    name: z.string().min(2, { message: '名前は2文字以上で入力してください' }),
    email: z
        .string()
        .email({ message: '有効なメールアドレスを入力してください' }),
    age: z.number().min(0).max(150).optional(),
})

type TestFormData = z.infer<typeof testFormSchema>

export default function TestEndpointDemo() {
    const [getResult, setGetResult] = useState<any>(null)
    const [postResult, setPostResult] = useState<any>(null)
    const [putResult, setPutResult] = useState<any>(null)
    const [loading, setLoading] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<TestFormData>({
        resolver: zodResolver(testFormSchema),
        defaultValues: {
            name: '',
            email: '',
            age: undefined,
        },
    })

    // GETテスト
    const handleGetTest = async (type: 'success' | 'error') => {
        setLoading(`get-${type}`)
        try {
            const result =
                type === 'success'
                    ? await getSuccessTest()
                    : await getErrorTest()
            setGetResult({ type, result, timestamp: new Date().toISOString() })
        } catch (error) {
            setGetResult({
                type,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            })
        } finally {
            setLoading(null)
        }
    }

    // POSTテスト
    const handlePostTest = async (
        type: 'success' | 'error' | 'validation',
        data: TestData
    ) => {
        setLoading(`post-${type}`)
        clearErrors()
        try {
            let result
            switch (type) {
                case 'success':
                    result = await postSuccessTest(data)
                    break
                case 'error':
                    result = await postErrorTest(data)
                    break
                case 'validation':
                    result = await postValidationTest(data)
                    break
            }
            setPostResult({ type, result, timestamp: new Date().toISOString() })
        } catch (error: any) {
            // 422エラーの場合、フォームエラーとして設定
            if (error?.status === 422 && error?.validationErrors) {
                Object.entries(error.validationErrors).forEach(
                    ([field, messages]) => {
                        setError(field as keyof TestFormData, {
                            type: 'server',
                            message: Array.isArray(messages)
                                ? messages[0]
                                : (messages as string),
                        })
                    }
                )
                setPostResult({
                    type,
                    error: 'バリデーションエラーが発生しました（フォームに反映済み）',
                    timestamp: new Date().toISOString(),
                })
            } else {
                setPostResult({
                    type,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    timestamp: new Date().toISOString(),
                })
            }
        } finally {
            setLoading(null)
        }
    }

    // PUTテスト
    const handlePutTest = async (
        type: 'success' | 'error' | 'validation',
        data: TestData
    ) => {
        setLoading(`put-${type}`)
        clearErrors()
        try {
            const id = Math.floor(Math.random() * 100)
            let result
            switch (type) {
                case 'success':
                    result = await putSuccessTest(id, data)
                    break
                case 'error':
                    result = await putErrorTest(id, data)
                    break
                case 'validation':
                    result = await putValidationTest(id, data)
                    break
            }
            setPutResult({ type, result, timestamp: new Date().toISOString() })
        } catch (error: any) {
            // 422エラーの場合、フォームエラーとして設定
            if (error?.status === 422 && error?.validationErrors) {
                Object.entries(error.validationErrors).forEach(
                    ([field, messages]) => {
                        setError(field as keyof TestFormData, {
                            type: 'server',
                            message: Array.isArray(messages)
                                ? messages[0]
                                : (messages as string),
                        })
                    }
                )
                setPutResult({
                    type,
                    error: 'バリデーションエラーが発生しました（フォームに反映済み）',
                    timestamp: new Date().toISOString(),
                })
            } else {
                setPutResult({
                    type,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    timestamp: new Date().toISOString(),
                })
            }
        } finally {
            setLoading(null)
        }
    }

    const onSubmit = (data: TestFormData) => {
        // フォームデータは変換が必要
        const testData: TestData = {
            name: data.name,
            email: data.email,
            age: data.age,
        }
        // デフォルトでバリデーションテストを実行
        handlePostTest('validation', testData)
    }

    return (
        <div className="space-y-6">
            {/* GETテスト */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-lg font-semibold">
                    GETリクエストテスト
                </h3>
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => handleGetTest('success')}
                        disabled={loading === 'get-success'}
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400">
                        {loading === 'get-success'
                            ? '実行中...'
                            : '200系テスト'}
                    </button>
                    <button
                        onClick={() => handleGetTest('error')}
                        disabled={loading === 'get-error'}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400">
                        {loading === 'get-error' ? '実行中...' : '400系テスト'}
                    </button>
                </div>
                {getResult && (
                    <div className="rounded bg-gray-100 p-3">
                        <p className="text-sm font-medium">結果:</p>
                        <pre className="mt-2 text-xs">
                            {JSON.stringify(getResult, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* フォーム */}
            <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-lg font-semibold">
                    POST/PUTテスト用フォーム
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        label="名前"
                        id="name"
                        type="text"
                        register={register('name')}
                        error={errors.name}
                        placeholder="山田太郎"
                    />
                    <FormField
                        label="メールアドレス"
                        id="email"
                        type="email"
                        register={register('email')}
                        error={errors.email}
                        placeholder="test@example.com"
                    />
                    <FormField
                        label="年齢（任意）"
                        id="age"
                        type="number"
                        register={register('age', { valueAsNumber: true })}
                        error={errors.age}
                        placeholder="25"
                    />

                    {/* POSTテストボタン */}
                    <div className="space-y-2">
                        <p className="font-medium">POSTリクエストテスト:</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSubmit((data) =>
                                    handlePostTest('success', data)
                                )}
                                disabled={loading?.startsWith('post')}
                                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400">
                                {loading === 'post-success'
                                    ? '実行中...'
                                    : '200系'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit((data) =>
                                    handlePostTest('error', data)
                                )}
                                disabled={loading?.startsWith('post')}
                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400">
                                {loading === 'post-error'
                                    ? '実行中...'
                                    : '400系'}
                            </button>
                            <button
                                type="submit"
                                disabled={loading?.startsWith('post')}
                                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:bg-gray-400">
                                {loading === 'post-validation'
                                    ? '実行中...'
                                    : '422系（バリデーション）'}
                            </button>
                        </div>
                    </div>

                    {/* PUTテストボタン */}
                    <div className="space-y-2">
                        <p className="font-medium">PUTリクエストテスト:</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSubmit((data) =>
                                    handlePutTest('success', data)
                                )}
                                disabled={loading?.startsWith('put')}
                                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400">
                                {loading === 'put-success'
                                    ? '実行中...'
                                    : '200系'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit((data) =>
                                    handlePutTest('error', data)
                                )}
                                disabled={loading?.startsWith('put')}
                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400">
                                {loading === 'put-error'
                                    ? '実行中...'
                                    : '400系'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit((data) =>
                                    handlePutTest('validation', data)
                                )}
                                disabled={loading?.startsWith('put')}
                                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:bg-gray-400">
                                {loading === 'put-validation'
                                    ? '実行中...'
                                    : '422系（バリデーション）'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* POSTテスト結果 */}
            {postResult && (
                <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                        POSTテスト結果
                    </h3>
                    <div className="rounded bg-gray-100 p-3">
                        <pre className="text-xs">
                            {JSON.stringify(postResult, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* PUTテスト結果 */}
            {putResult && (
                <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                        PUTテスト結果
                    </h3>
                    <div className="rounded bg-gray-100 p-3">
                        <pre className="text-xs">
                            {JSON.stringify(putResult, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}
