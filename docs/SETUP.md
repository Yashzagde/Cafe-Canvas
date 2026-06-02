# CafeCanvas — Local Setup & Development Guide

Follow this guide to spin up your local environment, link your Supabase database, and run the multi-tenant Next.js application.

---

## 📋 Prerequisites

Before starting, ensure you have:
1. **Node.js 20+** installed.
2. **Supabase CLI** installed and initialized.
3. A **Razorpay** test account.

---

## 🛠️ Step-by-Step Setup

### 1. Initialize Root Workspace Dependencies
From the root project directory `d:\Cafe Canva`, install all workspaces and root packages:
```bash
npm install
```

### 2. Configure Environment Secrets
1. Copy `.env.example` to create `.env.local` inside `/apps/cafecanvas/`:
   ```bash
   cp apps/cafecanvas/.env.example apps/cafecanvas/.env.local
   ```
2. Open `/apps/cafecanvas/.env.local` and add your credentials:
   - **`NEXT_PUBLIC_SUPABASE_URL`**: Your local or hosted Supabase project URL.
   - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Anon client key.
   - **`RAZORPAY_KEY_ID`** & **`RAZORPAY_KEY_SECRET`**: Razorpay developer keys.

---

### 3. Local Supabase Setup
If you are running Supabase locally:
1. Launch the local Supabase container:
   ```bash
   supabase start
   ```
2. Apply all migrations (001-008):
   ```bash
   supabase db push
   ```
3. Run the seed data command to populate demo menu items and branch settings:
   ```bash
   supabase migration apply --todo (or seed via SQL Editor)
   ```

---

### 4. Running the Next.js Workspace
To launch the Next.js 15 app locally:
```bash
cd apps/cafecanvas
npm run dev
```

The application will launch on **`http://localhost:3000`**.

---

## 🌐 Dynamic Tenant Testing

To test dynamic tenant subdomains on your local PC (e.g. `cappuccino.localhost:3000`):
1. Use a tool like **`localhost.me`**, **`tunnel`**, or edit your local `/etc/hosts` file (on Windows: `C:\Windows\System32\drivers\etc\hosts`) to map custom domains:
   ```hosts
   127.0.0.1 cappuccino.cafecanvas.local
   127.0.0.1 espresso.cafecanvas.local
   ```
2. Access the site in your browser to verify that the Middleware successfully parses `cappuccino` or `espresso` and forwards the `x-tenant-slug` header.
