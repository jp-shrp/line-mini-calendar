'use client'
import { useForm } from 'react-hook-form'
import { useLoading } from '@/contexts/LoadingContext'
import FormField from '@/components/FormField'
import {
    UserFormData,
    updateUser,
    getProfileEditData,
} from '@/actions/userAction'
import SelectField from '@/components/SelectField'
import { useEffect, useState } from 'react'
import { fetchAddressByZipcode } from '@/lib/address'
import { validationRules } from '@/app/utils/validationRules'

export default function Edit() {
    const { setLoading } = useLoading()
    const [isSuccess, setIsSuccess] = useState(false)
    const [genderOptions, setGenderOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [occupationOptions, setOccupationOptions] = useState<
        { label: string; value: string }[]
    >([])

    const form = useForm<UserFormData>({
        defaultValues: {
            family_name: '',
            first_name: '',
            family_name_kana: '',
            first_name_kana: '',
            company_name: '',
            post_code: '',
            pref: '',
            city: '',
            town: '',
            building: '',
            tel: '',
            fax: '',
            email: '',
            email_confirmation: '',
            password: '',
            password_confirmation: '',
            gender: '',
            year: '',
            month: '',
            day: '',
            occupation: '',
            birthday: '',
        },
    })

    useEffect(() => {
        const fetch = async () => {
            await getProfileEditData({
                setGlobalLoading: setLoading,
                onSuccess: (data) => {
                    const user = data.user
                    form.reset({ ...user })
                    form.setValue('email_confirmation', user.email)
                    if (user.birthday) {
                        const [year, month, day] = user.birthday.split('-')
                        form.setValue('year', year)
                        form.setValue('month', String(Number(month)))
                        form.setValue('day', String(Number(day)))
                    }
                    setGenderOptions(data.gender_options)
                    setOccupationOptions(data.occupation_options)
                },
                onError: (error) => {
                    form.setError('root', {
                        type: 'server',
                        message: error,
                    })
                    console.error('取得エラー:', error)
                },
            })
        }
        fetch()
    }, [])

    const post_code = form.watch('post_code')
    useEffect(() => {
        if (!post_code) return
        fetchAddressByZipcode(post_code).then((address) => {
            if (address) {
                form.setValue('pref', address.pref)
                form.setValue('city', address.city)
                form.setValue('town', address.town)
            }
        })
    }, [post_code])

    const handleSubmit = async () => {
        setIsSuccess(false)
        window.scrollTo(0, 0)
        const currentValues = form.getValues()
        await updateUser(form, {
            setLoading: setLoading,
            onSuccess: (data) => {
                form.reset(currentValues)
                if (data.isSuccess) {
                    setIsSuccess(true)
                } else {
                    form.setError('root', {
                        type: 'server',
                        message:
                            '更新に失敗しました。しばらくしてからお試しください。',
                    })
                }
            },
            onError: (error) => {
                form.setError('root', {
                    type: 'server',
                    message: error,
                })
                console.error('更新エラー:', error)
            },
        })
    }

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex w-full flex-col justify-center px-6 py-12">
                <h2 className="mb-8 text-xl">会員情報編集</h2>

                {isSuccess && (
                    <div className="mb-8 rounded border border-green-400 bg-green-100 p-3 text-green-700">
                        会員情報を更新しました
                    </div>
                )}

                {(form.formState.errors.root ||
                    (form.formState.isSubmitted &&
                        !form.formState.isValid)) && (
                    <div className="mb-8 rounded border border-red-400 bg-red-100 p-3 text-red-700">
                        {form.formState.errors.root?.message ??
                            '入力内容をご確認ください。未入力または形式に誤りがあります。'}
                    </div>
                )}

                <div className="mb-8 border-b-1 border-zinc-200">
                    お客様情報
                </div>

                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            id="family_name"
                            type="text"
                            placeholder="姓"
                            label="姓"
                            register={form.register(
                                'family_name',
                                validationRules.required('姓')
                            )}
                            error={form.formState.errors.family_name}
                        />

                        <FormField
                            id="first_name"
                            type="text"
                            placeholder="名"
                            label="名"
                            register={form.register(
                                'first_name',
                                validationRules.required('名')
                            )}
                            error={form.formState.errors.first_name}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            id="family_name_kana"
                            type="text"
                            placeholder="セイ"
                            label="セイ"
                            register={form.register(
                                'family_name_kana',
                                validationRules.required('セイ')
                            )}
                            error={form.formState.errors.family_name_kana}
                        />

                        <FormField
                            id="first_name_kana"
                            type="text"
                            placeholder="メイ"
                            label="メイ"
                            register={form.register(
                                'first_name_kana',
                                validationRules.required('メイ')
                            )}
                            error={form.formState.errors.first_name_kana}
                        />
                    </div>

                    <FormField
                        id="company_name"
                        type="text"
                        placeholder="会社名"
                        label="会社名"
                        register={form.register('company_name')}
                        error={form.formState.errors.company_name}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            id="post_code"
                            type="text"
                            placeholder="郵便番号(ハイフンなし)"
                            label="郵便番号"
                            register={form.register(
                                'post_code',
                                validationRules.required('郵便番号')
                            )}
                            error={form.formState.errors.post_code}
                        />

                        <FormField
                            id="pref"
                            type="text"
                            placeholder="都道府県"
                            label="都道府県"
                            register={form.register(
                                'pref',
                                validationRules.required('都道府県')
                            )}
                            error={form.formState.errors.pref}
                        />
                    </div>

                    <FormField
                        id="city"
                        type="text"
                        placeholder="市区町村名 (例：千代田区神田神保町)"
                        label="市区町村"
                        register={form.register(
                            'city',
                            validationRules.required('市区町村')
                        )}
                        error={form.formState.errors.city}
                    />

                    <FormField
                        id="town"
                        type="text"
                        placeholder="番地 (例：1-3-5)"
                        label="番地"
                        register={form.register(
                            'town',
                            validationRules.required('番地')
                        )}
                        error={form.formState.errors.town}
                    />

                    <FormField
                        id="building"
                        type="text"
                        placeholder="建物名・部屋番号"
                        label="建物名・部屋番号など（任意）"
                        register={form.register('building')}
                        error={form.formState.errors.building}
                    />

                    <FormField
                        id="tel"
                        type="text"
                        placeholder="電話番号(ハイフンなし)"
                        label="電話番号"
                        register={form.register(
                            'tel',
                            validationRules.required('電話番号')
                        )}
                        error={form.formState.errors.tel}
                    />

                    <FormField
                        id="fax"
                        type="text"
                        placeholder="FAX番号(ハイフンなし)"
                        label="FAX番号"
                        register={form.register('fax')}
                        error={form.formState.errors.fax}
                    />

                    <div className="my-8 border-b-1 border-zinc-200">
                        メールアドレス・パスワード
                    </div>

                    <FormField
                        id="email"
                        type="email"
                        placeholder="メールアドレス"
                        label="メールアドレス"
                        register={form.register(
                            'email',
                            validationRules.required('メールアドレス')
                        )}
                        error={form.formState.errors.email}
                    />

                    <FormField
                        id="email_confirmation"
                        type="email"
                        placeholder="確認のためもう一度入力してください"
                        label="メールアドレス(確認)"
                        register={form.register(
                            'email_confirmation',
                            validationRules.required('メールアドレス(確認)')
                        )}
                        error={form.formState.errors.email_confirmation}
                    />

                    <FormField
                        id="password"
                        type="password"
                        placeholder="パスワード"
                        label="新しいパスワード"
                        register={form.register('password')}
                        error={form.formState.errors.password}
                    />

                    <FormField
                        id="password_confirmation"
                        type="password"
                        placeholder="確認のためもう一度入力してください"
                        label="新しいパスワード(確認)"
                        register={form.register('password_confirmation')}
                        error={form.formState.errors.password_confirmation}
                    />

                    <div className="my-8 border-b-1 border-zinc-200">
                        生年月日・性別・職業
                    </div>

                    <div>
                        <div className="mb-1 block text-sm font-bold">
                            生年月日
                        </div>
                        <div className="mb-1 flex items-center gap-3">
                            <SelectField
                                id="year"
                                options={Array.from({ length: 111 }, (_, i) => {
                                    const year = new Date().getFullYear() - i
                                    return {
                                        label: String(year),
                                        value: String(year),
                                    }
                                })}
                                placeholder="----"
                                register={form.register('year')}
                            />
                            /
                            <SelectField
                                id="month"
                                options={[...Array(12)].map((_, i) => ({
                                    label: `${i + 1}`,
                                    value: `${i + 1}`,
                                }))}
                                placeholder="--"
                                register={form.register('month')}
                            />
                            /
                            <SelectField
                                id="day"
                                options={[...Array(31)].map((_, i) => ({
                                    label: `${i + 1}`,
                                    value: `${i + 1}`,
                                }))}
                                placeholder="--"
                                register={form.register('day')}
                                error={form.formState.errors.day}
                            />
                        </div>

                        {form.formState.errors.birthday && (
                            <p className="mb-0 text-sm text-red-600">
                                {form.formState.errors.birthday.message}
                            </p>
                        )}
                    </div>

                    <SelectField
                        id="gender"
                        label="性別"
                        options={genderOptions}
                        placeholder="無回答"
                        register={form.register('gender')}
                        error={form.formState.errors.gender}
                    />

                    <SelectField
                        id="occupation"
                        label="職業"
                        options={occupationOptions}
                        register={form.register('occupation')}
                        error={form.formState.errors.occupation}
                    />

                    <div className="text-center">
                        <button
                            type="submit"
                            className="mt-10 inline-block w-full rounded-full bg-blue-600 px-8 py-3 text-center text-white md:w-1/2">
                            変更する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
