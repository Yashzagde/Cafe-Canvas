# CafeCanvas — SaaS Restaurant Operating System

**CafeCanvas** is a modern, production-grade, multi-tenant SaaS Restaurant Operating System designed specifically for cafés, restaurants, bars, and clubs in India. It handles everything from dynamic QR table ordering and kitchen displays (KDS) to mobile POS, billing, and WhatsApp receipts.

---

## 🌟 Key Product Features

- **Dynamic Multi-Tenancy**: Beautiful storefronts resolved via subdomain matching at `[slug].cafecanvas.bar`.
- **Theme Engine**: Support for **52 curated storefront themes** fetched dynamically from Supabase Storage.
- **QR Dining System**: Automated table sessions resolved via tables' UUID tokens (dine-in check-ins).
- **Mobile POS**: Tailored interaction grid for cashier/waiter order building and bill processing.
- **Kitchen Display System (KDS)**: Real-time order cards updated dynamically via Supabase Realtime subscriptions.
- **Razorpay Payments**: Integrated Indian payment methods (UPI, Cards, Netbanking) with HMAC webhook validation.
- **WhatsApp welcome & receipt delivery**: Native integrations via MSG91 flow API templates.

---

## 🛠️ Architecture & Tech Stack

```
Data Access Layer:  Supabase JS client + Row Level Security (RLS)
SaaS Auth:          Supabase Auth + dynamic tenant JWT claims injection hook
Server & Routing:   Next.js 15 (App Router, Turbopack, Server Actions)
Styling:            Tailwind CSS 4 + custom Outfit/Inter display typography
Database Engine:    PostgreSQL (104 files indexed, materialized reporting views)
State Management:   Zustand (Cart, Theme, Order tables)
Integrations:       Razorpay API (payments), MSG91 Flow (WhatsApp alerts)
```

---

## 📂 Project Directory Structure

```
d:\Cafe Canva\
├── apps/
│   └── cafecanvas/            ← Next.js 15 App (Turbopack, Tailwind 4)
│       ├── src/
│       │   ├── app/           ← App Router pages
│       │   ├── components/    ← UI design system (Button, Input, Badge, Card)
│       │   ├── lib/           ← Supabase client factories, Theme utilities
│       │   └── middleware.ts  ← Tenant subdomain parser & session refresh
│       ├── .env.example       ← Environment variables template
│       └── package.json
│
├── supabase/
│   ├── migrations/            ← Migrations 001-008 (Base Schema to Indexes)
│   └── functions/             ← Edge functions (generate-bill, call-staff)
│
├── docs/
│   ├── PROJECT_STATUS.md      ← Current active sprint board
│   ├── SETUP.md               ← Local setup bootstrap guide
│   └── security/
│       └── initial-audit.md   ← Security & RLS policy audit report
│
└── .github/
    └── workflows/
        └── ci.yml             ← GitHub Actions quality check pipeline
```

---

## 🚀 Fast Local Bootstrap

To launch your development server and connect your environment:
Please refer to **`/docs/SETUP.md`** for detailed local setup instructions.

---

## 📜 License

Project distributed under the **ISC License**. Developed by Yash Zagde for Yashzagde/Cafe-Canvas.
