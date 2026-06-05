# Cafe Canvas — Product Manager Analysis Report (v3.0)

This document contains the detailed product analysis, user stories, business rules, security mappings, and subscription structures for **Cafe Canvas**, a multi-tenant SaaS platform built for Indian restaurant operations.

---

## 1.1 User Stories

### SUPER_ADMIN
1. **As a Super Admin**, I want to onboard a new tenant brand and assign their initial subscription tier (Free, Pro, Growth, or Enterprise) so they can access the platform.
2. **As a Super Admin**, I want to view platform-wide revenue statistics, total tenant count, and active locations to monitor system health and growth.
3. **As a Super Admin**, I want to search and inspect any tenant's data (without access role restriction) to provide immediate customer support or resolve billing disputes.
4. **As a Super Admin**, I want to read, resolve, and close bug reports and platform feedback submitted by restaurant owners to improve Cafe Canvas.
5. **As a Super Admin**, I want to write internal notes about a tenant's account (e.g., custom enterprise agreements, support history) to keep our team informed.
6. **As a Super Admin**, I want to suspend a tenant's account if their invoice remains unpaid so that we enforce subscription terms.
7. **As a Super Admin**, I want to configure the platform-wide subscription limits and limits per tier (number of locations, items) to adapt pricing structures.
8. **As a Super Admin**, I want to force-expire active sessions for a tenant's owner account when a security breach is reported to protect customer data.

### OWNER
1. **As an Owner**, I want to log in using my email/password or my permanent private ID (`CC-XXXXX`) to access my brand dashboard.
2. **As an Owner**, I want to configure my restaurant settings (CGST, SGST, UPI ID, accepted payment methods, and business address) to ensure correct taxation and bill calculation.
3. **As an Owner**, I want to add managers, cashiers, and kitchen staff, assigning them roles and auto-generating their POS login credentials (e.g., `brand#1001`) to secure access controls.
4. **As an Owner**, I want to upgrade or downgrade my subscription tier (Free, Pro, Growth, Enterprise) to align Cafe Canvas capabilities with my business scale.
5. **As an Owner**, I want to configure my storefront branding (theme, fonts, custom colors, and hero banner text) to present a polished digital menu to my customers.
6. **As an Owner**, I want to view detailed analytics (daily revenue, top-selling items, average order values, and hourly heatmaps) to optimize staff shifts and menu items.
7. **As an Owner**, I want to create offer codes and discount rules (percentage or flat discount) to drive footfall and marketing campaigns.
8. **As an Owner**, I want to write and publish blog posts to my customer storefront to engage with guests and share updates/events.

### MANAGER
1. **As a Manager**, I want to view incoming storefront orders and verify them before marking them as Confirmed, ensuring kitchen staff only prepare valid orders.
2. **As a Manager**, I want to manage the active menu categories, items, and modifier groups/options to handle daily kitchen ingredient availability.
3. **As a Manager**, I want to map dining tables (table numbers, sections, capacities) on our floor plan to reflect the physical dining space accurately.
4. **As a Manager**, I want to coordinate shift schedules and approve leave requests for cashiers and kitchen staff to keep the restaurant adequately staffed.
5. **As a Manager**, I want to track raw inventory levels, add inventory transactions (purchases/returns), and configure stock alerts to prevent running out of key ingredients.
6. **As a Manager**, I want to view customer feedback profiles (names, phones, ratings, revisit intent) to address negative reviews and maintain high satisfaction.
7. **As a Manager**, I want to run promotional marketing campaigns by selecting target lists from our customer CRM history to increase repeat business.
8. **As a Manager**, I want to review staff activity feeds and shift check-ins to monitor team compliance and performance.

### CASHIER
1. **As a Cashier**, I want to quickly log in to the POS app using my synthetic credentials and a 4-digit unlock PIN for fast terminal access between transactions.
2. **As a Cashier**, I want to enter in-person (POS) orders, customize them with item modifiers, and automatically mark them as Confirmed to send them straight to the kitchen.
3. **As a Cashier**, I want to generate bills for active tables or orders, applying offer codes if requested, to process checkouts.
4. **As a Cashier**, I want to record payments made via Cash, UPI (confirming the transaction status), or physical Card reader manually to mark bills as Paid.
5. **As a Cashier**, I want to trigger voiding or billing corrections (with mandatory manager approval notes) to fix transaction errors.
6. **As a Cashier**, I want to view active table sessions (duration, current total, number of customers) to manage table turnover and seat waiting guests.
7. **As a Cashier**, I want to receive real-time notifications on my POS screen when a customer at a table scans a QR code and calls for assistance.
8. **As a Cashier**, I want to print physical thermal receipts using ESC/POS commands directly from the tablet or POS computer for customers.

### KITCHEN
1. **As a Kitchen Staff**, I want to view incoming orders sorted by time and status on the wall-mounted KDS screen to prioritize meal prep.
2. **As a Kitchen Staff**, I want to tap an order item to change its status from Pending/Confirmed to Preparing so that waitstaff and customers can track progress.
3. **As a Kitchen Staff**, I want to mark prepared items as Ready so they can be dispatched immediately to tables.
4. **As a Kitchen Staff**, I want to view item modifier choices clearly (e.g., "Extra Spicy", "Sugar-Free") on each order item card to prevent prep errors.
5. **As a Kitchen Staff**, I want to see a summarized "consolidated item view" (e.g., "Total 4 Butter Paneer Masala cooking") to prep bulk dishes efficiently.
6. **As a Kitchen Staff**, I want to mark specific menu items as "out of stock" (unavailable) directly from the KDS screen to prevent customers from placing unavailable orders.
7. **As a Kitchen Staff**, I want to receive audio alerts or visual flashing signals on the KDS screen when a new order arrives to ensure fast kitchen response.
8. **As a Kitchen Staff**, I want to view historical preparation times per dish to measure and maintain kitchen efficiency standards.

### CUSTOMER
1. **As a Customer**, I want to scan a QR code on my table to automatically establish a table session and browse the restaurant's branded digital menu.
2. **As a Customer**, I want to see clear labels for dietary preferences (Veg, Non-Veg, Egg, Gluten-Free) and ingredient modifiers (e.g., milk choices) to order safely.
3. **As a Customer**, I want to add items to my cart and submit a Dine-In order directly from my browser without registering a username/password.
4. **As a Customer**, I want to select my payment method (Cash or UPI) at the checkout screen.
5. **As a Customer**, I want to view the restaurant's UPI QR code showing the exact bill total and UPI ID so I can quickly pay via my UPI app.
6. **As a Customer**, I want to call for a waiter's assistance by pressing a "Call Staff" button on the storefront, receiving visual confirmation.
7. **As a Customer**, I want to track my order progress (Pending, Confirmed, Preparing, Ready, Served) in real time on a live tracking page.
8. **As a Customer**, I want to submit feedback (overall rating, food rating, service rating, comments) at the end of my meal to share my experience.

---

## 1.2 Feature Gap Analysis

To align all required features with our schema, we must map every business function to database elements, ensuring no gaps are left between the requirements and the DDL:

| Business Feature | Required Tables/Columns | Implied Gaps Addressed in Schema |
|---|---|---|
| **Single-Session Enforcement** | `tenant_sessions`, `staff_sessions` | Tracks active login session tokens (`token_hash`), IP, user agents, and `revoked_at` timestamp. Requires a database function to invalidate other tokens on insert. |
| **Storefront Customer Flow** | `table_sessions`, `dining_tables` | Table sessions must store `session_token` (UUID/Text), `table_number` (Integer), `tenant_id`, and tracking timestamps (`check_in_at`, `check_out_at`). |
| **UPI Payment QR** | `store_settings` | `store_settings` contains `upi_id` (Text) and `payment_methods` (Text[] check constraint) to configure storefront/POS checkout options. |
| **GST Taxation split** | `store_settings`, `bills`, `orders` | `store_settings` stores `cgst_percent` and `sgst_percent` (NUMERIC). `bills` and `orders` split financial amounts into `subtotal_paise`, `cgst_paise`, `sgst_paise`, and `total_paise` (all BIGINT/INTEGER). |
| **Offers & Discounts** | `offer_codes`, `discount_rules`, `coupon_redemptions` | Implements canonical `offer_codes` table + `discount_rules` with criteria like `min_order_amount_paise`, usage caps, and validity durations. |
| **CRM & Visit History** | `customers`, `customer_visits` | Links orders/bills to customer accounts using unique phone numbers. Counts total spend and visit frequencies via automated triggers. |
| **Inventory Alerts** | `inventory_items`, `inventory_transactions` | Tracks item levels, units, and `low_stock_threshold`. Triggers raise notification alerts when stock drops below threshold. |
| **Shift Management** | `staff_shifts`, `staff_accounts` | Shift attendance checks check-in and check-out logs, optionally capturing geo-coordinates and selfie verification URLs. |
| **Internal Feedback & Platform** | `platform_feedback`, `bug_reports`, `super_admin_notes` | Internal tickets, feedback, and notes associated with tenant IDs or specific users, accessible by `SUPER_ADMIN`. |

---

## 1.3 Business Rules Inventory (Database Constraints & Triggers)

The following 30+ rules are enforced directly at the PostgreSQL database level using table constraints, CHECK expressions, and automated triggers:

1. **Subtotal & Total >= 0**: `subtotal_paise`, `cgst_paise`, `sgst_paise`, and `total_paise` in `orders` and `bills` tables must be non-negative integers.
2. **Order Item Quantity >= 1**: `order_items.quantity` must be greater than or equal to 1.
3. **Offer Expiry Check**: `offer_codes.expiry_date` must be chronologically greater than `start_date`.
4. **Offer Code Unique per Tenant**: `offer_codes.code` must be unique within a single `tenant_id` scope (compound unique constraint).
5. **Staff ID Unique Format**: `staff_accounts.login_id` must match `^[a-z0-9\-]+#[0-9]{4}$` check pattern.
6. **Synthetic Auth Email Format**: `staff_accounts.auth_email` must end with `@staff.cafecanvas.bar`.
7. **Paise Integrity**: All columns storing monetary amounts must end in `_paise` and be declared as `INTEGER` or `BIGINT`. No floats allowed.
8. **Table Session Scope**: `table_sessions` must match the `tenant_id` of the referenced physical `dining_tables`.
9. **Staff Call Cooldown / Status**: `staff_calls.status` check constraint limits values to `'pending'`, `'acknowledged'`, or `'resolved'`.
10. **GST Percentage Range**: `store_settings.cgst_percent` and `sgst_percent` must be between `0.00` and `50.00`.
11. **Order Creation Restrictions**: Trigger blocks direct `INSERT` on `orders` and `order_items` tables from standard roles, routing them through the `create_order(...)` RPC function.
12. **Single-Session Validation**: `tenant_sessions` and `staff_sessions` must have unique token hashes.
13. **Subscription Tiers Constrained**: `tenants.plan` check constraint allows only `'Free'`, `'Pro'`, `'Growth'`, or `'Enterprise'`.
14. **Location Limits enforcement**: Trigger on `locations` table intercepts insert, checking the tenant's current active count against their subscription limit.
15. **Menu Item Limits enforcement**: Trigger on `menu_items` intercepts insert, checking the active menu items count against their subscription limit.
16. **Unique Active Table Session**: A dining table cannot have more than one active `table_session` (where `check_out_at IS NULL`) at any time.
17. **Void Order Approvals**: Orders cannot be marked as `'void'` or `'cancelled'` after being `'paid'` unless a cashier/manager ID is attached as the authorizer.
18. **Rating Bound Constraints**: All customer ratings in feedback must be integers between 1 and 5.
19. **Valid Leave Date Range**: `leave_requests.end_date` must be greater than or equal to `start_date`.
20. **Inventory Transaction Non-Zero**: `inventory_transactions.quantity` must not be zero (positive for additions, negative for consumption).
21. **Auto-Update updated_at**: Trigger on all tables automatically updates `updated_at` to `now()` on `UPDATE`.
22. **Tenant ID Non-Nullable**: Every tenant-scoped table enforces `tenant_id NOT NULL` referencing `tenants.id` on delete cascade.
23. **Order Status Workflow Constraint**: `orders.status` is checked against `'pending'`, `'confirmed'`, `'preparing'`, `'ready'`, `'served'`, `'paid'`, `'cancelled'`, `'void'`.
24. **Payment Transaction Amount**: `payment_transactions.amount_paise` must be greater than 0.
25. **UPI ID Format**: `store_settings.upi_id` must contain `@` to be a valid VPA (Virtual Payment Address).
26. **Offer Code Usage Guard**: Trigger verifies coupon use count does not exceed `max_uses` when coupon redemption is inserted.
27. **Refund Bounds**: Refund transaction amounts must not exceed the associated bill's `total_paise`.
28. **Staff Shift Schedule bounds**: `staff_shifts.end_time` must be chronologically after `start_time`.
29. **Valid Client-Safe Slug**: `tenants.slug` must be alphanumeric with dashes (slug format) and unique.
30. **No Orphan Modifiers**: `modifier_options` must point to an active `modifier_group`.
31. **Notification Reads Restriction**: `notification_reads` can only link to staff members belonging to the same tenant as the notification.

---

## 1.4 RLS Access Matrix (All Tables × Roles)

All tables must enforce Row Level Security. Below is the operational matrix showing permissions across user roles (using security definer functions to identify the calling user's tenant and role scope):

| Table Category / Table | Owner | Manager | Cashier | Kitchen | Customer (Anon) | Super Admin |
|---|---|---|---|---|---|---|
| **tenants** | SELECT / UPDATE | SELECT | SELECT | SELECT | SELECT (Public Info) | ALL |
| **tenant_sessions** | SELECT / DELETE | SELECT / DELETE | SELECT / DELETE | SELECT / DELETE | NONE | ALL |
| **locations** | ALL | SELECT | SELECT | SELECT | SELECT | ALL |
| **store_settings** | ALL | SELECT / UPDATE | SELECT | NONE | SELECT (GST Rates/UPI) | ALL |
| **storefront_config** | ALL | SELECT / UPDATE | SELECT | NONE | SELECT | ALL |
| **staff_accounts** | ALL | SELECT / UPDATE | SELECT (Own) | SELECT (Own) | NONE | ALL |
| **dining_tables** | ALL | ALL | SELECT / UPDATE | SELECT | SELECT | ALL |
| **table_sessions** | ALL | ALL | ALL | SELECT | INSERT / SELECT / UPDATE | ALL |
| **staff_calls** | ALL | ALL | ALL | SELECT | INSERT / SELECT | ALL |
| **orders** | ALL | ALL | ALL | SELECT | INSERT* / SELECT* | ALL |
| **order_items** | ALL | ALL | ALL | SELECT / UPDATE | INSERT* / SELECT* | ALL |
| **bills** | ALL | ALL | ALL | NONE | SELECT* | ALL |
| **payment_transactions** | ALL | ALL | ALL | NONE | SELECT* / INSERT* | ALL |
| **customers** | ALL | ALL | ALL | NONE | INSERT* / SELECT* | ALL |
| **inventory_items** | ALL | ALL | SELECT | SELECT (KDS availability) | NONE | ALL |
| **inventory_transactions** | ALL | ALL | NONE | NONE | NONE | ALL |
| **offer_codes** | ALL | ALL | SELECT | NONE | SELECT (Valid Codes) | ALL |
| **discount_rules** | ALL | ALL | SELECT | NONE | SELECT | ALL |
| **coupon_redemptions** | ALL | ALL | SELECT | NONE | INSERT* / SELECT* | ALL |
| **blog_posts** | ALL | ALL | SELECT | NONE | SELECT (Published) | ALL |
| **notifications** | ALL | ALL | SELECT | SELECT | NONE | ALL |
| **notification_reads** | ALL | ALL | SELECT / INSERT | SELECT / INSERT | NONE | ALL |
| **daily_revenue_snapshots** | ALL | SELECT | NONE | NONE | NONE | ALL |
| **analytics_events** | ALL | SELECT | NONE | NONE | INSERT (Anonymized click) | ALL |
| **platform_feedback** | ALL | ALL | NONE | NONE | NONE | ALL |
| **bug_reports** | ALL | ALL | ALL | ALL | NONE | ALL |
| **super_admin_notes** | NONE | NONE | NONE | NONE | NONE | ALL |

*\*Customer access is strictly limited to their own active session token.*

---

## 1.5 Subscription Feature Gate Map

We implement 4 explicit, exact subscription tiers: `Free`, `Pro`, `Growth`, and `Enterprise`. The platform enforces these gates at the database level:

| Feature / Limit | Free | Pro | Growth | Enterprise |
|---|---|---|---|---|
| **Max Locations (Branches)** | 1 | 3 | 10 | Unlimited |
| **Max Menu Items** | 50 | 500 | Unlimited | Unlimited |
| **Analytics Dashboard** | None | Basic | Full Dashboard | Full + API Access |
| **Customer Marketing / CRM** | Disabled | Coupons Only | Full Campaigns | Full Custom |
| **Blog System** | Disabled | Enabled | Enabled | Enabled |
| **Custom Storefront Domain** | Disabled | Disabled | Disabled | Enabled |
| **API / Webhook Integration** | Disabled | Disabled | Enabled | Enabled |
| **Staff Calls System** | Enabled | Enabled | Enabled | Enabled |

---

## 1.6 Realtime Event Catalog

Using Supabase Realtime, Cafe Canvas broadcasts the following database events to active client applications. The RLS policies automatically filter events so that clients only receive changes matching their tenant ID:

1. **Channel: `tenant-{tenantId}-ops`**
   - **Event: `staff_call`**: Inserted row on `staff_calls` table. Broadcasts `{table_number, call_id, status}` to notify POS staff.
   - **Event: `new_order`**: Inserted row on `orders` table. Broadcasts `{order_id, table_number, total_paise, source}` to POS terminals and KDS wall displays.
   - **Event: `order_update`**: Updated status on `orders` table. Broadcasts `{order_id, status, table_number}` to update customer storefront order-tracking page and staff POS dashboard.
   - **Event: `kds_update`**: Updated `kds_status` on `order_items` table. Broadcasts `{order_id, item_id, kds_status}` to update cashier POS and customer track screen.
   - **Event: `stock_alert`**: Updated stock on `inventory_items` table below `low_stock_threshold`. Broadcasts `{item_id, name, current_stock}` to managers and cashiers.

---

## 1.7 Edge Cases & Risk Register

1. **Simultaneous Waiter and Customer Order Submissions**:
   - *Risk*: A waiter at the POS and a customer at the table submit orders for the same table session simultaneously, creating duplicate or conflicting records.
   - *Resolution*: The database order creation RPC (`create_order`) wraps the insert in a serial transaction block, locking the table session ID using `SELECT FOR UPDATE` and consolidating orders or rejecting duplicates.
2. **GST Mode Changes mid-day**:
   - *Risk*: The manager changes CGST/SGST tax percentage or sets mode from Inclusive to Exclusive during business hours.
   - *Resolution*: The `bills` and `orders` tables store snapshot values (`cgst_rate_at_order`, `sgst_rate_at_order`) alongside calculated paise values, ensuring historical order bills are not affected by settings updates.
3. **Session Token Expiry on Checkout**:
   - *Risk*: Customer leaves without completing checkout, leaving their `table_sessions` row open indefinitely.
   - *Resolution*: An automated background clean-up function (`cron_cleanup`) runs daily, identifying and automatically closing active sessions older than 4 hours.
4. **Offline Desktop POS Sync Conflicts**:
   - *Risk*: Electron POS goes offline, takes orders, and syncs them back later, causing sequence collisions or timestamp overlaps.
   - *Resolution*: POS client assigns unique client-side UUIDs for orders. The database handles upserts by client UUID, and the sync trigger updates the `created_at` timestamp based on client submission, validating against the active table session.
