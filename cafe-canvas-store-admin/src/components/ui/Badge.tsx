import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-canvas-surface text-canvas-brown border-canvas-border',
  primary: 'bg-canvas-terracotta/15 text-canvas-terracotta border-canvas-terracotta/25',
  success: 'bg-canvas-sage/15 text-canvas-sage border-canvas-sage/25',
  warning: 'bg-canvas-gold/15 text-canvas-brown border-canvas-gold/30',
  danger:  'bg-canvas-error/15 text-canvas-error border-canvas-error/25',
  info:    'bg-canvas-teal/15 text-canvas-teal border-canvas-teal/30',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-canvas-brown_mid',
  primary: 'bg-canvas-terracotta',
  success: 'bg-canvas-sage',
  warning: 'bg-canvas-gold',
  danger:  'bg-canvas-error',
  info:    'bg-canvas-teal',
  neutral: 'bg-gray-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[9px]',
  md: 'px-2 py-0.5 text-[10px]',
}

export function Badge({ variant = 'default', size = 'md', dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider border whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  )
}

// Notification dot badge (count bubble)
interface CountBadgeProps {
  count: number
  className?: string
}

export function CountBadge({ count, className }: CountBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-canvas-error text-white text-[10px] font-extrabold',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
