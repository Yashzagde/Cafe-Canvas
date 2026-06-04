import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-canvas-border/40', className)} />
  )
}

// Pre-built skeleton layouts for common screen patterns

export function SkeletonCard() {
  return (
    <div className="bg-canvas-surface rounded-xl border border-canvas-border p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-canvas-surface rounded-xl border border-canvas-border overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-canvas-border bg-canvas-cream/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-canvas-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-canvas-surface rounded-xl border border-canvas-border p-6 space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-2 w-2/3" />
        </div>
      ))}
    </div>
  )
}
