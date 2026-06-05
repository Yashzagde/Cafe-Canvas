// =========================================================================
// CafeCanvas — TypeScript Database Interfaces (v3.0)
// =========================================================================

// ---------- ENUMS & CUSTOM TYPES ----------

export type SubscriptionTier = 'Free' | 'Pro' | 'Growth' | 'Enterprise';
export type StaffRole = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'delivery' | 'staff';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled' | 'void';
export type OrderSource = 'storefront' | 'pos' | 'admin';
export type PaymentMethod = 'cash' | 'upi' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'waived' | 'refunded';
export type TaxMode = 'inclusive' | 'exclusive';
export type ShiftStatus = 'working' | 'leave' | 'holiday';
export type MenuItemStatus = 'available' | 'unavailable' | 'hidden';
export type DiningTableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type DiningTableShape = 'square' | 'round' | 'long';
export type StaffCallStatus = 'pending' | 'acknowledged' | 'resolved';
export type DiscountType = 'percent' | 'flat';
export type DiscountRuleType = 'auto_apply' | 'manual';
export type DiscountRuleAppliesTo = 'all' | 'category' | 'item';
export type CampaignChannel = 'sms' | 'whatsapp' | 'email';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
export type InventoryTransactionType = 'purchase' | 'waste' | 'reconciliation' | 'order_consumption';
export type NotificationType = 'staff_call' | 'new_order' | 'stock_alert' | 'system';
export type PlatformFeedbackRating = 1 | 2 | 3 | 4 | 5;
export type BugReportSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// ---------- TABLE INTERFACES ----------

// GROUP 1: FOUNDATION

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  public_id: string;
  private_id: string | null; // Trigger populated
  email: string;
  plan: SubscriptionTier;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantSession {
  id: string;
  tenant_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  last_seen_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  tenant_id: string;
  location_id: string | null;
  cgst_percent: number;
  sgst_percent: number;
  tax_mode: TaxMode;
  upi_id: string | null;
  payment_methods: PaymentMethod[];
  receipt_header: string | null;
  receipt_footer: string;
  created_at: string;
  updated_at: string;
}

export interface StorefrontConfig {
  id: string;
  tenant_id: string;
  theme_id: string;
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  banner_text: string | null;
  hero_text: string | null;
  hero_image_url: string | null;
  show_prices: boolean;
  allow_orders: boolean;
  show_blog: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionLimits {
  tier: SubscriptionTier;
  max_locations: number; // -1 for unlimited
  max_menu_items: number; // -1 for unlimited
  analytics_access: 'none' | 'basic' | 'full' | 'full_api';
  marketing_access: boolean;
  blog_enabled: boolean;
  custom_domain_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// GROUP 2: IDENTITY & AUTH

export interface StaffAccount {
  id: string;
  tenant_id: string;
  location_id: string | null;
  auth_user_id: string | null;
  name: string;
  login_id: string | null; // Generated: slug#1001
  auth_email: string | null; // Generated: slug-1001@staff.cafecanvas.bar
  staff_number: number | null; // Generated
  role: StaffRole;
  pin_hash: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffSession {
  id: string;
  staff_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  last_seen_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffShift {
  id: string;
  staff_id: string;
  date: string; // YYYY-MM-DD
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number | null;
  geo_lat: number | null;
  geo_lng: number | null;
  selfie_url: string | null;
  status: ShiftStatus;
  created_at: string;
  updated_at: string;
}

// GROUP 3: MENU

export interface MenuCategory {
  id: string;
  tenant_id: string;
  location_id: string | null;
  name: string;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  tenant_id: string;
  location_id: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price_paise: number; // Stored in integer paise (₹)
  image_url: string | null;
  status: MenuItemStatus;
  allows_modifiers: boolean;
  discount_eligible: boolean;
  featured: boolean;
  tags: string[] | null;
  prep_time_min: number;
  sort_order: number;
  deleted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModifierGroup {
  id: string;
  tenant_id: string;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number;
  created_at: string;
  updated_at: string;
}

export interface ModifierOption {
  id: string;
  group_id: string;
  name: string;
  extra_price_paise: number; // Extra cost in paise
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemModifierGroup {
  id: string;
  tenant_id: string;
  menu_item_id: string;
  modifier_group_id: string;
  created_at: string;
  updated_at: string;
}

// GROUP 4: TABLES & SESSIONS

export interface DiningTable {
  id: string;
  tenant_id: string;
  location_id: string | null;
  name: string;
  table_number: number;
  capacity: number;
  section: string;
  shape: DiningTableShape;
  status: DiningTableStatus;
  position_x: number;
  position_y: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableSession {
  id: string;
  tenant_id: string;
  location_id: string | null;
  dining_table_id: string;
  table_number: number;
  session_token: string;
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number | null;
  total_revenue_paise: number;
  customer_count: number;
  assigned_staff_id: string | null;
  bill_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffCall {
  id: string;
  tenant_id: string;
  dining_table_id: string | null;
  table_number: number;
  session_id: string | null;
  called_at: string;
  attended_at: string | null;
  attended_by: string | null;
  status: StaffCallStatus;
  created_at: string;
  updated_at: string;
}

// GROUP 5: ORDERS

export interface Order {
  id: string;
  tenant_id: string;
  location_id: string | null;
  dining_table_id: string | null;
  table_number: number | null;
  session_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  source: OrderSource;
  payment_method: PaymentMethod | null;
  staff_verified: boolean;
  subtotal_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  discount_paise: number;
  total_paise: number;
  notes: string | null;
  local_ref: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  unit_price_paise: number;
  quantity: number;
  notes: string | null;
  kds_status: 'pending' | 'preparing' | 'ready' | 'served';
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemModifier {
  id: string;
  order_item_id: string;
  modifier_option_id: string | null;
  name: string;
  price_paise: number;
  created_at: string;
  updated_at: string;
}

// GROUP 6: BILLING

export interface Bill {
  id: string;
  tenant_id: string;
  location_id: string | null;
  dining_table_id: string | null;
  table_number: number | null;
  subtotal_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  discount_paise: number;
  extra_charges_paise: number;
  total_paise: number;
  status: 'open' | 'paid' | 'voided';
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  item_name: string;
  quantity: number;
  unit_price_paise: number;
  total_price_paise: number;
  modifiers_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  tenant_id: string;
  bill_id: string;
  amount_paise: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_reference: string | null;
  staff_confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

// GROUP 7: CUSTOMERS

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  notes: string | null;
  visit_count: number;
  total_spend_paise: number; // BigInt represented as number in JSON
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerVisit {
  id: string;
  tenant_id: string;
  customer_id: string;
  location_id: string | null;
  dining_table_id: string | null;
  bill_id: string | null;
  visit_date: string; // YYYY-MM-DD
  spend_paise: number;
  created_at: string;
  updated_at: string;
}

// GROUP 8: INVENTORY

export interface InventoryItem {
  id: string;
  tenant_id: string;
  location_id: string;
  name: string;
  sku: string | null;
  current_stock: number; // Numeric represented as number
  unit: string;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  tenant_id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_type: InventoryTransactionType;
  unit_cost_paise: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// GROUP 9: MARKETING

export interface OfferCode {
  id: string;
  tenant_id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount_paise: number;
  max_discount_amount_paise: number;
  start_date: string;
  expiry_date: string;
  max_uses: number | null;
  used_count: number;
  per_customer_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountRule {
  id: string;
  tenant_id: string;
  name: string;
  rule_type: DiscountRuleType;
  discount_type: DiscountType;
  value: number;
  applies_to: DiscountRuleAppliesTo;
  target_category_id: string | null;
  target_menu_item_id: string | null;
  start_date: string | null;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  subject: string | null;
  body_template: string;
  channel: CampaignChannel;
  scheduled_at: string | null;
  sent_at: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface CouponRedemption {
  id: string;
  tenant_id: string;
  offer_code_id: string;
  customer_phone: string;
  order_id: string | null;
  redeemed_at: string;
  created_at: string;
  updated_at: string;
}

// GROUP 10: CONTENT

export interface BlogPost {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  content: string;
  hero_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// GROUP 11: NOTIFICATIONS

export interface Notification {
  id: string;
  tenant_id: string;
  location_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRead {
  id: string;
  tenant_id: string;
  notification_id: string;
  staff_id: string;
  read_at: string;
  created_at: string;
  updated_at: string;
}

// GROUP 12: ANALYTICS

export interface DailyRevenueSnapshot {
  id: string;
  tenant_id: string;
  location_id: string;
  snapshot_date: string; // YYYY-MM-DD
  total_revenue_paise: number;
  order_count: number;
  average_order_value_paise: number;
  payment_method_breakdown: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  tenant_id: string;
  event_name: string;
  event_properties: Record<string, any>;
  anonymous_session_token: string | null;
  staff_id: string | null;
  created_at: string;
}

// GROUP 13: PLATFORM

export interface PlatformFeedback {
  id: string;
  tenant_id: string | null;
  staff_id: string | null;
  feedback_text: string;
  rating: PlatformFeedbackRating | null;
  created_at: string;
  updated_at: string;
}

export interface BugReport {
  id: string;
  tenant_id: string | null;
  staff_id: string | null;
  title: string;
  description: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuperAdminNote {
  id: string;
  tenant_id: string;
  note_text: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
