import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-canvas-surface border border-canvas-border flex items-center justify-center mb-5 text-canvas-brown_light">
        {icon}
      </div>
      <h4 className="font-display text-lg font-bold text-canvas-brown mb-1.5">{title}</h4>
      <p className="text-xs text-canvas-brown_mid max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
