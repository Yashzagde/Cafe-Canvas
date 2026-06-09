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
  primary:   'bg-canvas-rose hover:bg-canvas-rose_dark active:bg-canvas-rose_deep text-canvas-brown shadow-md shadow-canvas-rose/15',
  secondary: 'bg-canvas-tan hover:bg-canvas-tan_dark active:bg-canvas-tan text-canvas-brown shadow-sm shadow-canvas-tan/10',
  ghost:     'bg-transparent hover:bg-canvas-surface/50 text-canvas-brown_mid hover:text-canvas-brown',
  danger:    'bg-canvas-error hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
  success:   'bg-canvas-mint hover:bg-canvas-mint_dark active:bg-canvas-mint_deep text-canvas-brown shadow-sm shadow-canvas-mint/15',
  outline:   'bg-transparent border border-canvas-border hover:bg-canvas-highlight hover:border-canvas-rose/30 text-canvas-brown',
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
          'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-canvas-rose/30 disabled:opacity-50 disabled:cursor-not-allowed select-none',
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
