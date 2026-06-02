'use client'

import * as React from 'react'
import { 
  IndianRupee, 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Coffee,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1: Today Revenue */}
        <Card className="hover:border-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today's Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <IndianRupee className="w-4 h-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">₹42,850.00</div>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <span>+18.2% from yesterday</span>
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 2: Orders Today */}
        <Card className="hover:border-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Orders Today
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">142</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <span>+8.4% from yesterday</span>
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 3: Active Tables */}
        <Card className="hover:border-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Tables
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">12 / 20</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <span>60% occupancy rate</span>
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 4: Avg Order Value */}
        <Card className="hover:border-slate-800 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Order Value
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">₹301.76</div>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1">
              <span>+3.2% weekly avg</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. REVENUE TRENDS & TOP ITEMS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Side: Weekly Revenue Trends Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-slate-200">Revenue Analysis</CardTitle>
            <CardDescription className="text-slate-500">Weekly revenue trends (₹ paise equivalent)</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-2 pt-6">
            {/* Custom Glowing CSS Bars for premium interactive feel */}
            {[
              { day: 'Mon', val: 60 },
              { day: 'Tue', val: 45 },
              { day: 'Wed', val: 75 },
              { day: 'Thu', val: 55 },
              { day: 'Fri', val: 90 },
              { day: 'Sat', val: 100 },
              { day: 'Sun', val: 85 }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div 
                  className="w-full bg-slate-800 rounded-md relative overflow-hidden flex items-end" 
                  style={{ height: '80%' }}
                >
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all rounded-md shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                    style={{ height: `${bar.val}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-semibold">{bar.day}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side: Top selling items */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-slate-200">Top Selling Items</CardTitle>
            <CardDescription className="text-slate-500">Most popular choices this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Masala Chai', qty: 245, rev: '₹6,125.00', pct: 85 },
              { name: 'Paneer Tikka Roll', qty: 142, rev: '₹21,300.00', pct: 60 },
              { name: 'Cold Coffee with Ice Cream', qty: 110, rev: '₹13,200.00', pct: 48 },
              { name: 'Cheese Garlic Bread', qty: 85, rev: '₹10,200.00', pct: 36 }
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{item.qty} sold</span>
                </div>
                {/* Horizontal Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 3. RECENT ORDERS TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-slate-200">Recent Table Sessions</CardTitle>
            <CardDescription className="text-slate-500">Live ordering flows and serving statuses</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <span>View KDS Display</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="pb-3">Table</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Items Count</th>
                <th className="pb-3">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40 text-slate-300">
              {[
                { table: 'T-04', cust: 'Aarav Mehta', status: 'preparing', items: 3, total: '₹540.00' },
                { table: 'T-12', cust: 'Diya Sharma', status: 'ready', items: 5, total: '₹1,240.00' },
                { table: 'T-02', cust: 'Rohan Joshi', status: 'served', items: 2, total: '₹420.00' },
                { table: 'T-08', cust: 'Neha Patil', status: 'billed', items: 4, total: '₹890.00' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-900/20 transition-all">
                  <td className="py-4 font-bold text-slate-200">{row.table}</td>
                  <td className="py-4 font-medium">{row.cust}</td>
                  <td className="py-4">
                    <Badge variant={
                      row.status === 'preparing' ? 'warning' :
                      row.status === 'ready' ? 'primary' :
                      row.status === 'served' ? 'success' : 'secondary'
                    }>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-4 font-semibold">{row.items}</td>
                  <td className="py-4 font-bold text-slate-200">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
