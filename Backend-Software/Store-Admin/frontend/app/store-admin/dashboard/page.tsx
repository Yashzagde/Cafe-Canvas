'use client';

import React, { useState, useEffect } from 'react';

const devHeaders = {
  'x-tenant-id': 'd3b07384-d113-495d-a5d6-ec25c7e1b54a',
  'x-branch-id': 'b78e24c5-09cd-4a5f-a320-f56f3458ef23',
  'x-role': 'TENANT_OWNER',
  'x-user-id': 'c36a8d7a-1111-2222-3333-444455556666'
};

interface SummaryData {
  ordersToday: number;
  revenueToday: number;
  avgOrderValue: number;
  newCustomersToday: number;
  occupancyRate: number;
}

interface TopItem {
  itemId: string;
  name: string;
  totalQty: number;
  totalSales: number;
}

interface RecentOrder {
  id: string;
  tableId: string;
  status: string;
  total: number;
  createdAt: string;
}

interface ChartItem {
  label: string;
  revenue: number;
}

interface LowSellingItem {
  itemId: string;
  name: string;
  price: number;
  totalQty: number;
}

export default function DashboardPage() {
  const [chartToggle, setChartToggle] = useState<'line' | 'bar'>('line');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [discountStatus, setDiscountStatus] = useState<Record<string, string>>({});
  
  // States for live data
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [lowSelling, setLowSelling] = useState<LowSellingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary statistics
      const summaryRes = await fetch('/api/dashboard/summary', { headers: devHeaders });
      const summaryJson = await summaryRes.json();

      // Fetch top menu items
      const topRes = await fetch(`/api/dashboard/top-items?period=${period}`, { headers: devHeaders });
      const topJson = await topRes.json();

      // Fetch recent order queue
      const recentRes = await fetch('/api/dashboard/recent-orders', { headers: devHeaders });
      const recentJson = await recentRes.json();

      // Fetch hourly/weekly revenue time-series
      const chartRes = await fetch(`/api/dashboard/revenue-chart?period=${period}`, { headers: devHeaders });
      const chartJson = await chartRes.json();

      // Fetch low-selling items
      const lowRes = await fetch('/api/dashboard/low-selling', { headers: devHeaders });
      const lowJson = await lowRes.json();

      if (summaryJson.success) setSummary(summaryJson.data);
      if (topJson.success) setTopItems(topJson.data || []);
      if (recentJson.success) setRecentOrders(recentJson.data || []);
      if (chartJson.success) setChartData(chartJson.data || []);
      if (lowJson.success) setLowSelling(lowJson.data || []);

    } catch (err: any) {
      setError('Connection to backend failed. Please verify the Express API is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleApplyDiscount = async (itemId: string, percentage: number) => {
    try {
      const res = await fetch('/api/dashboard/quick-discount', {
        method: 'POST',
        headers: {
          ...devHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, discountPercent: percentage })
      });
      const json = await res.json();
      if (json.success) {
        setDiscountStatus((prev) => ({ 
          ...prev, 
          [itemId]: `Flash ${percentage}% campaign created!` 
        }));
        // Reload summary & low-selling
        fetchDashboardData();
      } else {
        alert(json.error || 'Failed to apply discount');
      }
    } catch (err) {
      alert('Network error applying discount');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-xl border-4 border-accent-indigo border-t-transparent animate-spin"></div>
        <span className="text-sm font-semibold tracking-wide text-neutral-400">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[40vh] text-center max-w-xl mx-auto gap-4">
        <div className="w-12 h-12 rounded-full bg-accent-rose/10 flex items-center justify-center text-accent-rose">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16.01"/></svg>
        </div>
        <h3 className="font-display font-bold text-lg text-white">System Error</h3>
        <p className="text-sm text-neutral-400">{error}</p>
        <button onClick={fetchDashboardData} className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-sm text-neutral-400 mt-1">Real-time performance ledger and store health indicators.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={period} 
            onChange={(e: any) => setPeriod(e.target.value as any)} 
            className="glass-input px-4 py-2 text-xs font-semibold"
          >
            <option value="daily">Today (Daily)</option>
            <option value="weekly">This Week (Weekly)</option>
            <option value="monthly">This Month (Monthly)</option>
          </select>
        </div>
      </div>

      {/* 2. Top Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Orders */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Orders Today</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">
              {summary?.ordersToday ?? 0}
            </span>
            <span className="text-[10px] text-accent-emerald font-bold mt-1 block">▲ Live tracking active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Revenue Today</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">
              ₹{((summary?.revenueToday ?? 0) / 100).toFixed(2)}
            </span>
            <span className="text-[10px] text-accent-emerald font-bold mt-1 block">▲ Live transaction totals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        {/* Avg Bill Value */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Average Order</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">
              ₹{((summary?.avgOrderValue ?? 0) / 100).toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1 block">Calculated at checkout</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        {/* Occupancy */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Live Occupancy</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">
              {summary?.occupancyRate ?? 0}%
            </span>
            <span className="text-[10px] text-neutral-500 mt-1 block">Active dining rooms list</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

      </div>

      {/* 3. Main Area: Chart & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Revenue Time-Series Chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Revenue Analytics</span>
              <span className="text-xs text-neutral-400 block mt-1">Comparing live storefront vs. physical dining sales.</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setChartToggle('line')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartToggle === 'line' ? 'bg-accent-indigo text-white shadow' : 'bg-white/5 text-neutral-400'}`}
              >
                Line
              </button>
              <button 
                onClick={() => setChartToggle('bar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartToggle === 'bar' ? 'bg-accent-indigo text-white shadow' : 'bg-white/5 text-neutral-400'}`}
              >
                Bar
              </button>
            </div>
          </div>

          {/* Visual Time-Series chart wrapper */}
          <div className="h-64 mt-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-end p-4 relative overflow-hidden">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                No time-series sales logged for this range.
              </div>
            ) : (
              <>
                <div className="absolute inset-x-4 top-4 flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                  <span>Sales Trend ({period})</span>
                </div>
                
                <div className="flex-1 flex items-end justify-between h-3/4 gap-4 px-2">
                  {chartData.map((item, idx) => {
                    const maxVal = Math.max(...chartData.map((d) => d.revenue), 1);
                    const heightPercent = `${Math.round((item.revenue / maxVal) * 85 + 5)}%`;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div 
                          className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all" 
                          style={{ height: heightPercent }}
                        ></div>
                        <span className="text-[9px] text-neutral-500 font-medium truncate max-w-full">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Top Selling Items */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Top-Selling Menu Items</span>
            <span className="text-xs text-neutral-400 block mt-1">Ranked by order count and sales volume.</span>
          </div>

          <div className="mt-6 space-y-4">
            {topItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                No sales records found.
              </div>
            ) : (
              topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-accent-emerald">#{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[120px]">{item.name}</span>
                      <span className="text-[10px] text-neutral-400">Coffee / Food</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">{item.totalQty} sold</span>
                    <span className="text-[10px] text-neutral-500">₹{(item.totalSales / 100).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. Bottom Area: Recent Transactions Feed + Marketing Smart Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Recent Active Transactions</span>
              <span className="text-xs text-neutral-400 block mt-1">Live order tracking from all tables.</span>
            </div>
            <a href="/store-admin/orders" className="text-xs text-accent-indigo font-bold hover:underline">View All Orders</a>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                No orders placed in this store yet.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-neutral-500 uppercase text-left tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Table</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-4 font-bold text-white">#{ord.id.substring(0, 8)}</td>
                      <td className="py-4">Table 04</td>
                      <td className="py-4">₹{(ord.total / 100).toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low-Selling Marketing Smart Suggestions */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-rose animate-ping"></span>
              <span className="text-sm font-bold text-white tracking-tight">Smart Marketing suggestions</span>
            </div>
            <span className="text-xs text-neutral-400 block mt-1">We found low-selling menu items. Boost them with a quick discount!</span>
          </div>

          <div className="mt-6 space-y-4">
            {lowSelling.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500">
                No marketing suggestions available.
              </div>
            ) : (
              lowSelling.slice(0, 2).map((item) => (
                <div key={item.itemId} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-neutral-400">Total orders: {item.totalQty}</span>
                    </div>
                    <span className="text-xs font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded-lg">-20% Suggested</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-accent-emerald font-bold">
                      {discountStatus[item.itemId] || ''}
                    </span>
                    {!discountStatus[item.itemId] && (
                      <button 
                        onClick={() => handleApplyDiscount(item.itemId, 20)}
                        className="px-3 py-1.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-lg text-[10px] font-bold transition shadow-lg shadow-accent-indigo/20"
                      >
                        Apply Flash Discount
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
