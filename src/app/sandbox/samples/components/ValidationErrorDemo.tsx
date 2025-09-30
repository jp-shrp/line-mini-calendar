'use client'

import { setApiClientConfig, useApiMutation } from '@/lib/universal-api-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// バリデーションスキーマ定義
const userSchema = z
    .object({
        name: z
            .string()
            .min(1, 'お名前は必須です')
            .min(2, 'お名前は2文字以上で入力してください')
            .max(50, 'お名前は50文字以内で入力してください'),
        email: z
            .string()
            .min(1, 'メールアドレスは必須です')
            .email('正しいメールアドレスの形式で入力してください'),
        age: z
            .number({
                message: '年齢は数値で入力してください',
            })
            .min(0, '年齢は0以上で入力してください')
            .max(120, '年齢は120以下で入力してください'),
        password: z
            .string()
            .min(1, 'パスワードは必須です')
            .min(8, 'パスワードは8文字以上で入力してください')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'パスワードは大文字、小文字、数字をそれぞれ1文字以上含む必要があります'
            ),
        confirmPassword: z.string().min(1, 'パスワード確認は必須です'),
        terms: z.boolean().refine((val) => val === true, {
            message: '利用規約に同意してください',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'パスワードが一致しません',
        path: ['confirmPassword'],
    })

type UserFormData = z.infer<typeof userSchema>

// レスポンス型定義
type UserResponse = {
    id: number
    name: string
    email: string
    age: number
    createdAt: string
}

export default function ValidationErrorDemo() {
    // APIのbase URLを設定
    setApiClientConfig({
        baseUrl: 'http://localhost:3001',
    })

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: 'onChange',
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form

    // 新しいform連携版useApiMutation
    const createUserMutation = useApiMutation<UserResponse>(form, {
        method: 'POST',
        url: '/api/users/validation-test',
        onSuccess: (data) => {
            console.log('ユーザー作成成功:', data)
        },
        onError: (error) => {
            console.log('API エラー詳細:', error)
            console.log('422エラーは自動的にformに反映されます')
        },
    })

    const onSubmit = (data: UserFormData) => {
        createUserMutation.mutate(data)
    }

    // 意図的に422エラーを発生させるサンプルデータ
    const triggerValidationError = () => {
        console.log('422エラーテストを実行中...')

        // 既存のメールアドレスを使用してエラーを発生させる
        createUserMutation.mutate({
            name: 'Test User',
            email: 'existing@example.com', // 既存のメールアドレス
            age: 25,
            password: 'Password123',
            confirmPassword: 'Password123',
            terms: true,
        })
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h2 className="mb-4 text-xl font-semibold text-orange-800">
                    422バリデーションエラーのデモ
                </h2>
                <p className="mb-4 text-sm text-orange-700">
                    新しいform連携版useApiMutationを使用したデモです。
                    422エラーが自動的にformフィールドに反映されます。 base
                    URLも外部設定可能になりました。
                </p>

                {/* 意図的にエラーを発生させるボタン */}
                <button
                    onClick={triggerValidationError}
                    className="mb-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    disabled={createUserMutation.isPending}>
                    422エラーをテスト (既存メールアドレス使用)
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* 名前 */}
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium">
                        お名前 *
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className={`w-full rounded border p-2 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="山田太郎"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* メールアドレス */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium">
                        メールアドレス *
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full rounded border p-2 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="example@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* 年齢 */}
                <div>
                    <label
                        htmlFor="age"
                        className="mb-1 block text-sm font-medium">
                        年齢 *
                    </label>
                    <input
                        {...register('age', { valueAsNumber: true })}
                        type="number"
                        id="age"
                        className={`w-full rounded border p-2 ${
                            errors.age ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="25"
                        min="0"
                        max="120"
                    />
                    {errors.age && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.age.message}
                        </p>
                    )}
                </div>

                {/* パスワード */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium">
                        パスワード *
                    </label>
                    <input
                        {...register('password')}
                        type="password"
                        id="password"
                        className={`w-full rounded border p-2 ${
                            errors.password
                                ? 'border-red-500'
                                : 'border-gray-300'
                        }`}
                        placeholder="Password123"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        大文字、小文字、数字をそれぞれ1文字以上、8文字以上で入力してください
                    </p>
                </div>

                {/* パスワード確認 */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="mb-1 block text-sm font-medium">
                        パスワード確認 *
                    </label>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        id="confirmPassword"
                        className={`w-full rounded border p-2 ${
                            errors.confirmPassword
                                ? 'border-red-500'
                                : 'border-gray-300'
                        }`}
                        placeholder="Password123"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* 利用規約 */}
                <div>
                    <label className="flex items-center space-x-2">
                        <input
                            {...register('terms')}
                            type="checkbox"
                            className={`h-4 w-4 ${
                                errors.terms
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                        />
                        <span className="text-sm">利用規約に同意します *</span>
                    </label>
                    {errors.terms && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.terms.message}
                        </p>
                    )}
                </div>

                {/* 送信ボタン */}
                <button
                    type="submit"
                    disabled={isSubmitting || createUserMutation.isPending}
                    className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50">
                    {createUserMutation.isPending
                        ? '送信中...'
                        : 'ユーザー登録'}
                </button>

                {/* API エラー表示 */}
                {createUserMutation.error && (
                    <div className="rounded border border-red-300 bg-red-50 p-4">
                        <h3 className="font-semibold text-red-800">
                            API エラー
                        </h3>
                        <p className="text-sm text-red-700">
                            ステータス: {createUserMutation.error.status}
                        </p>
                        <p className="text-sm text-red-700">
                            メッセージ: {createUserMutation.error.message}
                        </p>
                        {createUserMutation.error.status === 422 && (
                            <div className="mt-2">
                                <p className="text-xs text-red-600">
                                    422エラー:
                                    上記のフォームフィールドにサーバーバリデーションエラーが表示されています
                                </p>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs text-red-500">
                                        エラー詳細（デバッグ用）
                                    </summary>
                                    <pre className="mt-1 overflow-auto text-xs text-red-500">
                                        {JSON.stringify(
                                            createUserMutation.error,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </div>
                )}

                {/* 成功メッセージ */}
                {createUserMutation.isSuccess && (
                    <div className="rounded border border-green-300 bg-green-50 p-4">
                        <p className="text-green-800">
                            ユーザーが正常に作成されました！
                        </p>
                    </div>
                )}
            </form>

            {/* 新機能説明 */}
            <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">新しいuseApiMutation機能</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                        •
                        formオブジェクトを渡すことで422エラーが自動的にformにセット
                    </li>
                    <li>• FormDataの型がformから自動推論される</li>
                    <li>• base URLを外部設定可能（setApiClientConfig）</li>
                    <li>• 相対URLでAPI呼び出し可能</li>
                    <li>• Laravel標準の422バリデーションエラー形式に対応</li>
                </ul>
                <div className="mt-3 rounded bg-blue-50 p-3">
                    <h4 className="mb-1 text-sm font-medium text-blue-800">
                        使用例
                    </h4>
                    <pre className="text-xs text-blue-700">
                        {`const form = useForm<UserFormData>({
  resolver: zodResolver(userSchema)
})

const mutation = useApiMutation<UserResponse>(form, {
  method: 'POST',
  url: '/api/users/validation-test'
})

const onSubmit = (data) => {
  mutation.mutate(data) // 422エラーは自動でformに反映
}`}
                    </pre>
                </div>
                <div className="mt-3 rounded bg-orange-50 p-3">
                    <h4 className="mb-1 text-sm font-medium text-orange-800">
                        Laravel標準の422レスポンス例
                    </h4>
                    <pre className="text-xs text-orange-700">
                        {`{
  "message": "このメールアドレスは既に使用されています (and 2 more errors)",
  "errors": {
    "email": ["このメールアドレスは既に使用されています"],
    "name": ["お名前は2文字以上で入力してください（サーバー）"],
    "age": ["年齢は0-120の範囲で入力してください（サーバー）"]
  }
}`}
                    </pre>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    ※ Mock
                    serverの422エラーをテストするには、「422エラーをテスト」ボタンを使用してください
                </p>
            </div>
        </div>
    )
}
