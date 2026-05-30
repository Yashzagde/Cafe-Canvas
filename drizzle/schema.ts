import { pgTable, serial, text, varchar, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// ---------- SaaS Tenants & Branches ----------

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  mode: text('mode').default('SINGLE_STORE').notNull(),
  maxSubaccounts: integer('max_subaccounts').default(50).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Core Users ----------

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  branchId: uuid('branch_id'),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: text('role'),
  status: text('status').default('ACTIVE'),
  pinHash: text('pin_hash'),
  createdAt: timestamp('created_at').defaultNow()
});

export const preRegistrations = pgTable('pre_registrations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  restaurantName: text('restaurant_name'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Menu & Modifier Management ----------

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  categoryId: uuid('category_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  imageUrl: text('image_url'),
  status: text('status').default('available').notNull(),
  allowsModifiers: boolean('allows_modifiers').default(false).notNull(),
  discountEligible: boolean('discount_eligible').default(true).notNull(),
  createdBy: uuid('created_by'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const modifierGroups = pgTable('modifier_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').notNull(),
  name: text('name').notNull(),
  required: boolean('required').default(false).notNull(),
  minSelect: integer('min_select').default(0).notNull(),
  maxSelect: integer('max_select').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const modifierOptions = pgTable('modifier_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull(),
  name: text('name').notNull(),
  extraPrice: integer('extra_price').default(0).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ---------- Tables & Customer Sessions ----------

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  capacity: integer('capacity').default(2).notNull(),
  section: text('section').default('Main Floor').notNull(),
  position: jsonb('position').notNull(),
  status: text('status').default('available').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  tags: jsonb('tags'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ---------- Orders & Invoicing ----------

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  tableId: uuid('table_id'),
  customerId: uuid('customer_id'),
  createdBy: uuid('created_by'),
  status: text('status').default('pending').notNull(),
  source: text('source').default('staff_app').notNull(),
  subtotal: integer('subtotal').default(0).notNull(),
  discountAmount: integer('discount_amount').default(0).notNull(),
  extraCharges: jsonb('extra_charges'),
  total: integer('total').default(0).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull(),
  menuItemId: uuid('menu_item_id'),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: integer('unit_price').notNull(),
  modifierSelections: jsonb('modifier_selections'),
  itemName: text('item_name').notNull(),
  itemNotes: text('item_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  tableId: uuid('table_id'),
  orders: jsonb('orders').notNull(),
  subtotal: integer('subtotal').notNull(),
  tax: integer('tax').default(0).notNull(),
  discountAmount: integer('discount_amount').default(0).notNull(),
  extraCharges: jsonb('extra_charges'),
  total: integer('total').notNull(),
  status: text('status').default('open').notNull(),
  paymentMethod: text('payment_method'),
  paidAt: timestamp('paid_at'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tableSessions = pgTable('table_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  checkInAt: timestamp('check_in_at').defaultNow().notNull(),
  checkOutAt: timestamp('check_out_at'),
  durationMinutes: integer('duration_minutes'),
  totalRevenue: integer('total_revenue').default(0).notNull(),
  customerCount: integer('customer_count').default(1).notNull(),
  assignedStaffId: uuid('assigned_staff_id'),
  billId: uuid('bill_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const extraChargeTemplates = pgTable('extra_charge_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  label: text('label').notNull(),
  type: text('type').notNull(),
  value: integer('value').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const customerVisits = pgTable('customer_visits', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull(),
  billId: uuid('bill_id'),
  tableId: uuid('table_id'),
  orderAt: timestamp('order_at').defaultNow().notNull(),
  checkInAt: timestamp('check_in_at'),
  checkOutAt: timestamp('check_out_at'),
  durationMinutes: integer('duration_minutes'),
  totalSpent: integer('total_spent').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ---------- Marketing & Campaigns ----------

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  value: integer('value').notNull(),
  minOrderAmount: integer('min_order_amount').default(0).notNull(),
  appliesTo: text('applies_to').default('all').notNull(),
  targetIds: jsonb('target_ids'),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  perCustomerLimit: integer('per_customer_limit').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  discountId: uuid('discount_id').notNull(),
  code: text('code').notNull(),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0).notNull(),
  perUserLimit: integer('per_user_limit').default(1).notNull(),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const couponUses = pgTable('coupon_uses', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id').notNull(),
  customerPhone: text('customer_phone').notNull(),
  orderId: uuid('order_id').notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull()
});

export const storefrontNotifications = pgTable('storefront_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  type: text('type').default('banner').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  ctaText: text('cta_text'),
  ctaUrl: text('cta_url'),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at').notNull(),
  target: text('target').default('all').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ---------- Store Settings & Customisation ----------

export const storeSettings = pgTable('store_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  storeName: text('store_name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  gstin: text('gstin'),
  currency: text('currency').default('INR').notNull(),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const branding = pgTable('branding', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  primaryColor: text('primary_color').default('#F59E0B').notNull(),
  secondaryColor: text('secondary_color').default('#C2410C').notNull(),
  backgroundColor: text('background_color').default('#FAFAF7').notNull(),
  fontFamily: text('font_family').default('DM Sans').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const storefrontConfig = pgTable('storefront_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  slug: text('slug').notNull(),
  domain: text('domain'),
  isActive: boolean('is_active').default(true).notNull(),
  allowOnlineOrders: boolean('allow_online_orders').default(true).notNull(),
  allowPayAtCounter: boolean('allow_pay_at_counter').default(true).notNull(),
  taxRatePercent: integer('tax_rate_percent').default(5).notNull(),
  serviceChargePercent: integer('service_charge_percent').default(5).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const paymentIntegrations = pgTable('payment_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  provider: text('provider').default('razorpay').notNull(),
  keyId: text('key_id').notNull(),
  keySecret: text('key_secret').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const blogs = pgTable('blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content').notNull(),
  heroImageUrl: text('hero_image_url'),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
