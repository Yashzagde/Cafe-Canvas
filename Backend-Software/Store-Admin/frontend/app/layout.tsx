import React from 'react';
import './global.css';

export const metadata = {
  title: 'Cafe Canvas — Store Admin Dashboard',
  description: 'Premium Multi-Tenant Cafe and Restaurant Hospitality Operating System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans flex antialiased selection:bg-accent-indigo selection:text-white">
        
        {/* Sleek Glassmorphic Sidebar */}
        <aside className="w-64 fixed inset-y-0 left-0 bg-card border-r border-border backdrop-blur-md flex flex-col z-20">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-emerald flex items-center justify-center font-display font-extrabold text-white text-xl shadow-lg shadow-accent-indigo/20">
                CC
              </div>
              <div>
                <span className="font-display font-bold text-lg leading-none tracking-tight block">Cafe Canvas</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-emerald leading-none block mt-1">Store Admin</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <a href="/store-admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-foreground hover:bg-white/10 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
              Overview Dashboard
            </a>
            <a href="/store-admin/menu" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Menu Management
            </a>
            <a href="/store-admin/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Billing Dashboard
            </a>
            <a href="/store-admin/tables" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Table visualizer
            </a>
            <a href="/store-admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Live Order Queue
            </a>
            <a href="/store-admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Performance Stats
            </a>
            <a href="/store-admin/marketing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Marketing Promos
            </a>
            <a href="/store-admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Customer Profiles
            </a>
            <a href="/store-admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              Store Settings
            </a>
          </nav>

          <div className="p-4 border-t border-border bg-white/[0.01]">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center font-display font-bold text-sm text-neutral-300">
                YZ
              </div>
              <div className="overflow-hidden">
                <span className="font-semibold text-xs leading-none block text-white truncate">Yash Zagde</span>
                <span className="text-[10px] text-neutral-500 leading-none block mt-1">Tenant Owner</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Core Main Area */}
        <div className="flex-1 pl-64 flex flex-col min-h-screen">
          <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="font-display font-semibold text-base text-neutral-200">AETHER Cafe & Roastery</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-full tracking-wider uppercase">
                Active Branch
              </div>
              <div className="h-4 w-px bg-border"></div>
              <span className="text-xs text-neutral-400">Date: 27 May 2026</span>
            </div>
          </header>
          
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
