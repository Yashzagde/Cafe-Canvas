import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Card, Btn, Stat, T, ff, fm, StatusBadge, Badge
} from './UIPrimitives';

// Type definitions matching admin/page.tsx
interface RecentOrder {
  id: string;
  tableId: string;
  desc: string;
  amount: number;
  status: string;
  age: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  section: string | null;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  floor_x: number;
  floor_y: number;
  qr_version: number;
}

interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'flat';
  value: number;
  validUntil: string;
  active: boolean;
}

interface DashboardTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
  tables: Table[];
  orders: RecentOrder[];
  bills?: any[];
  rawOrders?: any[];
}

function aggregateRevenue(bills: any[], period: 'daily' | 'weekly' | 'monthly'): Array<{ t: string; v: number }> {
  const now = new Date();
  
  if (period === 'daily') {
    const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];
    const hourlyData = hours.map(h => ({ t: h, v: 0 }));
    
    bills.forEach(b => {
      const date = new Date(b.created_at || b.paid_at);
      if (date.toDateString() === now.toDateString()) {
        const hour = date.getHours();
        let hourLabel = '';
        if (hour === 12) hourLabel = '12PM';
        else if (hour > 12) hourLabel = `${hour - 12}PM`;
        else hourLabel = `${hour === 0 ? 12 : hour}AM`;
        
        const match = hourlyData.find(d => d.t === hourLabel);
        if (match) {
          match.v += (b.total ?? 0) / 100;
        }
      }
    });
    return hourlyData;
  }
  
  if (period === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData: Array<{ t: string; dateStr: string; v: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      weeklyData.push({ t: days[d.getDay()], dateStr: d.toDateString(), v: 0 });
    }
    
    bills.forEach(b => {
      const date = new Date(b.created_at || b.paid_at);
      const match = weeklyData.find(d => d.dateStr === date.toDateString());
      if (match) {
        match.v += (b.total ?? 0) / 100;
      }
    });
    return weeklyData.map(({ t, v }) => ({ t, v }));
  }
  
  if (period === 'monthly') {
    const monthlyData: Array<{ t: string; dateStr: string; v: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      monthlyData.push({ t: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`, dateStr: d.toDateString(), v: 0 });
    }
    
    bills.forEach(b => {
      const date = new Date(b.created_at || b.paid_at);
      const match = monthlyData.find(d => d.dateStr === date.toDateString());
      if (match) {
        match.v += (b.total ?? 0) / 100;
      }
    });
    return monthlyData.map(({ t, v }) => ({ t, v }));
  }
  
  return [];
}

export default function DashboardTab({
  toast,
  discounts,
  setDiscounts,
  tables,
  orders,
  bills = [],
  rawOrders = []
}: DashboardTabProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  
  const chartData = React.useMemo(() => {
    return aggregateRevenue(bills, period);
  }, [bills, period]);

  const computedTopItems = React.useMemo(() => {
    const counts: Record<string, { qty: number, rev: number }> = {};
    // Derive top items from rawOrders which have order_items
    rawOrders.forEach((o: any) => {
      (o.order_items || []).forEach((item: any) => {
        const name = item.item_name || item.name;
        if (!name) return;
        if (!counts[name]) {
          counts[name] = { qty: 0, rev: 0 };
        }
        const qty = item.quantity || item.qty || 1;
        const unitPrice = (item.unit_price ?? 0) / 100; // paise to rupees
        counts[name].qty += qty;
        counts[name].rev += qty * unitPrice;
      });
    });
    
    const sorted = Object.entries(counts)
      .map(([name, data]) => ({ name, qty: data.qty, rev: data.rev }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
      
    if (sorted.length === 0) {
      return [
        { name: "No order data yet", qty: 0, rev: 0 }
      ];
    }
    return sorted;
  }, [rawOrders]);

  const maxTopQty = React.useMemo(() => {
    return Math.max(1, ...computedTopItems.map(item => item.qty));
  }, [computedTopItems]);


  const applyDiscount = (id: string, name: string, pct: number) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, active: true } : d));
    toast(`Flash ${pct}% discount applied to ${name}!`, "success");
  };

  // Explicit type instead of any
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#ffffff",
        border: `1px solid ${T.bdr}`,
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(120,113,108,0.06)"
      }}>
        <div style={{ fontSize: "10px", color: T.mu, marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>₹{payload[0].value.toLocaleString()}</div>
      </div>
    );
  };

  const stats = React.useMemo(() => {
    const now = new Date();
    
    // Setup local date boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);
    
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfPrevWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfPrevMonth = new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (period === 'daily') {
      const todayBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d.toDateString() === now.toDateString();
      });

      // Filter rawOrders for today (excluding cancelled ones)
      const todayOrders = rawOrders.filter(o => {
        const d = new Date(o.created_at);
        return d.toDateString() === now.toDateString() && o.status !== 'cancelled';
      });

      // Get set of all order IDs linked to today's bills to prevent double counting
      const billedOrderIds = new Set<string>();
      todayBills.forEach(b => {
        if (Array.isArray(b.order_ids)) {
          b.order_ids.forEach((id: string) => billedOrderIds.add(id));
        }
      });

      // Find today's orders that are not linked to today's bills (i.e. active/unbilled orders)
      const unbilledTodayOrders = todayOrders.filter(o => !billedOrderIds.has(o.id));

      const todayOrdersCount = todayBills.length + unbilledTodayOrders.length;
      const todayRevenue = todayBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const todayAvg = todayOrdersCount > 0 ? Math.round(todayRevenue / todayOrdersCount) : 0;
      
      const yesterdayBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d.toDateString() === startOfYesterday.toDateString();
      });
      const yesterdayOrdersCount = yesterdayBills.length;
      const yesterdayRevenue = yesterdayBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const yesterdayAvg = yesterdayOrdersCount > 0 ? Math.round(yesterdayRevenue / yesterdayOrdersCount) : 0;
      
      const ordersDiff = todayOrdersCount - yesterdayOrdersCount;
      const ordersTrendPct = yesterdayOrdersCount > 0 ? Math.round((ordersDiff / yesterdayOrdersCount) * 100) : 0;
      
      const revDiff = todayRevenue - yesterdayRevenue;
      const revTrendPct = yesterdayRevenue > 0 ? Math.round((revDiff / yesterdayRevenue) * 100) : 0;
      
      const avgDiff = todayAvg - yesterdayAvg;
      const avgTrendPct = yesterdayAvg > 0 ? Math.round((avgDiff / yesterdayAvg) * 100) : 0;

      return {
        ordersLabel: "Orders Today",
        ordersValue: todayOrdersCount,
        ordersTrend: yesterdayOrdersCount > 0
          ? `${ordersTrendPct >= 0 ? '+' : ''}${ordersTrendPct}% vs yesterday`
          : "no yesterday data",
        ordersUp: ordersTrendPct >= 0,
        
        revenueLabel: "Revenue Today",
        revenueValue: `₹${todayRevenue.toLocaleString()}`,
        revenueTrend: yesterdayRevenue > 0
          ? `${revTrendPct >= 0 ? '+' : ''}${revTrendPct}% vs yesterday`
          : "no yesterday data",
        revenueUp: revTrendPct >= 0,
        
        avgLabel: "Avg Order Value",
        avgValue: `₹${todayAvg.toLocaleString()}`,
        avgTrend: yesterdayAvg > 0
          ? `${avgTrendPct >= 0 ? '+' : ''}${avgTrendPct}% vs yesterday`
          : "no yesterday data",
        avgUp: avgTrendPct >= 0,
      };
    } else if (period === 'weekly') {
      const thisWeekBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d >= startOfWeek;
      });
      const thisWeekOrdersCount = thisWeekBills.length;
      const thisWeekRevenue = thisWeekBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const thisWeekAvg = thisWeekOrdersCount > 0 ? Math.round(thisWeekRevenue / thisWeekOrdersCount) : 0;
      
      const prevWeekBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d >= startOfPrevWeek && d < startOfWeek;
      });
      const prevWeekOrdersCount = prevWeekBills.length;
      const prevWeekRevenue = prevWeekBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const prevWeekAvg = prevWeekOrdersCount > 0 ? Math.round(prevWeekRevenue / prevWeekOrdersCount) : 0;
      
      const ordersDiff = thisWeekOrdersCount - prevWeekOrdersCount;
      const ordersTrendPct = prevWeekOrdersCount > 0 ? Math.round((ordersDiff / prevWeekOrdersCount) * 100) : 0;
      
      const revDiff = thisWeekRevenue - prevWeekRevenue;
      const revTrendPct = prevWeekRevenue > 0 ? Math.round((revDiff / prevWeekRevenue) * 100) : 0;
      
      const avgDiff = thisWeekAvg - prevWeekAvg;
      const avgTrendPct = prevWeekAvg > 0 ? Math.round((avgDiff / prevWeekAvg) * 100) : 0;

      return {
        ordersLabel: "Orders This Week",
        ordersValue: thisWeekOrdersCount,
        ordersTrend: prevWeekOrdersCount > 0
          ? `${ordersTrendPct >= 0 ? '+' : ''}${ordersTrendPct}% vs last week`
          : "no last week data",
        ordersUp: ordersTrendPct >= 0,
        
        revenueLabel: "Revenue This Week",
        revenueValue: `₹${thisWeekRevenue.toLocaleString()}`,
        revenueTrend: prevWeekRevenue > 0
          ? `${revTrendPct >= 0 ? '+' : ''}${revTrendPct}% vs last week`
          : "no last week data",
        revenueUp: revTrendPct >= 0,
        
        avgLabel: "Avg Order Value",
        avgValue: `₹${thisWeekAvg.toLocaleString()}`,
        avgTrend: prevWeekAvg > 0
          ? `${avgTrendPct >= 0 ? '+' : ''}${avgTrendPct}% vs last week`
          : "no last week data",
        avgUp: avgTrendPct >= 0,
      };
    } else {
      const thisMonthBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d >= startOfMonth;
      });
      const thisMonthOrdersCount = thisMonthBills.length;
      const thisMonthRevenue = thisMonthBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const thisMonthAvg = thisMonthOrdersCount > 0 ? Math.round(thisMonthRevenue / thisMonthOrdersCount) : 0;
      
      const prevMonthBills = bills.filter(b => {
        const d = new Date(b.created_at || b.paid_at);
        return d >= startOfPrevMonth && d < startOfMonth;
      });
      const prevMonthOrdersCount = prevMonthBills.length;
      const prevMonthRevenue = prevMonthBills.reduce((sum, b) => sum + (b.total ?? 0) / 100, 0);
      const prevMonthAvg = prevMonthOrdersCount > 0 ? Math.round(prevMonthRevenue / prevMonthOrdersCount) : 0;
      
      const ordersDiff = thisMonthOrdersCount - prevMonthOrdersCount;
      const ordersTrendPct = prevMonthOrdersCount > 0 ? Math.round((ordersDiff / prevMonthOrdersCount) * 100) : 0;
      
      const revDiff = thisMonthRevenue - prevMonthRevenue;
      const revTrendPct = prevMonthRevenue > 0 ? Math.round((revDiff / prevMonthRevenue) * 100) : 0;
      
      const avgDiff = thisMonthAvg - prevMonthAvg;
      const avgTrendPct = prevMonthAvg > 0 ? Math.round((avgDiff / prevMonthAvg) * 100) : 0;

      return {
        ordersLabel: "Orders This Month",
        ordersValue: thisMonthOrdersCount,
        ordersTrend: prevMonthOrdersCount > 0
          ? `${ordersTrendPct >= 0 ? '+' : ''}${ordersTrendPct}% vs last month`
          : "no last month data",
        ordersUp: ordersTrendPct >= 0,
        
        revenueLabel: "Revenue This Month",
        revenueValue: `₹${thisMonthRevenue.toLocaleString()}`,
        revenueTrend: prevMonthRevenue > 0
          ? `${revTrendPct >= 0 ? '+' : ''}${revTrendPct}% vs last month`
          : "no last month data",
        revenueUp: revTrendPct >= 0,
        
        avgLabel: "Avg Order Value",
        avgValue: `₹${thisMonthAvg.toLocaleString()}`,
        avgTrend: prevMonthAvg > 0
          ? `${avgTrendPct >= 0 ? '+' : ''}${avgTrendPct}% vs last month`
          : "no last month data",
        avgUp: avgTrendPct >= 0,
      };
    }
  }, [period, bills, rawOrders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Dashboard Overview</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Real-time performance metrics</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {(["daily", "weekly", "monthly"] as const).map(p => (
            <Btn key={p} onClick={() => setPeriod(p)} variant={period === p ? "primary" : "ghost"} size="sm">
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Btn>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        <Stat label={stats.ordersLabel} value={stats.ordersValue} trend={stats.ordersTrend} up={stats.ordersUp} icon="🛍" color={T.ind} />
        <Stat label={stats.revenueLabel} value={stats.revenueValue} trend={stats.revenueTrend} up={stats.revenueUp} icon="₹" color={T.em} />
        <Stat label={stats.avgLabel} value={stats.avgValue} trend={stats.avgTrend} up={stats.avgUp} icon="📊" color={T.amb} />
        <Stat label="Live Occupancy" value={`${tables.length > 0 ? Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100) : 0}%`} trend={`${tables.filter(t => t.status === 'occupied').length}/${tables.length} tables active`} up icon="👥" color={T.ind} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>Revenue Analytics</div>
              <div style={{ fontSize: "11px", color: T.mu2, marginTop: "2px" }}>
                {period === "daily" ? "Today by hour" : period === "weekly" ? "Last 7 days" : "Last 30 days"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["area", "bar"] as const).map(t => (
                <Btn key={t} onClick={() => setChartType(t)} variant={chartType === t ? "primary" : "ghost"} size="sm">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Btn>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.ind} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={T.ind} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="v" stroke={T.ind} strokeWidth={2} fill="url(#cg)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <XAxis dataKey="t" tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="v" fill={T.ind} radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "4px" }}>Top-Selling Items</div>
          <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>By order count</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {computedTopItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: i === 0 ? T.em : T.mu, minWidth: "22px", fontFamily: fm }}>
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "10px", color: T.mu }}>{item.qty} sold · ₹{item.rev.toLocaleString()}</div>
                </div>
                <div style={{ width: "50px", height: "4px", borderRadius: "2px", background: T.bdr, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(item.qty / maxTopQty * 100).toFixed(0)}%`, background: i === 0 ? T.em : T.ind, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>Recent Transactions</div>
              <div style={{ fontSize: "11px", color: T.mu2, marginTop: "2px" }}>Live order feed</div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.bdr}` }}>
                  {["Order ID", "Table", "Amount", "Status", "Time"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0 0 10px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                    <td style={{ padding: "10px 0", fontSize: "12px", fontWeight: 700, color: T.tx, fontFamily: fm }}>{o.id}</td>
                    <td style={{ padding: "10px 0", fontSize: "11px", color: T.mu2 }}>{o.tableId}</td>
                    <td style={{ padding: "10px 0", fontSize: "12px", color: T.tx }}>₹{o.amount.toLocaleString()}</td>
                    <td style={{ padding: "10px 0" }}><StatusBadge s={o.status} /></td>
                    <td style={{ padding: "10px 0", fontSize: "11px", color: T.mu }}>{o.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: T.rose }} />
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>Smart Suggestions</div>
          </div>
          <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>Boost sales on low-selling products</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { id: "d1", name: "Matcha Latte Special", pct: 15, sold: 2 },
              { id: "d2", name: "Vegan Blueberry Muffin", pct: 20, sold: 1 }
            ].map(s => {
              const isApplied = discounts.find(d => d.id === s.id)?.active;
              return (
                <div key={s.id} style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.bdr}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx }}>{s.name}</div>
                      <div style={{ fontSize: "10px", color: T.mu }}>{s.sold} orders this week</div>
                    </div>
                    <Badge color="rose">-{s.pct}% rec.</Badge>
                  </div>
                  {isApplied ? (
                    <span style={{ fontSize: "10px", color: T.em, fontWeight: 700 }}>✓ Flash discount active!</span>
                  ) : (
                    <Btn size="sm" onClick={() => applyDiscount(s.id, s.name, s.pct)} style={{ width: "100%" }}>
                      Apply Flash Discount
                    </Btn>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
