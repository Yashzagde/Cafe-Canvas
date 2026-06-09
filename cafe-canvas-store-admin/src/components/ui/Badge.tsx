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
  default: 'bg-canvas-surface/60 text-canvas-brown border-canvas-border/50',
  primary: 'bg-canvas-rose/20 text-canvas-rose_deep border-canvas-rose/25',
  success: 'bg-canvas-mint/25 text-canvas-mint_deep border-canvas-mint/30',
  warning: 'bg-canvas-tan/25 text-canvas-brown border-canvas-tan/35',
  danger:  'bg-canvas-error/15 text-canvas-error border-canvas-error/25',
  info:    'bg-canvas-mint/15 text-canvas-mint_deep border-canvas-mint/25',
  neutral: 'bg-canvas-cream text-canvas-brown_mid border-canvas-border/40',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-canvas-brown_mid',
  primary: 'bg-canvas-rose',
  success: 'bg-canvas-mint_deep',
  warning: 'bg-canvas-tan_dark',
  danger:  'bg-canvas-error',
  info:    'bg-canvas-mint',
  neutral: 'bg-canvas-brown_light',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[9px]',
  md: 'px-2 py-0.5 text-[10px]',
}

export function Badge({ variant = 'default', size = 'md', dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg font-bold uppercase tracking-wider border whitespace-nowrap',
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
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-canvas-rose text-canvas-brown text-[10px] font-extrabold',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
