import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

// ─── Toast Types ─────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-canvas-mint_deep" />,
  error:   <AlertCircle className="w-4 h-4 text-canvas-error" />,
  info:    <Info className="w-4 h-4 text-canvas-mint_deep" />,
  warning: <AlertTriangle className="w-4 h-4 text-canvas-tan_dark" />,
}

const bgStyles: Record<ToastType, string> = {
  success: 'border-canvas-mint/30 bg-canvas-mint/10',
  error:   'border-canvas-error/30 bg-canvas-rose/15',
  info:    'border-canvas-mint/25 bg-canvas-mint/8',
  warning: 'border-canvas-tan/30 bg-canvas-surface/60',
}

// ─── Global Toast State ──────────────────────────────────────────────────────

let toastListeners: Array<(toasts: Toast[]) => void> = []
let toastQueue: Toast[] = []

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastQueue]))
}

export function toast(type: ToastType, title: string, message?: string, duration: number = 4000) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const newToast: Toast = { id, type, title, message, duration }
  toastQueue = [...toastQueue, newToast]
  notifyListeners()

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== id)
      notifyListeners()
    }, duration)
  }
}

// Convenience helpers
toast.success = (title: string, message?: string) => toast('success', title, message)
toast.error = (title: string, message?: string) => toast('error', title, message)
toast.info = (title: string, message?: string) => toast('info', title, message)
toast.warning = (title: string, message?: string) => toast('warning', title, message)

// ─── Toast Item ──────────────────────────────────────────────────────────────

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-boutique-md max-w-sm backdrop-blur-sm',
        bgStyles[t.type]
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-canvas-brown">{t.title}</p>
        {t.message && <p className="text-xs text-canvas-brown_mid mt-0.5">{t.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 p-0.5 rounded hover:bg-black/5 text-canvas-brown_light"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Toast Container (rendered in App root) ──────────────────────────────────

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
