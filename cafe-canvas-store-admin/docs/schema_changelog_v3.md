# Cafe Canvas — Database Schema Changelog (v3.0)

This changelog outlines all database updates, structural changes, and deprecations introduced in the Cafe Canvas **v3.0 Database Schema Rewrite**.

---

## 1. Tables Added, Renamed, or Replaced

To avoid SQL keyword conflicts, normalize relationships, and secure multi-tenancy, the following structural table changes were made:

| Previous Table | New v3.0 Table | Scope & Reason |
|---|---|---|
| `branches` | `locations` | Renamed to better represent restaurant branch locations. |
| `users` | `staff_accounts` | Renamed to distinguish staff profiles from database auth users, supporting the synthetic login ID system (`slug#XXXX`). |
| `tables` | `dining_tables` | Renamed to avoid PostgreSQL keyword collision (`tables`) and clarify scope. |
| `blogs` | `blog_posts` | Renamed for clarity. Added `blog_categories` junction support. |
| `discounts` & `coupons` | `offer_codes` & `discount_rules` | Replaced by `offer_codes` (canonical name) and `discount_rules` (automatic/manual store discounts) for structured coupon management. |
| *(None)* | `tenant_sessions` | Added to track active web logins and support single-session enforcement. |
| *(None)* | `staff_sessions` | Added to track active staff POS/tablet logins. |
| *(None)* | `subscription_limits` | Added to gate max locations, max items, and marketing/blog access based on subscription tiers. |
| *(None)* | `bill_items` | Created to snapshot ordered items and modifier text at bill checkout, replacing raw JSONB storage in `bills`. |
| *(None)* | `payment_transactions` | Created for granular logging of Cash, UPI, and Card transactions. |
| *(None)* | `platform_feedback` | Internal ticketing system for staff feedback directly to the Cafe Canvas team. |
| *(None)* | `bug_reports` | Support ticket/bug tracking system. |
| *(None)* | `super_admin_notes` | Super Admin logs per tenant. |

---

## 2. Columns Added, Renamed, or Modified

### 2.1 String Type Standardization
* All text-based columns originally declared as `VARCHAR` (e.g. `VARCHAR(255)`) have been converted to `TEXT` type to prevent artificial length boundaries, except where business rules strictly require length limits.

### 2.2 Currency (Paise) Conversion
* All monetary columns are strictly typed as `INTEGER` or `BIGINT` and renamed to end with `_paise`. No float or decimal types are allowed:
  * `menu_items.price` $\rightarrow$ `menu_items.price_paise`
  * `modifier_options.extra_price` $\rightarrow$ `modifier_options.extra_price_paise`
  * `orders.subtotal`, `discount_amount`, `total` $\rightarrow$ `subtotal_paise`, `cgst_paise`, `sgst_paise`, `discount_paise`, `total_paise`
  * `bills.subtotal`, `tax`, `discount_amount`, `total` $\rightarrow$ `subtotal_paise`, `cgst_paise`, `sgst_paise`, `discount_paise`, `extra_charges_paise`, `total_paise`
  * `customers.total_spend` $\rightarrow$ `customers.total_spend_paise`
  * `inventory_transactions.unit_cost` $\rightarrow$ `inventory_transactions.unit_cost_paise`

### 2.3 Key Table Modifications
* **`tenants`**:
  * Added `slug` (Text, unique routing key).
  * Added `public_id` (12-char random alphanumeric URL key).
  * Added `private_id` (CC-XXXXX sequential support ID).
  * Added `email` (Text, unique owner email).
  * Enforced check constraint on `plan` (`'Free'`, `'Pro'`, `'Growth'`, `'Enterprise'`).
* **`store_settings`**:
  * Added `upi_id` (Text) and `payment_methods` (Text[] check constraint).
  * Removed `razorpay_key_id` and all third-party credentials.
* **`orders`**:
  * Added `source` (`'storefront'`, `'pos'`, `'admin'`).
  * Added `payment_method` (`'cash'`, `'upi'`, `'card'`).
  * Added `staff_verified` (Boolean).
  * Added `session_id` (UUID references `table_sessions.id`).
* **`staff_calls`**:
  * Enforced status values via check constraint (`'pending'`, `'acknowledged'`, `'resolved'`).

---

## 3. Functions & Triggers Added

1. **`create_order(...)`**:
   * *Purpose*: The **only** insert path for customer/POS orders. Calculates modifiers, applies CGST/SGST tax based on store inclusive/exclusive settings, verifies table sessions, and inserts into `orders`/`order_items`.
2. **`generate_bill(...)`**:
   * *Purpose*: Generates a customer receipt compiling orders, calculating CGST/SGST, and snapshotting items into `bill_items`.
3. **`apply_offer_code(...)`**:
   * *Purpose*: Validates offer code validity (expiry date, min spend amount, usage counts) and returns the paise discount amount.
4. **`generate_public_id()` & `assign_private_id()`**:
   * *Purpose*: Trigger functions on `tenants` insertion to auto-generate the 12-char alphanumeric URL token and sequential `CC-XXXXX` billing ID.
5. **`assign_staff_login_id()`**:
   * *Purpose*: Trigger function on `staff_accounts` to automatically format staff credentials like `aether-cafe#1001` and `aether-cafe-1001@staff.cafecanvas.bar`.
6. **`revoke_other_sessions(...)`**:
   * *Purpose*: Deletes/revokes other active sessions on a new login to enforce single-session policy.
7. **`check_subscription_limit(...)`**:
   * *Purpose*: Validates location and menu item creation limits against the tenant's tier.

---

## 4. Breaking Changes & Required Code Updates

> [!WARNING]
> The database changes in v3.0 are **breaking** for the front-end and Electron apps. Code updates are required in the following areas:

1. **Table Scopes**:
   * All API calls / Drizzle references queries targeting `users` must be updated to target `staff_accounts`.
   * All queries targeting `tables` must be updated to target `dining_tables`.
   * All queries targeting `branches` must be updated to target `locations`.
   * All queries targeting `blogs` must be updated to target `blog_posts`.
2. **Order Submission**:
   * Next.js and staff POS applications must not invoke standard INSERT operations on the `orders` or `order_items` tables. All orders must be placed by invoking the `create_order` PostgreSQL RPC function.
3. **Paise Handling**:
   * All UI fields showing currency must convert values in paise to Rupees ($Value / 100$). All form submissions (menu items creation, custom discount values) must send monetary values in integer paise.
4. **Subdomain vs. Slug**:
   * The routing middleware must extract the tenant slug and resolve it using `tenants.slug` instead of `tenants.subdomain`.
5. **Staff POS Login**:
   * Staff login flow must accept credentials in the `brand#XXXX` format and authenticate against Supabase using the synthetic email format `brand-XXXX@staff.cafecanvas.bar`.
