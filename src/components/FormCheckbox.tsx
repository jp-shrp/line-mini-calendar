import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FormCheckboxProps {
    label?: string
    id: string
    register: UseFormRegisterReturn
    error?: FieldError
    className?: string
}

export default function FormCheckbox({
    label,
    id,
    register,
    error,
    className = '',
}: FormCheckboxProps) {
    return (
        <div className={`flex items-center ${className}`}>
            <input
                id={id}
                type="checkbox"
                {...register}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
                {label}
            </label>
            {error && (
                <p className="ml-2 flex items-center text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    )
}
