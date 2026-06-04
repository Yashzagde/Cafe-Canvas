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
        'bg-canvas-surface rounded-xl border border-canvas-border shadow-sm',
        paddingStyles[padding],
        hover && 'hover:shadow-md hover:border-canvas-champagne transition-all duration-150 cursor-pointer',
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
        <h3 className="text-sm font-extrabold uppercase text-canvas-brown tracking-wider">{title}</h3>
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
  color: string        // e.g. 'bg-canvas-terracotta'
  textColor?: string   // e.g. 'text-white'
  badge?: string
}

export function StatCard({ label, value, change, changeType = 'positive', icon, color, textColor = 'text-white', badge }: StatCardProps) {
  return (
    <div className={cn(color, textColor, 'p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden group')}>
      <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex justify-between items-start">
        <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">{label}</span>
        {(change || badge) && (
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5',
            changeType === 'positive' && 'bg-white/20',
            changeType === 'negative' && 'bg-red-500/20',
            changeType === 'neutral' && 'bg-white/10'
          )}>
            {change || badge}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-extrabold mt-3">{value}</p>
    </div>
  )
}
