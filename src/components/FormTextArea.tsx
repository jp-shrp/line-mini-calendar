import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormTextAreaProps {
    label?: string
    id: string
    placeholder?: string
    register: UseFormRegisterReturn
    error?: FieldError
    className?: string
    rows?: number
}

export default function FormTextArea({
    label,
    id,
    placeholder,
    register,
    error,
    className = '',
    rows = 3,
}: FormTextAreaProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1 block text-sm font-bold">
                {label}
            </label>
            <textarea
                id={id}
                {...register}
                rows={rows}
                className={`w-full rounded-md border px-3 py-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                }`}
                placeholder={placeholder}
            />
            {error && (
                <p className="mt-1 flex items-center text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    )
}
