'use client';

/**
 * CafeCanvas — Layout Shell (Client Component)
 *
 * Contains the sidebar navigation, top header with sync status badge
 * and dev simulation toggle. Must be a client component because it
 * uses the SyncContext hook.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSyncContext } from '@/app/context/SyncContext';

// ─── Sidebar Navigation Items ───────────────────────

const NAV_ITEMS = [
  { href: '/store-admin/dashboard',  label: 'Dashboard',       icon: LayoutDashboardIcon },
  { href: '/store-admin/billing',    label: 'Billing & Floor',  icon: ReceiptIcon },
  { href: '/store-admin/menu',       label: 'Menu Manager',     icon: UtensilsIcon },
  { href: '/store-admin/orders',     label: 'Order History',    icon: ShoppingBagIcon },
  { href: '/store-admin/staff',      label: 'Staff & Roles',    icon: UsersIcon },
  { href: '/store-admin/kds',        label: 'Kitchen Display',  icon: MonitorIcon },
  { href: '/store-admin/storefront', label: 'Storefront',       icon: GlobeIcon },
  { href: '/store-admin/marketing',  label: 'Marketing',        icon: MegaphoneIcon },
  { href: '/store-admin/analytics',  label: 'Analytics',        icon: TrendingUpIcon },
  { href: '/store-admin/settings',   label: 'Settings',         icon: SettingsIcon },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    effectivelyOnline,
    isSimulatedOffline,
    syncQueueLength,
    syncStatus,
    lastSyncedAt,
    toggleSimulatedOffline,
  } = useSyncContext();

  const showDevTools =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen">
      {/* ─── Sidebar ──────────────────────────────── */}
      <aside className="w-[260px] fixed inset-y-0 left-0 z-20 flex flex-col border-r"
        style={{
          background: 'var(--canvas-surface)',
          borderColor: 'var(--canvas-border)',
        }}
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--canvas-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-extrabold text-white text-lg"
              style={{
                background: 'linear-gradient(135deg, var(--accent-sapphire), var(--accent-emerald))',
                boxShadow: '0 4px 12px rgba(77, 124, 254, 0.3)',
              }}
            >
              CC
            </div>
            <div>
              <span className="font-heading font-bold text-[15px] leading-none block" style={{ color: 'var(--text-primary)' }}>
                CafeCanvas
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] leading-none block mt-1" style={{ color: 'var(--accent-emerald)' }}>
                Store Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(77, 124, 254, 0.1)' : 'transparent',
                  color: isActive ? 'var(--accent-sapphire)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--accent-sapphire)' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--canvas-border)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm"
              style={{ background: 'var(--canvas-muted)', color: 'var(--text-secondary)' }}
            >
              YZ
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-xs leading-none block truncate" style={{ color: 'var(--text-primary)' }}>
                Yash Zagde
              </span>
              <span className="text-[10px] leading-none block mt-1" style={{ color: 'var(--text-muted)' }}>
                Tenant Owner
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ────────────────────── */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header
          className="h-14 px-6 flex items-center justify-between sticky top-0 z-10 border-b"
          style={{
            background: 'rgba(15, 15, 19, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--canvas-border)',
          }}
        >
          <div>
            <h1 className="font-heading font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
              AETHER Café & Roastery
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync Status Badge */}
            <SyncStatusBadge
              effectivelyOnline={effectivelyOnline}
              syncStatus={syncStatus}
              syncQueueLength={syncQueueLength}
              lastSyncedAt={lastSyncedAt}
            />

            <div className="h-4 w-px" style={{ background: 'var(--canvas-border)' }} />

            {/* Date */}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {dateStr}
            </span>

            {/* Dev Simulation Toggle */}
            {showDevTools && (
              <>
                <div className="h-4 w-px" style={{ background: 'var(--canvas-border)' }} />
                <button
                  onClick={toggleSimulatedOffline}
                  className={`dev-toggle ${isSimulatedOffline ? 'active' : ''}`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isSimulatedOffline ? 'var(--accent-amber)' : 'var(--canvas-muted)',
                      transition: 'background 200ms',
                    }}
                  />
                  {isSimulatedOffline ? 'Offline Simulated' : 'Simulate Offline'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Sync Status Badge Component ────────────────────

function SyncStatusBadge({
  effectivelyOnline,
  syncStatus,
  syncQueueLength,
  lastSyncedAt,
}: {
  effectivelyOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncQueueLength: number;
  lastSyncedAt: Date | null;
}) {
  if (syncStatus === 'syncing') {
    return (
      <div className="status-badge status-syncing">
        <span className="w-2 h-2 rounded-full spin-slow" style={{
          background: 'var(--accent-amber)',
          border: '1.5px solid rgba(255, 201, 77, 0.5)',
          display: 'inline-block',
        }} />
        Syncing…
        {syncQueueLength > 0 && (
          <span className="font-mono text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style={{
            background: 'rgba(255, 201, 77, 0.15)',
          }}>
            {syncQueueLength}
          </span>
        )}
      </div>
    );
  }

  if (!effectivelyOnline) {
    return (
      <div className="status-badge status-offline">
        <WifiOffIcon size={12} />
        Offline Mode
        {syncQueueLength > 0 && (
          <span className="font-mono text-[9px] ml-1 px-1.5 py-0.5 rounded-full" style={{
            background: 'rgba(233, 69, 96, 0.15)',
          }}>
            {syncQueueLength} queued
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="status-badge status-online">
      <span className="w-2 h-2 rounded-full glow-emerald" style={{ background: 'var(--accent-emerald)' }} />
      Cloud Synced
      <CheckIcon size={10} />
    </div>
  );
}

// ─── Inline SVG Icons (no external dependency) ──────
// Minimal icons matching Lucide design language

function LayoutDashboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function ReceiptIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 10h8" /><path d="M8 14h4" />
    </svg>
  );
}

function UtensilsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function ShoppingBagIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MonitorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  );
}

function MegaphoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function TrendingUpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function WifiOffIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h.01" /><path d="M8.5 16.429a5 5 0 0 1 7 0" /><path d="M2 2l20 20" /><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
