# Tenant Administrator Guide — CafeCanvas

Welcome to the **CafeCanvas Admin Dashboard**. This guide covers primary features, configuration setups, and day-to-day operations for restaurant owners, managers, and cashiers.

---

## 1. Dashboard Overview

The **Dashboard** tab provides real-time transaction updates, cover occupancy ratios, and financial analytics for your active branch:
*   **Orders Today**: Total volume of transaction tickets processed since daily store opening.
*   **Revenue Today**: Aggregate sales volume in Indian Rupees (INR) computed from paid bills.
*   **Average Order Value (AOV)**: Average billing volume per customer transaction, indicating upselling effectiveness.
*   **Live Occupancy**: Real-time table capacity tracking, updated automatically as tables change states (`available` ↔ `occupied` ↔ `cleaning`).

---

## 2. Menu and Catalog Management

Configure categories, menu items, prices, and customizable modifier selections:
*   **Categories**: Group products logically (e.g. *Hot Specialty Coffee*, *Cold Brews*, *Pastries*). Sort order and storefront visibility can be configured in a single click.
*   **Menu Items**: Configure name, base prices, descriptions, and availability. Base prices are stored internally in **paise** integers to maintain absolute precision.
*   **Modifiers**: Define optional or required modifier groups (e.g. *Milk Type*, *Cup Size*, *Toppings*) to allow customers and staff to customize orders.

---

## 3. Floor Plan and Table Management

Represent your physical dining space digitally to track order assignments:
*   **Sections**: Segment your tables by floor areas (e.g. *Indoor*, *Patio*, *Bar Section*).
*   **Table States**:
    *   🟢 `available`: Table is free and ready to seat guests.
    *   🔴 `occupied`: Table has an active table session with orders.
    *   🟡 `reserved`: Pre-booked for upcoming dining sessions.
    *   🔵 `cleaning`: Guests checked out; table is being cleared by staff.

---

## 4. Receipts and Tax Settings

Ensure local tax regulations are met while presenting clear invoices:
*   **Indian GST Compliance**: Taxes are automatically split into **CGST (2.5%)** and **SGST (2.5%)** to satisfy the standard 5% restaurant service rate in India.
*   **Service Charge (Optional)**: Can be applied as a flat rupee charge or a percentage of the subtotal (typically 5%).
*   **Receipt Printing**: Seamlessly print to standard **80mm (3-inch)** or **58mm (2-inch)** thermal printers directly from your browser.
