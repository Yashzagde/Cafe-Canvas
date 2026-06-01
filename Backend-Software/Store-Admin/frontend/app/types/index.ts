/**
 * CafeCanvas — Shared TypeScript Types
 * Matches the Supabase schema exactly.
 */

// ─── Enums ───────────────────────────────────────────

export type UserRole = 'owner' | 'manager' | 'staff' | 'cashier' | 'kitchen';
export type OrderStatus = 'open' | 'sent_to_kitchen' | 'ready' | 'settled' | 'cancelled' | 'void';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'split' | 'complimentary';
export type TableStatus = 'free' | 'occupied' | 'reserved' | 'cleaning';
export type KdsStatus = 'pending' | 'preparing' | 'ready' | 'served';
export type TableShape = 'square' | 'round' | 'long';

// ─── Tenant ──────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'starter' | 'pro' | 'enterprise';
  logo_url: string | null;
  timezone: string;
  currency: string;
  address: string | null;
  phone: string | null;
  tax_percent: number;
  receipt_header: string | null;
  receipt_footer: string | null;
  active: boolean;
  created_at: string;
}

// ─── User ────────────────────────────────────────────

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  pin: string | null;
  avatar_url: string | null;
  active: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

// ─── Floor ───────────────────────────────────────────

export interface FloorSection {
  id: string;
  tenant_id: string;
  name: string;
  sort_order: number;
}

export interface FloorTable {
  id: string;
  tenant_id: string;
  section_id: string | null;
  name: string;
  capacity: number;
  status: TableStatus;
  position_x: number;
  position_y: number;
  shape: TableShape;
  created_at: string;
  updated_at: string;
}

// ─── Menu ────────────────────────────────────────────

export interface MenuCategory {
  id: string;
  tenant_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  visible: boolean;
}

export interface ModifierOption {
  label: string;
  price_delta: number;
}

export interface MenuModifier {
  id: string;
  tenant_id: string;
  item_id: string;
  name: string;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  tags: string[];
  prep_time_min: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined client-side
  modifiers?: MenuModifier[];
}

// ─── Orders ──────────────────────────────────────────

export interface Order {
  id: string;
  tenant_id: string;
  table_id: string | null;
  status: OrderStatus;
  customer_name: string | null;
  customer_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  local_ref: string | null;
  // Joined client-side
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  tenant_id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  modifiers: SelectedModifier[];
  notes: string | null;
  kds_status: KdsStatus;
  sent_at: string | null;
}

export interface SelectedModifier {
  group_name: string;
  option_label: string;
  price_delta: number;
}

// ─── Bills ───────────────────────────────────────────

export interface Bill {
  id: string;
  tenant_id: string;
  order_id: string | null;
  bill_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: PaymentMethod | null;
  payment_ref: string | null;
  settled_at: string | null;
  settled_by: string | null;
  printed: boolean;
  local_ref: string | null;
  created_at: string;
}

// ─── Promotions ──────────────────────────────────────

export interface Promotion {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number | null;
  applies_to: 'all' | 'category' | 'item';
  target_ids: string[] | null;
  active: boolean;
  start_at: string | null;
  end_at: string | null;
  notify_customers: boolean;
}

// ─── Storefront ──────────────────────────────────────

export interface StorefrontConfig {
  id: string;
  tenant_id: string;
  theme: 'light' | 'dark' | 'custom';
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  hero_image_url: string | null;
  banner_text: string | null;
  show_prices: boolean;
  allow_orders: boolean;
  updated_at: string;
}

// ─── Staff Performance ──────────────────────────────

export interface StaffPerformance {
  id: string;
  tenant_id: string;
  user_id: string;
  date: string;
  orders_handled: number;
  bills_settled: number;
  total_revenue: number;
  avg_table_time: number | null;
  tips_received: number;
}

// ─── Sync Queue ──────────────────────────────────────

export interface SyncQueueItem {
  id?: number;
  operation: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

// ─── Receipt ─────────────────────────────────────────

export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  billNumber: string;
  tableNumber: string;
  items: Array<{ name: string; quantity: number; price: number; modifiers?: string }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  settledAt: string;
  thankYouMessage?: string;
}

// ─── Dashboard Metrics ───────────────────────────────

export interface DashboardMetrics {
  revenue_today: number;
  revenue_yesterday: number;
  orders_today: number;
  orders_yesterday: number;
  active_tables: number;
  total_tables: number;
  avg_bill_value: number;
  avg_bill_yesterday: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface TopItem {
  id: string;
  name: string;
  category: string;
  quantity_sold: number;
  revenue: number;
}

export interface HourlyData {
  hour: number;
  orders: number;
}
