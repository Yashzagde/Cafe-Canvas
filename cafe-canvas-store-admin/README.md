# Cafe Canvas Store Admin (Windows Desktop App)

This is the native Windows SaaS desktop application (`.exe`) for **Cafe Canvas**. It replaces browser-based administration consoles with a high-performance, offline-capable management dashboard.

## Tech Stack
* **Runtime**: Electron 31 (Node.js 20 LTS)
* **UI**: React 18, Vite 5, Tailwind CSS 3
* **State**: Zustand 5
* **DB & Auth**: Supabase JS v2
* **Packaging**: `electron-builder` (NSIS Installer)

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js 20+](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install the dependencies from this subproject folder:
```bash
cd cafe-canvas-store-admin
npm install
```

### 3. Environment Config
The application requires connection keys to communicate with Supabase and Claude. These are pre-populated in `.env.local` based on your main project workspace:
```ini
# Supabase keys (publicly bundled in Vite client)
VITE_SUPABASE_URL=https://oeringgdbxmmihgvuyfa.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU

# Anthropic Claude API Key (safely loaded in Electron main process, never exposed in client bundles)
ANTHROPIC_API_KEY=your_key_here
```

### 4. Database Setup
Ensure the necessary tables and seeded values are pushed to your Supabase instance:
1. Navigate to the **Supabase Dashboard > SQL Editor**.
2. Copy and run the content of `supabase/schema.sql` to configure tables and Row Level Security (RLS) policies.
3. Copy and run the content of `supabase/seed.sql` to seed the initial `Aether Café` merchant settings and the **50 staff accounts**.

---

## Running in Development
To run the React application hot-reload and Electron shell in tandem:
```bash
npm run dev
```

---

## Compiling for Production (.exe)
To package the app into a standalone Windows installer (`dist-electron/Cafe Canvas Store Admin Setup 1.0.0.exe`):
```bash
npm run build:win
```

---

## Key Security Architecture
* **safeStorage Integration**: Authentication sessions are saved using Electron's native `safeStorage` API. Decrypted credentials never land on plain text storage layers (like localStorage).
* **Anthropic Proxying**: API keys are restricted to Electron's main process. All AI prompts from the user flow through a secure IPC stream proxy channel, preventing token exposures in client packages.
