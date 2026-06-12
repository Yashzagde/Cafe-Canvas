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
}

function aggregateRevenue(bills: any[], period: 'daily' | 'weekly' | 'monthly') {
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
          match.v += (b.total || b.total_paise || 0) / 100;
        }
      }
    });
    return hourlyData;
  }
  
  if (period === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      weeklyData.push({ t: days[d.getDay()], dateStr: d.toDateString(), v: 0 });
    }
    
    bills.forEach(b => {
      const date = new Date(b.created_at || b.paid_at);
      const match = weeklyData.find(d => d.dateStr === date.toDateString());
      if (match) {
        match.v += (b.total || b.total_paise || 0) / 100;
      }
    });
    return weeklyData.map(({ t, v }) => ({ t, v }));
  }
  
  if (period === 'monthly') {
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      monthlyData.push({ t: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`, dateStr: d.toDateString(), v: 0 });
    }
    
    bills.forEach(b => {
      const date = new Date(b.created_at || b.paid_at);
      const match = monthlyData.find(d => d.dateStr === date.toDateString());
      if (match) {
        match.v += (b.total || b.total_paise || 0) / 100;
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
  bills = []
}: DashboardTabProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  
  const chartData = React.useMemo(() => {
    return aggregateRevenue(bills, period);
  }, [bills, period]);

  const computedTopItems = React.useMemo(() => {
    const counts: Record<string, { qty: number, rev: number }> = {};
    bills.forEach(b => {
      (b.items || []).forEach((item: any) => {
        if (!counts[item.name]) {
          counts[item.name] = { qty: 0, rev: 0 };
        }
        counts[item.name].qty += item.qty || 1;
        counts[item.name].rev += (item.qty || 1) * (item.price || 0);
      });
    });
    
    const sorted = Object.entries(counts)
      .map(([name, data]) => ({ name, qty: data.qty, rev: data.rev }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
      
    if (sorted.length === 0) {
      return [
        { name: "Classic Cappuccino", qty: 24, rev: 4800 },
        { name: "Avocado Toast", qty: 15, rev: 3750 }
      ];
    }
    return sorted;
  }, [bills]);

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

  const totalTodayRupees = orders.reduce((sum, o) => sum + o.amount, 0);

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
        <Stat label="Orders Today" value={orders.length} trend="+14% vs yesterday" up icon="🛍" color={T.ind} />
        <Stat label="Revenue Today" value={`₹${totalTodayRupees.toLocaleString()}`} trend="+8.2% vs yesterday" up icon="₹" color={T.em} />
        <Stat label="Avg Order Value" value={`₹${orders.length > 0 ? Math.round(totalTodayRupees / orders.length) : 0}`} trend="-2.5% vs last week" icon="📊" color={T.amb} />
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
