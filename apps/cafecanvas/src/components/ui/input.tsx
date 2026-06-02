import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-slate-900 border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:ring-indigo-500'
          } rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
