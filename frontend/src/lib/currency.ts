/**
 * @file src/lib/currency.ts
 * @description Paise-first currency utilities for Indian Rupees.
 *   All database values are stored as INTEGER paise.
 *   NEVER perform arithmetic on formatted strings.
 */

/** Convert rupees (float/string input) → paise (integer), Half-Up rounding */
export function toPaise(rupees: number | string): number {
  const n = typeof rupees === 'string' ? parseFloat(rupees) : rupees
  if (!isFinite(n)) throw new RangeError(`Invalid rupee value: ${rupees}`)
  return Math.round(n * 100)   // Math.round IS Half-Up for positive values
}

/** Convert paise (integer) → rupees (2-decimal float) */
export function toRupees(paise: number): number {
  return paise / 100
}

/**
 * Format paise as a human-readable INR string.
 * @example formatINR(125050) → "₹1,250.50"
 */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100)
}

/**
 * Compact format for dashboard KPIs.
 * @example formatShort(1250000) → "₹12.5K"
 * @example formatShort(125000000) → "₹12.5L"
 */
export function formatShort(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_00_000) return `₹${(rupees / 1_00_000).toFixed(1)}L`
  if (rupees >= 1_000)     return `₹${(rupees / 1_000).toFixed(1)}K`
  return `₹${rupees.toFixed(0)}`
}

/**
 * Round paise to nearest whole rupee (Half-Up).
 * Use before displaying prices, not before storing.
 */
export function roundToRupee(paise: number): number {
  return Math.round(paise / 100) * 100
}

/** Sum an array of paise values safely (avoids floating-point drift) */
export function sumPaise(values: number[]): number {
  return values.reduce((acc, v) => acc + Math.trunc(v), 0)
}
