import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface Option {
    label: string
    value: string
}

interface SelectFieldProps {
    label?: string
    id: string
    placeholder?: string
    options: Option[]
    register: UseFormRegisterReturn
    error?: FieldError
    className?: string
}

export default function SelectField({
    label,
    id,
    placeholder = '選択してください',
    options,
    register,
    error,
    className = '',
}: SelectFieldProps) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="mb-1 block text-sm font-bold">
                    {label}
                </label>
            )}
            <select
                id={id}
                {...register}
                className={`w-full rounded-md border px-3 py-2 transition-colors focus:ring-2 focus:outline-none ${
                    error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                }`}>
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 flex items-center text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    )
}
