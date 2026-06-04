/**
 * CafeCanvas Store Admin — Application Constants
 * ────────────────────────────────────────────────
 * Central source of truth for all business rules, enums, and config.
 */

// ─── Order Status Flow ───────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'billed',
  'paid',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  preparing:  'Preparing',
  ready:      'Ready',
  served:     'Served',
  billed:     'Billed',
  paid:       'Paid',
  cancelled:  'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending:    { bg: 'bg-amber-100',    text: 'text-amber-800',    border: 'border-amber-300' },
  confirmed:  { bg: 'bg-blue-100',     text: 'text-blue-800',     border: 'border-blue-300' },
  preparing:  { bg: 'bg-orange-100',   text: 'text-orange-800',   border: 'border-orange-300' },
  ready:      { bg: 'bg-emerald-100',  text: 'text-emerald-800',  border: 'border-emerald-300' },
  served:     { bg: 'bg-teal-100',     text: 'text-teal-800',     border: 'border-teal-300' },
  billed:     { bg: 'bg-indigo-100',   text: 'text-indigo-800',   border: 'border-indigo-300' },
  paid:       { bg: 'bg-green-100',    text: 'text-green-800',    border: 'border-green-300' },
  cancelled:  { bg: 'bg-red-100',      text: 'text-red-800',      border: 'border-red-300' },
}

// Next valid status transitions
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['ready', 'cancelled'],
  ready:      ['served'],
  served:     ['billed'],
  billed:     ['paid'],
  paid:       [],
  cancelled:  [],
}

// ─── Bill Status ─────────────────────────────────────────────────────────────
export const BILL_STATUSES = ['unpaid', 'paid', 'void', 'partial'] as const
export type BillStatus = (typeof BILL_STATUSES)[number]

export const BILL_STATUS_COLORS: Record<BillStatus, { bg: string; text: string }> = {
  unpaid:  { bg: 'bg-amber-100',  text: 'text-amber-800' },
  paid:    { bg: 'bg-green-100',  text: 'text-green-800' },
  void:    { bg: 'bg-red-100',    text: 'text-red-800' },
  partial: { bg: 'bg-blue-100',   text: 'text-blue-800' },
}

// ─── Staff Roles ─────────────────────────────────────────────────────────────
export const STAFF_ROLES = ['manager', 'cashier', 'kitchen', 'delivery', 'staff'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  manager:  'Manager',
  cashier:  'Cashier',
  kitchen:  'Kitchen',
  delivery: 'Delivery',
  staff:    'Staff',
}

export const STAFF_ROLE_COLORS: Record<StaffRole, { bg: string; text: string; border: string }> = {
  manager:  { bg: 'bg-canvas-gold/15',       text: 'text-canvas-brown',  border: 'border-canvas-gold/30' },
  cashier:  { bg: 'bg-canvas-teal/15',       text: 'text-canvas-brown',  border: 'border-canvas-teal/30' },
  kitchen:  { bg: 'bg-canvas-coral/15',      text: 'text-canvas-brown',  border: 'border-canvas-coral/30' },
  delivery: { bg: 'bg-canvas-terracotta/15', text: 'text-canvas-brown',  border: 'border-canvas-terracotta/30' },
  staff:    { bg: 'bg-canvas-surface',       text: 'text-canvas-brown_mid', border: 'border-canvas-border' },
}

// ─── Table Status ────────────────────────────────────────────────────────────
export const TABLE_STATUSES = ['vacant', 'occupied', 'reserved', 'inactive'] as const
export type TableStatus = (typeof TABLE_STATUSES)[number]

export const TABLE_STATUS_COLORS: Record<TableStatus, { bg: string; text: string; dot: string }> = {
  vacant:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  occupied: { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
  reserved: { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
  inactive: { bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400' },
}

// ─── Payment Methods ─────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ['cash', 'upi', 'card', 'razorpay', 'other'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash:     'Cash',
  upi:      'UPI',
  card:     'Card',
  razorpay: 'Razorpay',
  other:    'Other',
}

// ─── Tax Configuration (India) ───────────────────────────────────────────────
export const DEFAULT_CGST_RATE = 2.5  // %
export const DEFAULT_SGST_RATE = 2.5  // %
export const DEFAULT_CURRENCY  = 'INR'

// ─── Subscription Tiers ──────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = ['Free', 'Pro', 'Growth', 'Enterprise'] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

export const TIER_COLORS: Record<SubscriptionTier, string> = {
  Free:       'bg-gray-100 text-gray-700',
  Pro:        'bg-canvas-teal/15 text-canvas-teal',
  Growth:     'bg-canvas-gold/15 text-canvas-brown',
  Enterprise: 'bg-canvas-terracotta/15 text-canvas-terracotta',
}

// ─── Dietary Tags ────────────────────────────────────────────────────────────
export const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'non-vegetarian',
  'egg',
  'gluten-free',
  'dairy-free',
  'jain',
  'spicy',
] as const

export type DietaryTag = (typeof DIETARY_TAGS)[number]

export const DIETARY_TAG_LABELS: Record<DietaryTag, { label: string; color: string; icon: string }> = {
  'vegetarian':     { label: 'Veg',         color: 'bg-green-100 text-green-800',  icon: '🟢' },
  'vegan':          { label: 'Vegan',       color: 'bg-green-100 text-green-800',  icon: '🌱' },
  'non-vegetarian': { label: 'Non-Veg',     color: 'bg-red-100 text-red-800',      icon: '🔴' },
  'egg':            { label: 'Egg',         color: 'bg-yellow-100 text-yellow-800', icon: '🥚' },
  'gluten-free':    { label: 'Gluten Free', color: 'bg-amber-100 text-amber-800',  icon: '🌾' },
  'dairy-free':     { label: 'Dairy Free',  color: 'bg-blue-100 text-blue-800',    icon: '🥛' },
  'jain':           { label: 'Jain',        color: 'bg-orange-100 text-orange-800', icon: '🕉️' },
  'spicy':          { label: 'Spicy',       color: 'bg-red-100 text-red-800',      icon: '🌶️' },
}

// ─── Supabase Table Names ────────────────────────────────────────────────────
export const TABLES = {
  TENANTS:              'tenants',
  BRANCHES:             'branches',
  USERS:                'users',
  MENU_CATEGORIES:      'menu_categories',
  MENU_ITEMS:           'menu_items',
  MODIFIER_GROUPS:      'modifier_groups',
  MODIFIER_OPTIONS:     'modifier_options',
  TABLES:               'tables',
  TABLE_SESSIONS:       'table_sessions',
  ORDERS:               'orders',
  ORDER_ITEMS:          'order_items',
  BILLS:                'bills',
  STAFF_CALLS:          'staff_calls',
  CUSTOMERS:            'customers',
  DISCOUNTS:            'discounts',
  COUPONS:              'coupons',
  COUPON_USES:          'coupon_uses',
  STOREFRONT_NOTIFICATIONS: 'storefront_notifications',
  STORE_SETTINGS:       'store_settings',
  BRANDING:             'branding',
  STOREFRONT_CONFIG:    'storefront_config',
  PAYMENT_INTEGRATIONS: 'payment_integrations',
  INVENTORY:            'inventory',
  STAFF_ACCOUNTS:       'staff_accounts',
  STAFF_ATTENDANCE:     'staff_attendance',
  AUDIT_LOGS:           'audit_logs',
} as const

// ─── Keyboard Shortcuts ──────────────────────────────────────────────────────
export const KEYBOARD_SHORTCUTS: Record<string, { key: string; label: string }> = {
  dashboard:         { key: '1', label: 'Ctrl+1' },
  menu:              { key: '2', label: 'Ctrl+2' },
  orders:            { key: '3', label: 'Ctrl+3' },
  tables:            { key: '4', label: 'Ctrl+4' },
  billing:           { key: '5', label: 'Ctrl+5' },
  staff:             { key: '6', label: 'Ctrl+6' },
  customers:         { key: '7', label: 'Ctrl+7' },
  analytics:         { key: '8', label: 'Ctrl+8' },
  settings:          { key: '9', label: 'Ctrl+9' },
}
