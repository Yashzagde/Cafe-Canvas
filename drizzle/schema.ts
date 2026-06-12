import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, doublePrecision } from "drizzle-orm/pg-core";

// ---------- SaaS Tenants & Locations ----------

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  logoUrl: text('logo_url'),
  subscriptionTier: text('subscription_tier').default('Free').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  phone: text('phone'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Staff Accounts (Sub-accounts) ----------

export const staffAccounts = pgTable('staff_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),
  authUserId: uuid('auth_user_id').unique(),
  fullName: text('full_name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  role: text('role').default('staff').notNull(),
  pin: text('pin'),
  fcmToken: text('fcm_token'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Store Settings & Config ----------

export const storeSettings = pgTable('store_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull().unique(),
  currency: text('currency').default('INR').notNull(),
  taxCgst: integer('tax_cgst').default(250).notNull(), // in base points (2.5% = 250)
  taxSgst: integer('tax_sgst').default(250).notNull(),
  taxInclusive: boolean('tax_inclusive').default(false).notNull(),
  razorpayKeyId: text('razorpay_key_id'),
  upiId: text('upi_id'),
  activeGateway: text('active_gateway').default('razorpay').notNull(),
  phonepeMerchantId: text('phonepe_merchant_id'),
  phonepeTerminalId: text('phonepe_terminal_id'),
  googlepayMerchantId: text('googlepay_merchant_id'),
  googlepayTerminalId: text('googlepay_terminal_id'),
  paytmMerchantId: text('paytm_merchant_id'),
  paytmTerminalId: text('paytm_terminal_id'),
  bharatpeMerchantId: text('bharatpe_merchant_id'),
  bharatpeTerminalId: text('bharatpe_terminal_id'),
  openTime: text('open_time'),
  closeTime: text('close_time'),
  receiptHeader: text('receipt_header'),
  receiptFooter: text('receipt_footer').default('Thank you! Visit again.').notNull(),
  serviceChargeType: text('service_charge_type').default('none').notNull(),
  serviceChargeValue: doublePrecision('service_charge_value').default(0.00).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const storefrontConfig = pgTable('storefront_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull().unique(),
  themeId: text('theme_id').default('theme-01').notNull(),
  primaryColor: text('primary_color').default('#ff6b6b').notNull(),
  accentColor: text('accent_color').default('#4ecdc4').notNull(),
  fontHeading: text('font_heading').default('Outfit').notNull(),
  fontBody: text('font_body').default('Inter').notNull(),
  bannerText: text('banner_text'),
  showPrices: boolean('show_prices').default(true).notNull(),
  allowOrders: boolean('allow_orders').default(true).notNull(),
  showBlog: boolean('show_blog').default(false).notNull(),
  showReviews: boolean('show_reviews').default(true).notNull(),
  showInstagram: boolean('show_instagram').default(true).notNull(),
  showStory: boolean('show_story').default(true).notNull(),
  heroImageUrl: text('hero_image_url'),
  heroImageUrl2: text('hero_image_url_2'),
  heroImageUrl3: text('hero_image_url_3'),
  logoUrl: text('logo_url'),
  footerDescription: text('footer_description'),
  footerHours: text('footer_hours'),
  footerAddress: text('footer_address'),
  footerPhone: text('footer_phone'),
  footerEmail: text('footer_email'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  heroTitle2: text('hero_title_2'),
  heroSubtitle2: text('hero_subtitle_2'),
  heroTitle3: text('hero_title_3'),
  heroSubtitle3: text('hero_subtitle_3'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const storefrontBlogs = pgTable('storefront_blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  author: text('author').default('Chef Barista').notNull(),
  tags: text('tags').array().default([]).notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ---------- Menu Management ----------

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  nameHi: text('name_hi'),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  nameHi: text('name_hi'),
  description: text('description'),
  price: integer('price').notNull(), // in paise
  comparePrice: integer('compare_price'),
  imageUrl: text('image_url'),
  isAvailable: boolean('is_available').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  dietaryTags: text('dietary_tags').array().default([]).notNull(),
  prepTimeMins: integer('prep_time_mins').default(10).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const modifierGroups = pgTable('modifier_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  minSelect: integer('min_select').default(0).notNull(),
  maxSelect: integer('max_select').default(1).notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const modifierOptions = pgTable('modifier_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => modifierGroups.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  price: integer('price').default(0).notNull(), // in paise
  isAvailable: boolean('is_available').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Tables & Customer Sessions ----------

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }).notNull(),
  branchId: uuid('branch_id').references(() => locations.id, { onDelete: 'cascade' }),
  tableNumber: integer('table_number'),
  name: text('name'),
  capacity: integer('capacity').default(4).notNull(),
  section: text('section'),
  qrToken: text('qr_token'),
  status: text('status').default('vacant').notNull(),
  positionX: integer('position_x').default(0).notNull(),
  positionY: integer('position_y').default(0).notNull(),
  floorX: integer('floor_x'),
  floorY: integer('floor_y'),
  qrVersion: integer('qr_version').default(1),
  qrGeneratedAt: timestamp('qr_generated_at').defaultNow(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tableSessions = pgTable('table_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  pax: integer('pax').default(1).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  orderIds: uuid('order_ids').array().default([]).notNull()
});

// ---------- Orders & Invoicing ----------

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }).notNull(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  staffId: uuid('staff_id').references(() => staffAccounts.id, { onDelete: 'set null' }),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  status: text('status').default('pending').notNull(),
  orderType: text('order_type').default('dine_in').notNull(),
  subtotal: integer('subtotal').notNull(), // in paise
  taxAmount: integer('tax_amount').default(0).notNull(), // in paise
  discountAmount: integer('discount_amount').default(0).notNull(), // in paise
  total: integer('total').notNull(), // in paise
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  itemName: text('item_name').notNull(),
  unitPrice: integer('unit_price').notNull(), // in paise
  quantity: integer('quantity').default(1).notNull(),
  modifierDetails: text('modifier_details'),
  modifiers: jsonb('modifiers').default('[]').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  orderIds: uuid('order_ids').array().default([]).notNull(),
  tableNumber: integer('table_number'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  subtotal: integer('subtotal').notNull(), // in paise
  cgst: integer('cgst').default(0).notNull(), // in paise
  sgst: integer('sgst').default(0).notNull(), // in paise
  discountAmount: integer('discount_amount').default(0).notNull(), // in paise
  total: integer('total').notNull(), // in paise
  status: text('status').default('unpaid').notNull(),
  paymentMethod: text('payment_method'),
  createdBy: uuid('created_by').references(() => staffAccounts.id, { onDelete: 'set null' }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Staff Calls & CRM ----------

export const staffCalls = pgTable('staff_calls', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'cascade' }).notNull(),
  tableNumber: integer('table_number'),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),
  phone: text('phone').notNull(),
  email: text('email'),
  totalVisits: integer('total_visits').default(0).notNull(),
  totalSpent: integer('total_spent').default(0).notNull(), // in paise
  lastVisitAt: timestamp('last_visit_at'),
  notes: text('notes'),
  tags: text('tags').array().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Marketing & CRM ----------

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  value: integer('value').notNull(), // flat = paise, percentage = rate
  minOrderAmount: integer('min_order_amount').default(0).notNull(), // in paise
  maxDiscount: integer('max_discount'), // in paise
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').unique().notNull(),
  discountId: uuid('discount_id').references(() => discounts.id, { onDelete: 'cascade' }).notNull(),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------- Notifications ----------

export const notificationLog = pgTable('notification_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').default(false).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull()
});
