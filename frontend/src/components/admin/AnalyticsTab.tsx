import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Card, T, ff, fm
} from './UIPrimitives';

const weeklyData = [
  { t: "Mon", v: 42000 }, { t: "Tue", v: 38000 }, { t: "Wed", v: 51000 }, { t: "Thu", v: 44000 },
  { t: "Fri", v: 62000 }, { t: "Sat", v: 78000 }, { t: "Sun", v: 71000 }
];

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  t: `${i + 1}`, v: Math.floor(30000 + Math.random() * 40000)
}));

const CATEGORY_CHART = [
  { name: "Coffee", value: 65, color: "#d97706" },
  { name: "Food", value: 25, color: "#16a34a" },
  { name: "Bakery", value: 10, color: "#ca8a04" }
];

export default function AnalyticsTab() {
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
                  <Pie data={CATEGORY_CHART} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {CATEGORY_CHART.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "140px" }}>
              {CATEGORY_CHART.map(c => (
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
