import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
}

const sizeStyles: Record<string, string> = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[90vw]',
}

export function Modal({ isOpen, onClose, title, subtitle, size = 'md', children, footer }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-canvas-brown/30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full mx-4 bg-canvas-cream rounded-2xl shadow-boutique-lg border border-canvas-border/50 flex flex-col max-h-[85vh]',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-canvas-border/40 shrink-0">
          <div>
            <h3 className="font-display text-xl font-bold text-canvas-brown">{title}</h3>
            {subtitle && (
              <p className="text-xs text-canvas-brown_mid font-medium mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-canvas-rose/10 text-canvas-brown_mid hover:text-canvas-brown transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-canvas-border/40 bg-canvas-highlight/60 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
