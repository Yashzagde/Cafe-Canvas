'use client';

import React, { useState, useEffect } from 'react';
import { useSyncContext } from '@/app/context/SyncContext';

/* ─── Mock Dashboard Data ─── */
const MOCK_METRICS = {
  revenue_today: 48250,
  revenue_yesterday: 44600,
  orders_today: 124,
  orders_yesterday: 109,
  active_tables: 6,
  total_tables: 10,
  avg_bill_value: 389,
  avg_bill_yesterday: 409,
};

const MOCK_REVENUE_TREND = [
  { date: 'Mon', revenue: 32400 },
  { date: 'Tue', revenue: 38100 },
  { date: 'Wed', revenue: 41200 },
  { date: 'Thu', revenue: 35800 },
  { date: 'Fri', revenue: 52600 },
  { date: 'Sat', revenue: 61400 },
  { date: 'Sun', revenue: 48250 },
];

const MOCK_TOP_ITEMS = [
  { name: 'Classic Cappuccino', category: 'Hot Coffee', qty: 84, revenue: 24360 },
  { name: 'Avocado Toast', category: 'Gourmet Bites', qty: 56, revenue: 21840 },
  { name: 'Specialty Cold Brew', category: 'Cold Brews', qty: 48, revenue: 16800 },
  { name: 'Almond Croissant', category: 'Bakery & Sweets', qty: 42, revenue: 10080 },
  { name: 'Matcha Latte', category: 'Cold Brews', qty: 38, revenue: 12160 },
];

const MOCK_RECENT_BILLS = [
  { id: 'CC-2026-0142', table: 'Table 04', staff: 'Rohan K.', amount: 1450, time: '2:15 PM', method: 'UPI' },
  { id: 'CC-2026-0141', table: 'Patio 01', staff: 'Anjali P.', amount: 890, time: '1:48 PM', method: 'Cash' },
  { id: 'CC-2026-0140', table: 'Table 02', staff: 'Rohan K.', amount: 2840, time: '1:22 PM', method: 'Card' },
  { id: 'CC-2026-0139', table: 'Bar Seat 2', staff: 'Vikram S.', amount: 650, time: '12:55 PM', method: 'UPI' },
  { id: 'CC-2026-0138', table: 'Table 05', staff: 'Anjali P.', amount: 1920, time: '12:30 PM', method: 'Cash' },
];

const MOCK_HOURLY = [
  { hour: 8, orders: 8 }, { hour: 9, orders: 15 }, { hour: 10, orders: 12 },
  { hour: 11, orders: 18 }, { hour: 12, orders: 28 }, { hour: 13, orders: 22 },
  { hour: 14, orders: 14 }, { hour: 15, orders: 10 }, { hour: 16, orders: 8 },
  { hour: 17, orders: 12 }, { hour: 18, orders: 24 }, { hour: 19, orders: 32 },
  { hour: 20, orders: 28 }, { hour: 21, orders: 18 }, { hour: 22, orders: 6 },
];

export default function DashboardPage() {
  const { effectivelyOnline, lastSyncedAt } = useSyncContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const m = MOCK_METRICS;
  const revDelta = ((m.revenue_today - m.revenue_yesterday) / m.revenue_yesterday * 100).toFixed(1);
  const orderDelta = ((m.orders_today - m.orders_yesterday) / m.orders_yesterday * 100).toFixed(1);
  const avgDelta = ((m.avg_bill_value - m.avg_bill_yesterday) / m.avg_bill_yesterday * 100).toFixed(1);
  const maxRevenue = Math.max(...MOCK_REVENUE_TREND.map(r => r.revenue));
  const maxHourly = Math.max(...MOCK_HOURLY.map(h => h.orders));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Dashboard Overview
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time performance and store health indicators.
            {!effectivelyOnline && lastSyncedAt && (
              <span className="ml-2" style={{ color: 'var(--accent-amber)' }}>
                (Cached — last updated {lastSyncedAt.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Revenue Today"
          value={`₹${m.revenue_today.toLocaleString()}`}
          delta={Number(revDelta)}
          icon={<CurrencyIcon />}
          color="var(--accent-emerald)"
        />
        <KPICard
          label="Orders Today"
          value={m.orders_today.toString()}
          delta={Number(orderDelta)}
          icon={<OrdersIcon />}
          color="var(--accent-sapphire)"
        />
        <KPICard
          label="Active Tables"
          value={`${m.active_tables}/${m.total_tables}`}
          subtitle={`${Math.round(m.active_tables / m.total_tables * 100)}% occupancy`}
          icon={<TablesIcon />}
          color="var(--accent-violet)"
        />
        <KPICard
          label="Avg Bill Value"
          value={`₹${m.avg_bill_value}`}
          delta={Number(avgDelta)}
          icon={<AvgBillIcon />}
          color="var(--accent-amber)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Revenue Trend</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 7 days performance</p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-[200px] pt-4">
            {MOCK_REVENUE_TREND.map((point, i) => {
              const height = (point.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent-sapphire)' }}>
                      ₹{(point.revenue / 1000).toFixed(1)}k
                    </span>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                      style={{
                        height: `${height}%`,
                        background: `linear-gradient(180deg, var(--accent-sapphire), rgba(77, 124, 254, 0.3))`,
                        minHeight: '8px',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>By quantity sold this week</p>
          <div className="space-y-3">
            {MOCK_TOP_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl" style={{
                background: i === 0 ? 'rgba(77, 124, 254, 0.06)' : 'transparent',
                border: `1px solid ${i === 0 ? 'rgba(77, 124, 254, 0.1)' : 'transparent'}`,
              }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold font-mono w-6" style={{
                    color: i === 0 ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  }}>
                    #{String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>{item.qty} sold</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>₹{item.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Bills + Hourly Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Bills */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Settlements</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 5 settled bills</p>
            </div>
            <a href="/store-admin/orders" className="text-[11px] font-bold" style={{ color: 'var(--accent-sapphire)' }}>
              View All →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-left" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-3 pr-4">Bill #</th>
                  <th className="pb-3 pr-4">Table</th>
                  <th className="pb-3 pr-4">Staff</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_BILLS.map((bill) => (
                  <tr key={bill.id} className="text-xs border-t" style={{ borderColor: 'var(--canvas-border)' }}>
                    <td className="py-3 pr-4 font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{bill.id}</td>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>{bill.table}</td>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>{bill.staff}</td>
                    <td className="py-3 pr-4 font-mono font-bold" style={{ color: 'var(--accent-emerald)' }}>₹{bill.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-muted)' }}>{bill.time}</td>
                    <td className="py-3">
                      <span className="status-badge" style={{
                        background: bill.method === 'UPI' ? 'rgba(77, 124, 254, 0.1)' : bill.method === 'Card' ? 'rgba(155, 89, 182, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                        color: bill.method === 'UPI' ? 'var(--accent-sapphire)' : bill.method === 'Card' ? 'var(--accent-violet)' : 'var(--text-secondary)',
                        border: 'none',
                      }}>
                        {bill.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hourly Heatmap */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hourly Rush</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>Order volume by hour today</p>
          <div className="space-y-1.5">
            {MOCK_HOURLY.map((h) => {
              const pct = (h.orders / maxHourly) * 100;
              const isHot = pct > 70;
              const isMed = pct > 40;
              return (
                <div key={h.hour} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                    {h.hour > 12 ? `${h.hour - 12}p` : h.hour === 12 ? '12p' : `${h.hour}a`}
                  </span>
                  <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isHot
                          ? 'linear-gradient(90deg, var(--accent-crimson), var(--accent-amber))'
                          : isMed
                          ? 'linear-gradient(90deg, var(--accent-sapphire), var(--accent-emerald))'
                          : 'var(--canvas-muted)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono w-5 text-right font-bold" style={{
                    color: isHot ? 'var(--accent-crimson)' : isMed ? 'var(--accent-sapphire)' : 'var(--text-muted)',
                  }}>
                    {h.orders}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── KPI Card Component ─── */

function KPICard({ label, value, delta, subtitle, icon, color }: {
  label: string;
  value: string;
  delta?: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = delta !== undefined && delta >= 0;
  return (
    <div className="glass-card p-5 flex items-start justify-between">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="font-heading font-extrabold text-2xl block mt-2" style={{ color: 'var(--text-primary)' }}>
          {value}
        </span>
        {delta !== undefined && (
          <span className="text-[10px] font-bold mt-1 block" style={{
            color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
          }}>
            {isPositive ? '▲' : '▼'} {Math.abs(delta)}% vs yesterday
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{
        background: `${color}15`,
        border: `1px solid ${color}25`,
        color,
      }}>
        {icon}
      </div>
    </div>
  );
}

/* ─── Inline Icons ─── */

function CurrencyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function TablesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="4" rx="1" /><path d="M4 11v8" /><path d="M20 11v8" /><path d="M9 4h6" /><path d="M12 4v3" />
    </svg>
  );
}

function AvgBillIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 10h8" /><path d="M8 14h4" />
    </svg>
  );
}
