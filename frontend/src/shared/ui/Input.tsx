
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function Input({
                          label,
                          error,
                          id,
                          className = '',
                          ...props
                      }: InputProps) {
    const inputId = id ?? props.name

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={`rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${className}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />

            {error && (
                <span id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </span>
            )}
        </div>
    )
}
