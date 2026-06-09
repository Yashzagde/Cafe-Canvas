import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-canvas-brown uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-canvas-brown_light">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border bg-canvas-highlight text-sm text-canvas-brown font-semibold',
              'focus:border-canvas-rose focus:ring-1 focus:ring-canvas-rose/20 outline-none transition-all',
              'placeholder-canvas-brown_light',
              icon ? 'pl-10' : '',
              suffix ? 'pr-10' : '',
              error
                ? 'border-canvas-error focus:border-canvas-error focus:ring-canvas-error/20'
                : 'border-canvas-border',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-brown_light text-sm font-bold">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs font-bold text-canvas-error">{error}</p>}
        {hint && !error && <p className="text-xs text-canvas-brown_light">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-canvas-brown uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border bg-canvas-highlight text-sm text-canvas-brown font-semibold',
            'focus:border-canvas-rose focus:ring-1 focus:ring-canvas-rose/20 outline-none transition-all',
            'placeholder-canvas-brown_light resize-none',
            error
              ? 'border-canvas-error focus:border-canvas-error focus:ring-canvas-error/20'
              : 'border-canvas-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-bold text-canvas-error">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
