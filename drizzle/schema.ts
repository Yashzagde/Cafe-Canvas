import { pgTable, uuid, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// 1. PRE-REGISTRATIONS (Landing Page)
export const preRegistrations = pgTable('pre_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  restaurantName: text('restaurant_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. TENANTS
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  mode: text('mode').notNull().default('SINGLE_STORE'), // 'SINGLE_STORE' | 'MULTI_BRANCH'
  maxSubaccounts: integer('max_subaccounts').notNull().default(50),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'INACTIVE'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. BRANCHES
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'INACTIVE'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. USERS (Accounts linked to Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(), // Match auth.users.id
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }), // NULL for PLATFORM_ADMIN
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }), // NULL for MULTI_BRANCH executive / owner
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 256 }),
  role: text('role').notNull(), // 'PLATFORM_ADMIN' | 'TENANT_OWNER' | 'BRANCH_ADMIN' | 'MANAGER' | 'STAFF' | 'KOS'
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'INACTIVE'
  pinHash: text('pin_hash'), // For quick floor tablet switching
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. MENU CATEGORIES
export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. MENU ITEMS
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // stored in paise / cents
  imageUrl: text('image_url'),
  status: text('status').notNull().default('available'), // 'available' | 'unavailable' | 'hidden'
  allowsModifiers: boolean('allows_modifiers').notNull().default(false),
  discountEligible: boolean('discount_eligible').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. MODIFIER GROUPS
export const modifierGroups = pgTable('modifier_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  required: boolean('required').notNull().default(false),
  minSelect: integer('min_select').notNull().default(0),
  maxSelect: integer('max_select').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. MODIFIER OPTIONS
export const modifierOptions = pgTable('modifier_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  extraPrice: integer('extra_price').notNull().default(0), // stored in paise / cents
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 9. TABLES
export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull().default(2),
  section: text('section').notNull().default('Main Floor'), // 'Main Floor', 'Rooftop', 'Bar' etc.
  position: jsonb('position').notNull().default({ x: 0, y: 0 }), // coordinates for floor maps
  status: text('status').notNull().default('available'), // 'available' | 'occupied' | 'reserved' | 'cleaning'
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. CUSTOMERS
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 256 }).notNull(),
  notes: text('notes'),
  tags: jsonb('tags').default([]), // customer preferences/tags
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 11. ORDERS
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'paid' | 'cancelled'
  source: text('source').notNull().default('staff_app'), // 'staff_app' | 'digital_menu' | 'admin'
  subtotal: integer('subtotal').notNull().default(0), // paise
  discountAmount: integer('discount_amount').notNull().default(0), // paise
  extraCharges: jsonb('extra_charges').default([]), // array of fees applied
  total: integer('total').notNull().default(0), // paise
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 12. ORDER ITEMS
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(), // paise, snapshotted
  modifierSelections: jsonb('modifier_selections').default([]), // list of chosen extra modifiers
  itemName: text('item_name').notNull(), // snapshotted menu item name
  itemNotes: text('item_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 13. BILLS
export const bills = pgTable('bills', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  orders: jsonb('orders').notNull(), // array of order UUIDs linked
  subtotal: integer('subtotal').notNull(), // paise
  tax: integer('tax').notNull().default(0), // paise
  discountAmount: integer('discount_amount').notNull().default(0), // paise
  extraCharges: jsonb('extra_charges').default([]), // JSON array
  total: integer('total').notNull(), // paise
  status: text('status').notNull().default('open'), // 'open' | 'paid' | 'cancelled'
  paymentMethod: text('payment_method'), // 'cash' | 'card' | 'upi' | 'other'
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 14. TABLE SESSIONS
export const tableSessions = pgTable('table_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableId: uuid('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  checkInAt: timestamp('check_in_at', { withTimezone: true }).defaultNow().notNull(),
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  totalRevenue: integer('total_revenue').notNull().default(0), // paise
  customerCount: integer('customer_count').notNull().default(1),
  assignedStaffId: uuid('assigned_staff_id').references(() => users.id, { onDelete: 'set null' }),
  billId: uuid('bill_id').references(() => bills.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 15. EXTRA CHARGE TEMPLATES
export const extraChargeTemplates = pgTable('extra_charge_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // e.g. 'Service Charge', 'CGST'
  type: text('type').notNull(), // 'fixed' | 'percent'
  value: integer('value').notNull(), // fixed amount in paise OR percentage value * 100 (e.g. 5.5% represented as 550)
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 16. CUSTOMER VISITS
export const customerVisits = pgTable('customer_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  billId: uuid('bill_id').references(() => bills.id, { onDelete: 'set null' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  orderAt: timestamp('order_at', { withTimezone: true }).defaultNow().notNull(),
  checkInAt: timestamp('check_in_at', { withTimezone: true }),
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  totalSpent: integer('total_spent').notNull().default(0), // paise
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 17. DISCOUNTS
export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'percent' | 'fixed'
  value: integer('value').notNull(), // percent * 100 OR fixed paise
  minOrderAmount: integer('min_order_amount').notNull().default(0), // paise
  appliesTo: text('applies_to').notNull().default('all'), // 'all' | 'category' | 'item'
  targetIds: jsonb('target_ids').default([]), // categories or items list
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').notNull().default(0),
  perCustomerLimit: integer('per_customer_limit').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 18. COUPONS
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  discountId: uuid('discount_id').notNull().references(() => discounts.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  perUserLimit: integer('per_user_limit').notNull().default(1),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 19. COUPON USES
export const couponUses = pgTable('coupon_uses', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  customerPhone: varchar('customer_phone', { length: 256 }).notNull(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  usedAt: timestamp('used_at', { withTimezone: true }).defaultNow().notNull(),
});

// 20. STOREFRONT NOTIFICATIONS
export const storefrontNotifications = pgTable('storefront_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('banner'), // 'popup' | 'banner' | 'toast'
  title: text('title').notNull(),
  body: text('body').notNull(),
  ctaText: text('cta_text'),
  ctaUrl: text('cta_url'),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  target: text('target').notNull().default('all'), // 'all' | 'table' | 'online'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 21. STORE SETTINGS
export const storeSettings = pgTable('store_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  storeName: text('store_name').notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 256 }),
  email: varchar('email', { length: 256 }),
  gstin: varchar('gstin', { length: 256 }),
  openingHours: jsonb('opening_hours').default({}), // hours schedule JSON
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 22. BRANDING
export const branding = pgTable('branding', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  logoUrl: text('logo_url'),
  heroImageUrls: jsonb('hero_image_urls').default([]), // array of background graphics
  primaryColor: varchar('primary_color', { length: 7 }).default('#6366f1'), // Hex values
  accentColor: varchar('accent_color', { length: 7 }).default('#10b981'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 23. STOREFRONT CONFIG
export const storefrontConfig = pgTable('storefront_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  theme: text('theme').notNull().default('classic'), // 'classic' | 'modern' | 'dark' | 'minimal' | 'vibrant'
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  isPublic: boolean('is_public').notNull().default(true),
  customDomain: varchar('custom_domain', { length: 256 }),
  domainVerified: boolean('domain_verified').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 24. PAYMENT INTEGRATIONS
export const paymentIntegrations = pgTable('payment_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'razorpay' | 'stripe'
  encryptedConfig: jsonb('encrypted_config').notNull(), // AES-256 encrypted fields
  isActive: boolean('is_active').notNull().default(false),
  connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
});

// 25. BLOGS
export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 256 }).notNull(),
  content: text('content').notNull(),
  heroImageUrl: text('hero_image_url'),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
