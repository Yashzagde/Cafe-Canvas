/**
 * CafeCanvas Store Admin — Core Utilities
 * ─────────────────────────────────────────
 * Shared helpers used across all screens and components.
 * All currency values stored as paise (integer) in the database.
 */

/**
 * Merge CSS class names conditionally.
 * Filters out falsy values (false, null, undefined, '').
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format paise integer to INR display string.
 * Example: 12450 → "₹124.50", 100 → "₹1.00"
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Format paise integer to compact INR (no decimals for whole rupees).
 * Example: 12400 → "₹124", 12450 → "₹124.50"
 */
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  const hasDecimal = rupees % 1 !== 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees)
}

/**
 * Format rupees (not paise) to INR display.
 * Used for dashboard stats where values are already in rupees.
 */
export function formatRupees(rupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

/**
 * Format ISO date string to human-readable format.
 */
export function formatDate(iso: string, style: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(iso)
  const now = new Date()

  if (style === 'relative') {
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
  }

  if (style === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time from ISO string.
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

/**
 * Generate a short unique ID (for client-side temp keys).
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Get greeting based on current time of day.
 */
export function getGreeting(): string {
  const hours = new Date().getHours()
  if (hours < 12) return 'Good morning'
  if (hours < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Get initials from a name or email.
 */
export function getInitials(nameOrEmail: string): string {
  if (nameOrEmail.includes('@')) {
    return nameOrEmail.slice(0, 2).toUpperCase()
  }
  return nameOrEmail
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Parse paise from a rupee string input.
 * "124.50" → 12450, "124" → 12400
 */
export function rupeesToPaise(rupeeStr: string): number {
  const num = parseFloat(rupeeStr)
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

/**
 * Paise to rupees number (for form inputs).
 */
export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2)
}

/**
 * Calculate GST breakdown from subtotal in paise.
 */
export function calculateGST(
  subtotalPaise: number,
  cgstRate: number = 2.5,
  sgstRate: number = 2.5
): { cgst: number; sgst: number; total: number } {
  const cgst = Math.round(subtotalPaise * (cgstRate / 100))
  const sgst = Math.round(subtotalPaise * (sgstRate / 100))
  return {
    cgst,
    sgst,
    total: subtotalPaise + cgst + sgst,
  }
}

/**
 * Sleep for a specified duration (for animations/transitions).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
