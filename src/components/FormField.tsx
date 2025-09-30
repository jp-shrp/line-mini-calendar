import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormFieldProps {
    label?: string
    id: string
    type?: string
    placeholder?: string
    register: UseFormRegisterReturn
    error?: FieldError
    className?: string
}

export default function FormField({
    label,
    id,
    type = 'text',
    placeholder,
    register,
    error,
    className = '',
}: FormFieldProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1 block text-sm font-bold">
                {label}
            </label>
            <input
                id={id}
                type={type}
                {...register}
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
