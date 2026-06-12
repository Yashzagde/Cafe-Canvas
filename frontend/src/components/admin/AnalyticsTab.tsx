import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Card, T, ff, fm
} from './UIPrimitives';

interface AnalyticsTabProps {
  bills?: any[];
}

function aggregateRevenue(bills: any[], period: 'weekly' | 'monthly' | 'yearly'): Array<{ t: string; v: number }> {
  const now = new Date();
  
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
        match.v += (b.total || b.total_paise || 0) / 100;
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
        match.v += (b.total || b.total_paise || 0) / 100;
      }
    });
    return monthlyData.map(({ t, v }) => ({ t, v }));
  }
  
  return [];
}

export default function AnalyticsTab({ bills = [] }: AnalyticsTabProps) {
  const monthlyData = React.useMemo(() => aggregateRevenue(bills, 'monthly'), [bills]);
  const weeklyData = React.useMemo(() => aggregateRevenue(bills, 'weekly'), [bills]);

  const categorySplit = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let totalItems = 0;
    
    bills.forEach(b => {
      (b.items || []).forEach((item: any) => {
        const cat = item.cat || item.category || 'Other';
        counts[cat] = (counts[cat] || 0) + (item.qty || 1);
        totalItems += (item.qty || 1);
      });
    });
    
    if (totalItems === 0) {
      return [
        { name: "Coffee", value: 60, color: "#d97706" },
        { name: "Food", value: 30, color: "#16a34a" },
        { name: "Bakery", value: 10, color: "#ca8a04" }
      ];
    }
    
    const colors = ['#d97706', '#16a34a', '#ca8a04', '#2563eb', '#9333ea', '#ea580c'];
    return Object.entries(counts).map(([name, qty], idx) => ({
      name,
      value: Math.round((qty / totalItems) * 100),
      color: colors[idx % colors.length]
    }));
  }, [bills]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Analytics</h2>
        <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Deep dive into revenue, category performance, and trends</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "4px" }}>Revenue Trend (30 Days)</div>
          <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>Daily revenue over the last month</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="t" tick={{ fill: T.mu, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.mu, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke={T.ind} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "4px" }}>Category Split</div>
          <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>Revenue share by category</div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ width: "150px", height: "180px", margin: "0 auto" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySplit} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {categorySplit.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "140px" }}>
              {categorySplit.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: T.mu2 }}>{c.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx, marginLeft: "auto" }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "4px" }}>Weekly Comparison</div>
        <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>Revenue by day of week</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="t" tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.mu, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip />
            <Bar dataKey="v" fill={T.em} radius={[6, 6, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
