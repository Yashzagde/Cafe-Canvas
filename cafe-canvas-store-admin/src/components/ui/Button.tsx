import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white shadow-md shadow-canvas-terracotta/10',
  secondary: 'bg-canvas-gold hover:bg-canvas-gold_light active:bg-canvas-gold text-canvas-brown shadow-sm',
  ghost:     'bg-transparent hover:bg-canvas-surface text-canvas-brown_mid hover:text-canvas-brown',
  danger:    'bg-canvas-error hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
  success:   'bg-canvas-sage hover:bg-green-600 active:bg-green-700 text-white shadow-sm',
  outline:   'bg-transparent border border-canvas-border hover:bg-canvas-surface text-canvas-brown',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-canvas-terracotta/30 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
