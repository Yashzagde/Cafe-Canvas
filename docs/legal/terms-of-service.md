# Terms of Service

**Last Updated:** June 12, 2026

These Terms of Service ("Terms") constitute a binding legal agreement between the entity registering as a restaurant tenant ("Tenant", "you", or "your") and **CafeCanvas** ("Platform", "we", "us", or "our"), governing the use of the CafeCanvas Multi-Tenant SaaS Restaurant Operating System.

By registering for a CafeCanvas account, logging into the Store Admin, deploying the Flutter Staff POS, or enabling QR-based dine-in ordering, you agree to comply with and be bound by these Terms.

---

## 1. Multi-Tenant SaaS Platform License

### 1.1 Service Provision
Subject to your compliance with these Terms and payment of applicable SaaS subscription fees, CafeCanvas grants you a non-exclusive, non-transferable, revocable license to access and use our software services. This includes our Next.js Storefront, Electron Store Admin, and Flutter Staff POS applications.

### 1.2 Multi-Tenant Architecture & Data Isolation
CafeCanvas is a shared SaaS application. All tenant data is logically partitioned in a central database and secured using PostgreSQL Row-Level Security (RLS). 
* **Scoping Guarantee:** We warrant that database configurations prevent any other tenant from accessing your operational data (including menu items, tables, orders, staff, customer information, and bills).
* **Security Boundaries:** You agree not to attempt to bypass, reverse engineer, or exploit the platform's multi-tenant isolation barriers, RLS functions, or API routes.

```
+-------------------------------------------------------------+
|                      CafeCanvas SaaS                        |
|  +------------------+  +------------------+  +-----------+  |
|  |   Store Admin    |  |    Staff POS     |  |Storefront |  |
|  | (Owner/Manager)  |  |  (Cashier/Chef)  |  |(Customer) |  |
|  +--------+---------+  +--------+---------+  +-----+-----+  |
+-----------|---------------------|------------------|--------+
            |                     |                  |
            v                     v                  v
+-------------------------------------------------------------+
|                    Supabase PostgreSQL                      |
|  +-------------------------------------------------------+  |
|  |     Row-Level Security (RLS) & JWT Tenant Claims       |  |
|  +-------------------------------------------------------+  |
|  | Tenant A Table Data  |  Tenant B Table Data  |  ...   |  |
|  +----------------------+-----------------------+--------+  |
+-------------------------------------------------------------+
```

---

## 2. Account Registration and Staff Credentials

### 2.1 Tenant Accounts
To set up an establishment on CafeCanvas, you must register a Tenant account. You represent that all information provided during setup—including restaurant legal names, billing information, locations, and physical addresses—is accurate and current.

### 2.2 Staff Accounts and Role Security
* **Role Delegation:** Tenants can create and manage employee accounts (`staff_accounts`) with specific roles (e.g., `cashier`, `chef`, `bartender`, `waiter`, `kitchen`, `delivery`).
* **Hashed PINs:** Staff authenticate using unique access PINs. PINs are securely hashed in the database.
* **Tenant Responsibility:** You are solely responsible for all orders, billing operations, database entries, and modifications executed under your Tenant account and its sub-staff profiles.

> [!CAUTION]
> **Unauthorized Role Escalation:** Attempts to execute administrative queries from POS screens or staff accounts will trigger an automatic security lock. The platform will block the offending user, execute an immediate sign-out (`AuthAgent.blockAndSignOut()`), and suspend the account pending tenant review.

---

## 3. Access Boundaries & Operational Limits

### 3.1 Role-Based Access Control (RBAC)
To prevent operational errors and maintain security boundaries, CafeCanvas enforces strict access controls:
1. **Store Admin Dashboard:** Limited to verified `owner`, `manager`, and `admin` accounts. Controls restaurant configurations, menu categories, sales reports, and integration settings.
2. **Staff POS & Web POS:** Limited to staff-specific roles. Restricts users to placing orders, updating table statuses, managing sessions, and compiling checkouts.
3. **Storefront Menu:** Open to unauthenticated customers for table check-in, menu browsing, ordering, and digital payments.

### 3.2 System Integrity & RLS Scoping
All database interactions verify session scopes using system helper functions:
* `get_tenant_id()` — Resolves tenant database visibility.
* `get_user_role()` — Validates interface permissions.
* `get_location_id()` — Confirms physical branch boundaries.

Attempts to alter JWT claims or forge session parameters will result in immediate termination of the subscription license.

---

## 4. Digital Storefront, Dine-In Check-In, and SMS OTP

### 4.1 Table Sessions and Customer Check-In
When customers scan table-specific QR codes, they must check in using their name and mobile number.
* **OTP Verification:** Verification is completed via SMS OTP (routed through the MSG91 API or your configured SMS provider).
* **Session Lifecycle:** The platform creates a record in `table_sessions`. Active sessions track orders, update table occupancy status (`available` to `occupied`), and aggregate order items until the bill is generated and paid.

### 4.2 Consent for Customer Data Collection
By deploying the digital menu, you warrant that you have obtained all necessary customer consents required under applicable local privacy laws (including the Digital Personal Data Protection Act, 2023, where applicable) to collect and store customer phone numbers and names for transaction routing, billing, and GST compliance.

---

## 5. Payments, Razorpay Integrations, and Hardware POS

### 5.1 Payment Processing and UPI
* **Razorpay Gateway:** All online, card, and UPI checkouts are processed via your own Razorpay merchant accounts. You must input valid Razorpay API keys (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) in your store settings.
* **Direct Routing:** CafeCanvas acts solely as an orchestrator and does not collect, receive, or hold customer payment funds. Transaction proceeds settle directly into your bank account as per your agreement with Razorpay.
* **Disputes and Settlements:** Any payment failures, refunds, chargebacks, or settlement delays are governed exclusively by your agreement with Razorpay. We are not liable for transaction processing failures or payment gateway outages.

> [!NOTE]
> **Encryption of API Keys:** Your Razorpay API keys are encrypted at the database level and are never displayed in raw text inside client-side applications.

### 5.2 WebUSB and Printing Integrations
* **Local Hardware Connectivity:** CafeCanvas supports receipt printing using WebUSB and Bluetooth Low Energy (BLE) protocols directly from the client interface to ESC/POS thermal printers.
* **No Cloud Buffering:** Print jobs are processed and executed locally by the client device. CafeCanvas is not responsible for hardware incompatibilities, printer connection losses, driver configurations, or incorrect formatting on physical receipts.

---

## 6. Indian Regulatory Compliance

Tenants using the platform in India agree to comply with the rules set forth by the Government of India and the Food Safety and Standards Authority of India (FSSAI).

* **Tax Configuration (GST):** You must enter your valid GSTIN in your dashboard settings to print tax-compliant bills. Taxes are calculated in integer paise and split equally between **CGST (Central GST)** and **SGST (State GST)** (CGST = SGST = `Total Tax / 2`).
* **FSSAI License:** You must input and display your valid FSSAI license number on all customer storefront menus and printed invoice templates.
* **paise Database Precision:** To prevent floating-point calculation mismatches, all billing fields (such as `subtotal_paise`, `cgst_paise`, `sgst_paise`, and `total_paise`) are calculated and recorded in integer paise. The display conversions to Rupees (e.g., `₹{paise / 100:.2f}`) are only for display and do not affect database records.

---

## 7. Subscription Fees and SaaS Billing

* **Pricing Plans:** You agree to pay the platform fees associated with the subscription plan you select. Platform fees are charged in Indian Rupees (INR) and are subject to 18% GST (or applicable taxes).
* **Payment Due Dates:** SaaS fees are billed in advance on a monthly or annual cycle. Failure to settle invoices within 7 days of the billing date will result in temporary suspension of Store Admin dashboards and storefront services.

---

## 8. Limitation of Liability and Disclaimers

### 8.1 "As-Is" Provision
CafeCanvas is provided "as-is" and "as available". We do not guarantee uninterrupted system availability, error-free operations, or instant real-time synchronization under all network conditions.

### 8.2 Limitation of Liability
To the maximum extent permitted by applicable law, in no event shall CafeCanvas or its operators be liable for:
* Loss of profits, business opportunities, or restaurant revenue.
* Interrupted customer dining experiences due to internet outages, Supabase platform downtimes, or Razorpay payment failures.
* Fines, penalties, or audits arising from incorrect tax configurations, missing FSSAI details, or invalid GST calculations entered by you.
* Any direct or indirect damages exceeding the total subscription fees paid by you to CafeCanvas in the 6 months preceding the claim.

---

## 9. Suspension and Termination

* **Violation of Terms:** We reserve the right to immediately suspend or terminate your subscription and database access if you violate role access limits, attempt to breach tenant isolation parameters, input fraudulent credentials, or fail to pay subscription fees.
* **Data Purging on Termination:** Upon cancellation or termination of your account, you may request a complete database purge. A tenant deletion command will execute a cascading drop, permanently deleting all locations, tables, staff credentials, menu items, orders, and bills associated with your `tenant_id` from the database.

---

## 10. Governing Law & Dispute Resolution

These Terms shall be governed by, and construed in accordance with, the laws of the **Republic of India**. 

Any dispute, claim, or controversy arising out of or relating to these Terms, the Platform, or the SaaS services shall be subject to the exclusive jurisdiction of the competent courts located in **Mumbai, Maharashtra, India**.
