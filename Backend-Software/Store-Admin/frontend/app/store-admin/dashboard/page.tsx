'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSyncContext } from '@/app/context/SyncContext';
import { supabase } from '@/app/utils/supabase';
import type { DashboardMetrics, RevenuePoint, TopItem, HourlyData } from '@/app/types';

// ─── Demo Tenant Context ──────────────────────────────
const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const BRANCH_ID = 'ab000000-0000-0000-0000-000000000001';

// ─── Helper: Get today's date range ───────────────────
function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function yesterdayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Data Fetching Hooks ──────────────────────────────

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const today = todayRange();
  const yesterday = yesterdayRange();

  // Today's orders (non-cancelled)
  const { data: todayOrders, error: todayErr } = await supabase
    .from('orders')
    .select('id, total, status')
    .eq('tenant_id', TENANT_ID)
    .gte('created_at', today.start)
    .lt('created_at', today.end)
    .neq('status', 'cancelled');

  // Yesterday's orders
  const { data: yesterdayOrders } = await supabase
    .from('orders')
    .select('id, total, status')
    .eq('tenant_id', TENANT_ID)
    .gte('created_at', yesterday.start)
    .lt('created_at', yesterday.end)
    .neq('status', 'cancelled');

  // Table counts
  const { data: allTables } = await supabase
    .from('tables')
    .select('id, status')
    .eq('tenant_id', TENANT_ID)
    .is('deleted_at', null);

  const ordersToday = todayOrders?.length ?? 0;
  const revenueToday = (todayOrders ?? []).reduce((sum, o) => sum + (o.total || 0), 0);
  const ordersYesterday = yesterdayOrders?.length ?? 0;
  const revenueYesterday = (yesterdayOrders ?? []).reduce((sum, o) => sum + (o.total || 0), 0);

  const totalTables = allTables?.length ?? 0;
  const activeTables = (allTables ?? []).filter(t => t.status === 'occupied').length;

  const avgBillToday = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0;
  const avgBillYesterday = ordersYesterday > 0 ? Math.round(revenueYesterday / ordersYesterday) : 0;

  if (todayErr) {
    console.error('[Dashboard] Error fetching today orders:', todayErr);
  }

  return {
    revenue_today: Math.round(revenueToday / 100), // paise to rupees
    revenue_yesterday: Math.round(revenueYesterday / 100),
    orders_today: ordersToday,
    orders_yesterday: ordersYesterday,
    active_tables: activeTables,
    total_tables: totalTables,
    avg_bill_value: Math.round(avgBillToday / 100),
    avg_bill_yesterday: Math.round(avgBillYesterday / 100),
  };
}

async function fetchRevenueChart(): Promise<RevenuePoint[]> {
  // Last 7 days revenue
  const days: RevenuePoint[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const { data } = await supabase
      .from('orders')
      .select('total')
      .eq('tenant_id', TENANT_ID)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .neq('status', 'cancelled');

    const revenue = (data ?? []).reduce((sum, o) => sum + (o.total || 0), 0);
    days.push({ date: dayNames[start.getDay()], revenue: Math.round(revenue / 100) });
  }

  return days;
}

async function fetchTopItems(): Promise<TopItem[]> {
  // Fetch recent order items joined with menu items
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: orderItemsData } = await supabase
    .from('order_items')
    .select(`
      menu_item_id,
      item_name,
      quantity,
      unit_price,
      order_id
    `)
    .gte('sent_at', sevenDaysAgo.toISOString());

  if (!orderItemsData || orderItemsData.length === 0) {
    // If no order items exist yet, show menu items as "0 sold"
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('id, name, category_id')
      .eq('tenant_id', TENANT_ID)
      .is('deleted_at', null)
      .limit(5);

    const { data: categories } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('tenant_id', TENANT_ID);

    const catMap = new Map((categories ?? []).map(c => [c.id, c.name]));

    return (menuData ?? []).map(item => ({
      id: item.id,
      name: item.name,
      category: catMap.get(item.category_id) || 'Uncategorized',
      quantity_sold: 0,
      revenue: 0,
    }));
  }

  // Aggregate by menu item
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const oi of orderItemsData) {
    const key = oi.menu_item_id || oi.item_name;
    const existing = itemMap.get(key) || { name: oi.item_name, qty: 0, revenue: 0 };
    existing.qty += oi.quantity;
    existing.revenue += oi.quantity * oi.unit_price;
    itemMap.set(key, existing);
  }

  const sorted = Array.from(itemMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      category: '',
      quantity_sold: data.qty,
      revenue: Math.round(data.revenue / 100),
    }))
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 5);

  return sorted;
}

interface RecentBill {
  id: string;
  table: string;
  staff: string;
  amount: number;
  time: string;
  method: string;
}

async function fetchRecentBills(): Promise<RecentBill[]> {
  const { data: bills } = await supabase
    .from('bills')
    .select(`
      id,
      table_id,
      total,
      payment_method,
      paid_at,
      created_by,
      created_at
    `)
    .eq('tenant_id', TENANT_ID)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!bills || bills.length === 0) {
    return [];
  }

  // Fetch table names
  const tableIds = [...new Set(bills.map(b => b.table_id).filter(Boolean))];
  const { data: tablesData } = tableIds.length > 0
    ? await supabase.from('tables').select('id, name').in('id', tableIds)
    : { data: [] };

  const tableMap = new Map((tablesData ?? []).map(t => [t.id, t.name]));

  return bills.map(bill => ({
    id: `CC-${bill.id.slice(0, 8).toUpperCase()}`,
    table: tableMap.get(bill.table_id) || 'Walk-in',
    staff: 'Staff',
    amount: Math.round(bill.total / 100),
    time: bill.paid_at
      ? new Date(bill.paid_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      : new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    method: bill.payment_method || 'Cash',
  }));
}

async function fetchHourlyData(): Promise<HourlyData[]> {
  const today = todayRange();

  const { data: orders } = await supabase
    .from('orders')
    .select('created_at')
    .eq('tenant_id', TENANT_ID)
    .gte('created_at', today.start)
    .lt('created_at', today.end)
    .neq('status', 'cancelled');

  // Build hour buckets (8am to 10pm)
  const hours: HourlyData[] = [];
  const hourCounts = new Map<number, number>();

  for (const order of (orders ?? [])) {
    const h = new Date(order.created_at).getHours();
    hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
  }

  for (let h = 8; h <= 22; h++) {
    hours.push({ hour: h, orders: hourCounts.get(h) || 0 });
  }

  return hours;
}

// ─── Main Dashboard Component ─────────────────────────

export default function DashboardPage() {
  const { effectivelyOnline, lastSyncedAt } = useSyncContext();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenuePoint[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, chart, items, bills, hourly] = await Promise.all([
        fetchDashboardMetrics(),
        fetchRevenueChart(),
        fetchTopItems(),
        fetchRecentBills(),
        fetchHourlyData(),
      ]);
      setMetrics(m);
      setRevenueTrend(chart);
      setTopItems(items);
      setRecentBills(bills);
      setHourlyData(hourly);
    } catch (err) {
      console.error('[Dashboard] Failed to load data:', err);
      setError('Failed to load dashboard data. Check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      loadData();
    }, 60000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Subscribe to real-time order changes
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${TENANT_ID}`,
        },
        () => {
          // Refresh dashboard when any order changes
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // ─── Loading State ──────────────────────────────────

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Dashboard Overview
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Loading real-time data from Supabase...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-3 w-20 rounded" style={{ background: 'var(--canvas-muted)' }} />
              <div className="h-7 w-28 rounded mt-3" style={{ background: 'var(--canvas-muted)' }} />
              <div className="h-2 w-16 rounded mt-2" style={{ background: 'var(--canvas-muted)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────

  if (error && !metrics) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="font-heading font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
            Connection Error
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={loadData} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  // ─── Computed Values ────────────────────────────────

  const m = metrics!;
  const safeDiv = (a: number, b: number) => b === 0 ? 0 : ((a - b) / b * 100);
  const revDelta = safeDiv(m.revenue_today, m.revenue_yesterday).toFixed(1);
  const orderDelta = safeDiv(m.orders_today, m.orders_yesterday).toFixed(1);
  const avgDelta = safeDiv(m.avg_bill_value, m.avg_bill_yesterday).toFixed(1);
  const maxRevenue = Math.max(...revenueTrend.map(r => r.revenue), 1);
  const maxHourly = Math.max(...hourlyData.map(h => h.orders), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Dashboard Overview
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time performance from Supabase • {currentTime.toLocaleTimeString()}
            {!effectivelyOnline && lastSyncedAt && (
              <span className="ml-2" style={{ color: 'var(--accent-amber)' }}>
                (Cached — last updated {lastSyncedAt.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <button onClick={loadData} className="btn-ghost text-[10px] flex items-center gap-1.5">
          <RefreshIcon size={12} /> Refresh
        </button>
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
          subtitle={m.total_tables > 0 ? `${Math.round(m.active_tables / m.total_tables * 100)}% occupancy` : 'No tables'}
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
            <span className="status-badge" style={{
              background: 'rgba(0,214,143,0.1)',
              color: 'var(--accent-emerald)',
              border: '1px solid rgba(0,214,143,0.2)',
              fontSize: '9px',
            }}>
              LIVE
            </span>
          </div>
          {revenueTrend.length > 0 ? (
            <div className="flex items-end gap-3 h-[200px] pt-4">
              {revenueTrend.map((point, i) => {
                const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
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
                          height: `${Math.max(height, 2)}%`,
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
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No order data yet. Revenue will appear here once orders start coming in.</p>
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>By quantity sold this week</p>
          <div className="space-y-3">
            {topItems.length > 0 ? topItems.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{
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
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>{item.quantity_sold} sold</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>₹{item.revenue.toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <p className="text-xs p-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No sales data yet.
              </p>
            )}
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
          {recentBills.length > 0 ? (
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
                  {recentBills.map((bill) => (
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
          ) : (
            <p className="text-xs p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              No bills yet. Settlements will appear here once payments are processed.
            </p>
          )}
        </div>

        {/* Hourly Heatmap */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hourly Rush</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>Order volume by hour today</p>
          <div className="space-y-1.5">
            {hourlyData.map((h) => {
              const pct = maxHourly > 0 ? (h.orders / maxHourly) * 100 : 0;
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

function RefreshIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M2 11.5a10 10 0 0 1 18.8-4.3"/><path d="M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  );
}

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
