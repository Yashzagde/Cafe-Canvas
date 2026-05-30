"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogs = exports.paymentIntegrations = exports.storefrontConfig = exports.branding = exports.storeSettings = exports.storefrontNotifications = exports.couponUses = exports.coupons = exports.discounts = exports.customerVisits = exports.extraChargeTemplates = exports.tableSessions = exports.bills = exports.orderItems = exports.orders = exports.customers = exports.tables = exports.modifierOptions = exports.modifierGroups = exports.menuItems = exports.menuCategories = exports.preRegistrations = exports.users = exports.branches = exports.tenants = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// ---------- SaaS Tenants & Branches ----------
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    mode: (0, pg_core_1.text)('mode').default('SINGLE_STORE').notNull(),
    maxSubaccounts: (0, pg_core_1.integer)('max_subaccounts').default(50).notNull(),
    status: (0, pg_core_1.text)('status').default('ACTIVE').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.branches = (0, pg_core_1.pgTable)('branches', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    status: (0, pg_core_1.text)('status').default('ACTIVE').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// ---------- Core Users ----------
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id'),
    branchId: (0, pg_core_1.uuid)('branch_id'),
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    email: (0, pg_core_1.text)('email'),
    phone: (0, pg_core_1.text)('phone'),
    role: (0, pg_core_1.text)('role'),
    status: (0, pg_core_1.text)('status').default('ACTIVE'),
    pinHash: (0, pg_core_1.text)('pin_hash'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.preRegistrations = (0, pg_core_1.pgTable)('pre_registrations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.text)('email').notNull(),
    restaurantName: (0, pg_core_1.text)('restaurant_name'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
});
// ---------- Menu & Modifier Management ----------
exports.menuCategories = (0, pg_core_1.pgTable)('menu_categories', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    isVisible: (0, pg_core_1.boolean)('is_visible').default(true).notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.menuItems = (0, pg_core_1.pgTable)('menu_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    categoryId: (0, pg_core_1.uuid)('category_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.integer)('price').notNull(),
    imageUrl: (0, pg_core_1.text)('image_url'),
    status: (0, pg_core_1.text)('status').default('available').notNull(),
    allowsModifiers: (0, pg_core_1.boolean)('allows_modifiers').default(false).notNull(),
    discountEligible: (0, pg_core_1.boolean)('discount_eligible').default(true).notNull(),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.modifierGroups = (0, pg_core_1.pgTable)('modifier_groups', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    itemId: (0, pg_core_1.uuid)('item_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    required: (0, pg_core_1.boolean)('required').default(false).notNull(),
    minSelect: (0, pg_core_1.integer)('min_select').default(0).notNull(),
    maxSelect: (0, pg_core_1.integer)('max_select').default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.modifierOptions = (0, pg_core_1.pgTable)('modifier_options', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    groupId: (0, pg_core_1.uuid)('group_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    extraPrice: (0, pg_core_1.integer)('extra_price').default(0).notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// ---------- Tables & Customer Sessions ----------
exports.tables = (0, pg_core_1.pgTable)('tables', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    capacity: (0, pg_core_1.integer)('capacity').default(2).notNull(),
    section: (0, pg_core_1.text)('section').default('Main Floor').notNull(),
    position: (0, pg_core_1.jsonb)('position').notNull(),
    status: (0, pg_core_1.text)('status').default('available').notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.customers = (0, pg_core_1.pgTable)('customers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull(),
    notes: (0, pg_core_1.text)('notes'),
    tags: (0, pg_core_1.jsonb)('tags'),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// ---------- Orders & Invoicing ----------
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    tableId: (0, pg_core_1.uuid)('table_id'),
    customerId: (0, pg_core_1.uuid)('customer_id'),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    status: (0, pg_core_1.text)('status').default('pending').notNull(),
    source: (0, pg_core_1.text)('source').default('staff_app').notNull(),
    subtotal: (0, pg_core_1.integer)('subtotal').default(0).notNull(),
    discountAmount: (0, pg_core_1.integer)('discount_amount').default(0).notNull(),
    extraCharges: (0, pg_core_1.jsonb)('extra_charges'),
    total: (0, pg_core_1.integer)('total').default(0).notNull(),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    orderId: (0, pg_core_1.uuid)('order_id').notNull(),
    menuItemId: (0, pg_core_1.uuid)('menu_item_id'),
    quantity: (0, pg_core_1.integer)('quantity').default(1).notNull(),
    unitPrice: (0, pg_core_1.integer)('unit_price').notNull(),
    modifierSelections: (0, pg_core_1.jsonb)('modifier_selections'),
    itemName: (0, pg_core_1.text)('item_name').notNull(),
    itemNotes: (0, pg_core_1.text)('item_notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.bills = (0, pg_core_1.pgTable)('bills', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    tableId: (0, pg_core_1.uuid)('table_id'),
    orders: (0, pg_core_1.jsonb)('orders').notNull(),
    subtotal: (0, pg_core_1.integer)('subtotal').notNull(),
    tax: (0, pg_core_1.integer)('tax').default(0).notNull(),
    discountAmount: (0, pg_core_1.integer)('discount_amount').default(0).notNull(),
    extraCharges: (0, pg_core_1.jsonb)('extra_charges'),
    total: (0, pg_core_1.integer)('total').notNull(),
    status: (0, pg_core_1.text)('status').default('open').notNull(),
    paymentMethod: (0, pg_core_1.text)('payment_method'),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.tableSessions = (0, pg_core_1.pgTable)('table_sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tableId: (0, pg_core_1.uuid)('table_id').notNull(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    checkInAt: (0, pg_core_1.timestamp)('check_in_at').defaultNow().notNull(),
    checkOutAt: (0, pg_core_1.timestamp)('check_out_at'),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes'),
    totalRevenue: (0, pg_core_1.integer)('total_revenue').default(0).notNull(),
    customerCount: (0, pg_core_1.integer)('customer_count').default(1).notNull(),
    assignedStaffId: (0, pg_core_1.uuid)('assigned_staff_id'),
    billId: (0, pg_core_1.uuid)('bill_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.extraChargeTemplates = (0, pg_core_1.pgTable)('extra_charge_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    label: (0, pg_core_1.text)('label').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    value: (0, pg_core_1.integer)('value').notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.customerVisits = (0, pg_core_1.pgTable)('customer_visits', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    customerId: (0, pg_core_1.uuid)('customer_id').notNull(),
    billId: (0, pg_core_1.uuid)('bill_id'),
    tableId: (0, pg_core_1.uuid)('table_id'),
    orderAt: (0, pg_core_1.timestamp)('order_at').defaultNow().notNull(),
    checkInAt: (0, pg_core_1.timestamp)('check_in_at'),
    checkOutAt: (0, pg_core_1.timestamp)('check_out_at'),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes'),
    totalSpent: (0, pg_core_1.integer)('total_spent').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// ---------- Marketing & Campaigns ----------
exports.discounts = (0, pg_core_1.pgTable)('discounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    value: (0, pg_core_1.integer)('value').notNull(),
    minOrderAmount: (0, pg_core_1.integer)('min_order_amount').default(0).notNull(),
    appliesTo: (0, pg_core_1.text)('applies_to').default('all').notNull(),
    targetIds: (0, pg_core_1.jsonb)('target_ids'),
    validFrom: (0, pg_core_1.timestamp)('valid_from').notNull(),
    validUntil: (0, pg_core_1.timestamp)('valid_until').notNull(),
    usageLimit: (0, pg_core_1.integer)('usage_limit'),
    usedCount: (0, pg_core_1.integer)('used_count').default(0).notNull(),
    perCustomerLimit: (0, pg_core_1.integer)('per_customer_limit').default(1).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.coupons = (0, pg_core_1.pgTable)('coupons', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    discountId: (0, pg_core_1.uuid)('discount_id').notNull(),
    code: (0, pg_core_1.text)('code').notNull(),
    maxUses: (0, pg_core_1.integer)('max_uses'),
    usedCount: (0, pg_core_1.integer)('used_count').default(0).notNull(),
    perUserLimit: (0, pg_core_1.integer)('per_user_limit').default(1).notNull(),
    validUntil: (0, pg_core_1.timestamp)('valid_until'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.couponUses = (0, pg_core_1.pgTable)('coupon_uses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    couponId: (0, pg_core_1.uuid)('coupon_id').notNull(),
    customerPhone: (0, pg_core_1.text)('customer_phone').notNull(),
    orderId: (0, pg_core_1.uuid)('order_id').notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at').defaultNow().notNull()
});
exports.storefrontNotifications = (0, pg_core_1.pgTable)('storefront_notifications', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    type: (0, pg_core_1.text)('type').default('banner').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
    ctaText: (0, pg_core_1.text)('cta_text'),
    ctaUrl: (0, pg_core_1.text)('cta_url'),
    startAt: (0, pg_core_1.timestamp)('start_at').notNull(),
    endAt: (0, pg_core_1.timestamp)('end_at').notNull(),
    target: (0, pg_core_1.text)('target').default('all').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
// ---------- Store Settings & Customisation ----------
exports.storeSettings = (0, pg_core_1.pgTable)('store_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    storeName: (0, pg_core_1.text)('store_name').notNull(),
    address: (0, pg_core_1.text)('address'),
    phone: (0, pg_core_1.text)('phone'),
    email: (0, pg_core_1.text)('email'),
    gstin: (0, pg_core_1.text)('gstin'),
    currency: (0, pg_core_1.text)('currency').default('INR').notNull(),
    timezone: (0, pg_core_1.text)('timezone').default('Asia/Kolkata').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.branding = (0, pg_core_1.pgTable)('branding', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    logoUrl: (0, pg_core_1.text)('logo_url'),
    bannerUrl: (0, pg_core_1.text)('banner_url'),
    primaryColor: (0, pg_core_1.text)('primary_color').default('#F59E0B').notNull(),
    secondaryColor: (0, pg_core_1.text)('secondary_color').default('#C2410C').notNull(),
    backgroundColor: (0, pg_core_1.text)('background_color').default('#FAFAF7').notNull(),
    fontFamily: (0, pg_core_1.text)('font_family').default('DM Sans').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.storefrontConfig = (0, pg_core_1.pgTable)('storefront_config', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull(),
    domain: (0, pg_core_1.text)('domain'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    allowOnlineOrders: (0, pg_core_1.boolean)('allow_online_orders').default(true).notNull(),
    allowPayAtCounter: (0, pg_core_1.boolean)('allow_pay_at_counter').default(true).notNull(),
    taxRatePercent: (0, pg_core_1.integer)('tax_rate_percent').default(5).notNull(),
    serviceChargePercent: (0, pg_core_1.integer)('service_charge_percent').default(5).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.paymentIntegrations = (0, pg_core_1.pgTable)('payment_integrations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    provider: (0, pg_core_1.text)('provider').default('razorpay').notNull(),
    keyId: (0, pg_core_1.text)('key_id').notNull(),
    keySecret: (0, pg_core_1.text)('key_secret').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.blogs = (0, pg_core_1.pgTable)('blogs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    branchId: (0, pg_core_1.uuid)('branch_id').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    heroImageUrl: (0, pg_core_1.text)('hero_image_url'),
    isPublished: (0, pg_core_1.boolean)('is_published').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
