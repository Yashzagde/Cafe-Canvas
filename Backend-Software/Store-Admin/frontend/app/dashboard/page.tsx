'use client';

import React, { useState } from 'react';

export default function DashboardPage() {
  const [chartToggle, setChartToggle] = useState<'line' | 'bar'>('line');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [discountStatus, setDiscountStatus] = useState<Record<string, string>>({});

  const handleApplyDiscount = (itemId: string, percentage: number) => {
    setDiscountStatus(prev => ({ ...prev, [itemId]: `Applied ${percentage}% discount!` }));
  };

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
            onChange={(e) => setPeriod(e.target.value as any)} 
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
            <span className="font-display font-extrabold text-3xl text-white block mt-2">124</span>
            <span className="text-[10px] text-accent-emerald font-bold mt-1 block">▲ +14% from yesterday</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Revenue Today</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">₹48,250</span>
            <span className="text-[10px] text-accent-emerald font-bold mt-1 block">▲ +8.2% from yesterday</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        {/* Avg Bill Value */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Average Order</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">₹389</span>
            <span className="text-[10px] text-accent-rose font-bold mt-1 block">▼ -2.5% from last week</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>

        {/* Occupancy */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Live Occupancy</span>
            <span className="font-display font-extrabold text-3xl text-white block mt-2">68%</span>
            <span className="text-[10px] text-neutral-500 mt-1 block">Active dining covers: 18/25</span>
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

          {/* Graphic Mockup of a gorgeous dashboard chart */}
          <div className="h-64 mt-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-end p-4 relative overflow-hidden">
            <div className="absolute inset-x-4 top-4 flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
              <span>Peak: ₹14,200</span>
              <span>Average: ₹8,400</span>
            </div>
            
            {/* Visual bars/lines */}
            <div className="flex-1 flex items-end justify-between h-3/4 gap-4 px-2">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all" style={{ height: '35%' }}></div>
                <span className="text-[10px] text-neutral-500 font-medium">9 AM</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all animate-pulse" style={{ height: '60%' }}></div>
                <span className="text-[10px] text-neutral-500 font-medium">12 PM</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all" style={{ height: '40%' }}></div>
                <span className="text-[10px] text-neutral-500 font-medium">3 PM</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all" style={{ height: '90%' }}></div>
                <span className="text-[10px] text-neutral-500 font-medium">6 PM</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-gradient-to-t from-accent-indigo/25 to-accent-indigo rounded-t-lg transition-all" style={{ height: '75%' }}></div>
                <span className="text-[10px] text-neutral-500 font-medium">9 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Selling Items */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Top-Selling Menu Items</span>
            <span className="text-xs text-neutral-400 block mt-1">Ranked by order count and sales volume.</span>
          </div>

          <div className="mt-6 space-y-4">
            
            {/* Top Item 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-accent-emerald">#01</span>
                <div>
                  <span className="text-xs font-bold text-white block">Classic Cappuccino</span>
                  <span className="text-[10px] text-neutral-400">Coffee / Hot Beverages</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">84 sold</span>
                <span className="text-[10px] text-neutral-500">₹24,360</span>
              </div>
            </div>

            {/* Top Item 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-neutral-400">#02</span>
                <div>
                  <span className="text-xs font-bold text-white block">Avocado Sourdough Toast</span>
                  <span className="text-[10px] text-neutral-400">Snacks / Breads</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">56 sold</span>
                <span className="text-[10px] text-neutral-500">₹21,840</span>
              </div>
            </div>

            {/* Top Item 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-neutral-400">#03</span>
                <div>
                  <span className="text-xs font-bold text-white block">Aether Specialty Cold Brew</span>
                  <span className="text-[10px] text-neutral-400">Coffee / Cold Drinks</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white block">48 sold</span>
                <span className="text-[10px] text-neutral-500">₹16,800</span>
              </div>
            </div>

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
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold text-neutral-500 uppercase text-left tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Table</th>
                  <th className="pb-3">Staff</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                <tr>
                  <td className="py-4 font-bold text-white">#9281-A</td>
                  <td className="py-4">Table 04</td>
                  <td className="py-4">Rohan K.</td>
                  <td className="py-4">₹1,450</td>
                  <td className="py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-accent-amber bg-accent-amber/10 border border-accent-amber/20">preparing</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-white">#9280-B</td>
                  <td className="py-4">Table 12</td>
                  <td className="py-4">Anjali P.</td>
                  <td className="py-4">₹890</td>
                  <td className="py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/20">billed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-white">#9279-C</td>
                  <td className="py-4">Table 02</td>
                  <td className="py-4">Rohan K.</td>
                  <td className="py-4">₹2,840</td>
                  <td className="py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20">paid</span>
                  </td>
                </tr>
              </tbody>
            </table>
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
            
            {/* Suggested Item 1 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-white block">Special Matcha Latte</span>
                  <span className="text-[10px] text-neutral-400">Only 2 orders in 7 days</span>
                </div>
                <span className="text-xs font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded-lg">-15% Suggested</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-accent-emerald font-bold">
                  {discountStatus['matcha'] || ''}
                </span>
                {!discountStatus['matcha'] && (
                  <button 
                    onClick={() => handleApplyDiscount('matcha', 15)}
                    className="px-3 py-1.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-lg text-[10px] font-bold transition shadow-lg shadow-accent-indigo/20"
                  >
                    Apply Flash Discount
                  </button>
                )}
              </div>
            </div>

            {/* Suggested Item 2 */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.02]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-white block">Vegan Blueberry Muffin</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Only 1 order in 7 days</span>
                </div>
                <span className="text-xs font-bold text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded-lg">-20% Suggested</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-accent-emerald font-bold">
                  {discountStatus['muffin'] || ''}
                </span>
                {!discountStatus['muffin'] && (
                  <button 
                    onClick={() => handleApplyDiscount('muffin', 20)}
                    className="px-3 py-1.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-lg text-[10px] font-bold transition"
                  >
                    Apply Flash Discount
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
