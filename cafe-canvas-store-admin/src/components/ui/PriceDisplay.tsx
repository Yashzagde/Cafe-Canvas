import { cn, formatINR, formatINRCompact } from '../../lib/utils'

interface PriceDisplayProps {
  /** Price in paise (integer) */
  paise: number
  /** Show compact format (no decimals for whole rupees) */
  compact?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show strikethrough (for discounted items) */
  strikethrough?: boolean
  /** Additional class */
  className?: string
}

const sizeStyles: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
}

export function PriceDisplay({ paise, compact, size = 'md', strikethrough, className }: PriceDisplayProps) {
  const formatted = compact ? formatINRCompact(paise) : formatINR(paise)

  return (
    <span
      className={cn(
        'font-bold text-canvas-brown tabular-nums',
        sizeStyles[size],
        strikethrough && 'line-through text-canvas-brown_light',
        className
      )}
    >
      {formatted}
    </span>
  )
}

// GST breakdown display
interface GSTBreakdownProps {
  subtotal: number  // paise
  cgst: number      // paise
  sgst: number      // paise
  total: number     // paise
  discount?: number // paise
  className?: string
}

export function GSTBreakdown({ subtotal, cgst, sgst, total, discount, className }: GSTBreakdownProps) {
  return (
    <div className={cn('space-y-2 text-xs font-semibold', className)}>
      <div className="flex justify-between text-canvas-brown_mid">
        <span>Subtotal</span>
        <PriceDisplay paise={subtotal} size="sm" />
      </div>
      {discount !== undefined && discount > 0 && (
        <div className="flex justify-between text-canvas-mint_deep">
          <span>Discount</span>
          <span>-{formatINR(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-canvas-brown_mid">
        <span>CGST (2.5%)</span>
        <PriceDisplay paise={cgst} size="sm" />
      </div>
      <div className="flex justify-between text-canvas-brown_mid">
        <span>SGST (2.5%)</span>
        <PriceDisplay paise={sgst} size="sm" />
      </div>
      <div className="flex justify-between pt-2 border-t border-canvas-border/50 text-canvas-brown font-extrabold text-sm">
        <span>Total</span>
        <PriceDisplay paise={total} size="md" />
      </div>
    </div>
  )
}
