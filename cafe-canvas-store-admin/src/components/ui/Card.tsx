import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      className={cn(
        'bg-canvas-highlight rounded-xl border border-canvas-border/50 shadow-boutique',
        paddingStyles[padding],
        hover && 'card-boutique cursor-pointer hover:border-canvas-rose/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// Card Header subcomponent
interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider font-display">{title}</h3>
        {subtitle && <p className="text-xs text-canvas-brown_mid mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// Stat Card for dashboard KPIs
interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string        // e.g. 'bg-canvas-rose'
  textColor?: string   // e.g. 'text-canvas-brown'
  badge?: string
}

export function StatCard({ label, value, change, changeType = 'positive', icon, color, textColor = 'text-canvas-brown', badge }: StatCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-xl border shadow-boutique relative overflow-hidden group card-boutique',
      color,
      textColor,
      color.includes('rose') ? 'border-canvas-rose/30' :
      color.includes('mint') ? 'border-canvas-mint/30' :
      'border-canvas-border/40'
    )}>
      <div className="absolute right-[-10px] top-[-10px] opacity-[0.06] pointer-events-none group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex justify-between items-start">
        <span className="text-xs font-extrabold uppercase tracking-wider opacity-60">{label}</span>
        {(change || badge) && (
          <span className={cn(
            'px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5',
            changeType === 'positive' && 'bg-canvas-mint/30 text-canvas-mint_deep',
            changeType === 'negative' && 'bg-canvas-rose/30 text-canvas-rose_deep',
            changeType === 'neutral' && 'bg-canvas-tan/20 text-canvas-brown_mid'
          )}>
            {change || badge}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-extrabold mt-3">{value}</p>
    </div>
  )
}
