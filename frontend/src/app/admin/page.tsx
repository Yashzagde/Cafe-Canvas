'use client';

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  LayoutDashboard, Store, Users, Settings, Coffee,
  Receipt, Percent, BarChart3, Plus, Trash2, Printer,
  Check, Search, CreditCard, Banknote, Smartphone, X
} from 'lucide-react';
import ReceiptPreviewModal from '@/components/billing/ReceiptPreviewModal';
import type { ReceiptData } from '@/components/billing/types';
import { DEFAULT_STORE_INFO } from '@/components/billing/types';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  bg:    "#09090b",
  card:  "rgba(16,16,21,0.88)",
  card2: "rgba(22,22,30,0.6)",
  bdr:   "rgba(255,255,255,0.07)",
  bdrH:  "rgba(255,255,255,0.14)",
  ind:   "#6366f1",
  em:    "#10b981",
  rose:  "#f43f5e",
  amb:   "#f59e0b",
  tx:    "#f1f1f3",
  mu:    "#6b7280",
  mu2:   "#9ca3af",
  iA: (o: number) => `rgba(99,102,241,${o})`,
  eA: (o: number) => `rgba(16,185,129,${o})`,
  rA: (o: number) => `rgba(244,63,94,${o})`,
  aA: (o: number) => `rgba(245,158,11,${o})`,
};

const G = {
  background: T.card,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: `1px solid ${T.bdr}`,
  borderRadius: "12px",
};

const ff = "var(--font-sans), sans-serif";
const fm = "'DM Mono', monospace";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface MenuItem {
  id: string;
  name: string;
  price: number;
  cat: string;
  status: 'available' | 'unavailable' | 'hidden';
  desc: string;
}

interface Table {
  id: string;
  name: string;
  section: string;
  cap: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

interface BillItem {
  id: string;
  _key: string;
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

interface BillHistoryEntry {
  id: string;
  table: string;
  section: string;
  time: string;
  method: string;
  sub: number;
  gst: number;
  svc: number;
  discount: number;
  total: number;
  itemsCount: number;
  billItems: BillItem[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spend: number;
  last: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'flat';
  value: number;
  validUntil: string;
  active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: string;
  uses: number;
  maxUses: number;
  active: boolean;
}

/* ═══════════════════════════════════════════════════════════
   INITIAL DATA
═══════════════════════════════════════════════════════════ */
const MENU_CAT = ["All", "Coffee", "Tea", "Food", "Bakery", "Drinks"];
const INIT_MENU: MenuItem[] = [
  { id: "m1", name: "Classic Cappuccino", price: 290, cat: "Coffee", status: "available", desc: "Double ristretto, microfoam, 6oz" },
  { id: "m2", name: "Specialty Cold Brew", price: 350, cat: "Coffee", status: "available", desc: "24-hr Ethiopian single origin" },
  { id: "m3", name: "Matcha Latte Special", price: 320, cat: "Tea", status: "available", desc: "Ceremonial grade Uji matcha" },
  { id: "m4", name: "Avocado Sourdough Toast", price: 390, cat: "Food", status: "available", desc: "Organic avocado, feta, dukkah" },
  { id: "m5", name: "Almond Butter Croissant", price: 240, cat: "Bakery", status: "available", desc: "Flaky, house almond cream" },
  { id: "m6", name: "Green Tea Mint Infusion", price: 210, cat: "Tea", status: "available", desc: "Loose-leaf Darjeeling, fresh mint" },
  { id: "m7", name: "Chocolate Truffle Pastry", price: 180, cat: "Bakery", status: "unavailable", desc: "Dark Valrhona 72% ganache" },
  { id: "m8", name: "Vegan Blueberry Muffin", price: 160, cat: "Bakery", status: "available", desc: "Plant-based, chia, organic flour" },
  { id: "m9", name: "Aether Loaded Burrito", price: 420, cat: "Food", status: "available", desc: "Grilled chicken, chipotle, salsa" },
  { id: "m10", name: "Hibiscus Rose Cooler", price: 230, cat: "Drinks", status: "available", desc: "House hibiscus, rose water, lime" },
];

const INIT_TABLES: Table[] = [
  { id: "T01", name: "Table 01", section: "Indoor", cap: 2, status: "available" },
  { id: "T02", name: "Table 02", section: "Indoor", cap: 4, status: "occupied" },
  { id: "T03", name: "Table 03", section: "Indoor", cap: 4, status: "occupied" },
  { id: "T04", name: "Table 04", section: "Indoor", cap: 6, status: "available" },
  { id: "T05", name: "Table 05", section: "Outdoor", cap: 2, status: "reserved" },
  { id: "T06", name: "Table 06", section: "Outdoor", cap: 4, status: "occupied" },
  { id: "T07", name: "Table 07", section: "Outdoor", cap: 2, status: "available" },
  { id: "T08", name: "Table 08", section: "Bar", cap: 1, status: "occupied" },
  { id: "T09", name: "Table 09", section: "Bar", cap: 1, status: "cleaning" },
  { id: "T10", name: "Table 10", section: "Indoor", cap: 6, status: "available" },
];

const TABLE_ORDERS: Record<string, BillItem[]> = {
  T02: [
    { id: "oi1", _key: "oi1", itemId: "m1", name: "Classic Cappuccino", qty: 2, price: 290 },
    { id: "oi2", _key: "oi2", itemId: "m4", name: "Avocado Sourdough Toast", qty: 2, price: 390 },
    { id: "oi3", _key: "oi3", itemId: "m8", name: "Vegan Blueberry Muffin", qty: 1, price: 160 },
  ],
  T03: [
    { id: "oi4", _key: "oi4", itemId: "m2", name: "Specialty Cold Brew", qty: 3, price: 350 },
    { id: "oi5", _key: "oi5", itemId: "m5", name: "Almond Butter Croissant", qty: 2, price: 240 },
  ],
  T06: [
    { id: "oi6", _key: "oi6", itemId: "m3", name: "Matcha Latte Special", qty: 1, price: 320 },
    { id: "oi7", _key: "oi7", itemId: "m9", name: "Aether Loaded Burrito", qty: 2, price: 420 },
    { id: "oi8", _key: "oi8", itemId: "m10", name: "Hibiscus Rose Cooler", qty: 2, price: 230 },
  ],
  T08: [
    { id: "oi9", _key: "oi9", itemId: "m1", name: "Classic Cappuccino", qty: 1, price: 290 },
    { id: "oia", _key: "oia", itemId: "m7", name: "Chocolate Truffle Pastry", qty: 2, price: 180 },
  ],
};

const INIT_BILL_HISTORY: BillHistoryEntry[] = [
  {
    id: "B-0041", table: "Table 03", section: "Indoor", time: "2:45 PM", method: "UPI", sub: 1480, gst: 74, svc: 74, discount: 0, total: 1628, itemsCount: 4,
    billItems: [
      { id: "oi4", _key: "oi4", itemId: "m2", name: "Specialty Cold Brew", qty: 3, price: 350 },
      { id: "oi5", _key: "oi5", itemId: "m5", name: "Almond Butter Croissant", qty: 2, price: 240 },
    ]
  },
  {
    id: "B-0040", table: "Table 07", section: "Outdoor", time: "1:20 PM", method: "CASH", sub: 860, gst: 43, svc: 43, discount: 0, total: 946, itemsCount: 3,
    billItems: [
      { id: "oi6", _key: "oi6", itemId: "m3", name: "Matcha Latte Special", qty: 1, price: 320 },
      { id: "oi7", _key: "oi7", itemId: "m9", name: "Aether Loaded Burrito", qty: 1, price: 420 },
    ]
  },
  {
    id: "B-0039", table: "Table 01", section: "Indoor", time: "12:05 PM", method: "CARD", sub: 2340, gst: 117, svc: 117, discount: 0, total: 2574, itemsCount: 6,
    billItems: [
      { id: "oi2", _key: "oi2", itemId: "m4", name: "Avocado Sourdough Toast", qty: 6, price: 390 }
    ]
  },
];

const INIT_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Priya Sharma", phone: "9876543290", visits: 23, spend: 34250, last: "27 May 2026", tier: "Gold" },
  { id: "c2", name: "Arjun Mehta", phone: "9812345634", visits: 14, spend: 19800, last: "25 May 2026", tier: "Silver" },
  { id: "c3", name: "Kavya Nair", phone: "9934567856", visits: 8, spend: 10900, last: "22 May 2026", tier: "Bronze" },
  { id: "c4", name: "Rohit Joshi", phone: "9845123412", visits: 31, spend: 52000, last: "27 May 2026", tier: "Platinum" },
  { id: "c5", name: "Sneha Patel", phone: "9967778877", visits: 5, spend: 6800, last: "20 May 2026", tier: "Bronze" },
];

const INIT_ORDERS = [
  { id: "#9281", tableId: "T02", desc: "Cappuccino ×2, Toast ×2, Muffin ×1", amount: 1360, status: "preparing", age: "8 min ago" },
  { id: "#9280", tableId: "T06", desc: "Matcha ×1, Burrito ×2, Cooler ×2", amount: 1620, status: "ready", age: "14 min ago" },
  { id: "#9279", tableId: "T03", desc: "Cold Brew ×3, Croissant ×2", amount: 1530, status: "confirmed", age: "22 min ago" },
  { id: "#9278", tableId: "T08", desc: "Cappuccino ×1, Truffle Pastry ×2", amount: 650, status: "pending", age: "3 min ago" },
];

const INIT_DISCOUNTS: Discount[] = [
  { id: "d1", name: "Weekday Flash 15%", type: "percent", value: 15, validUntil: "30 May 2026", active: true },
  { id: "d2", name: "Happy Hour 10%", type: "percent", value: 10, validUntil: "31 May 2026", active: true },
  { id: "d3", name: "Student Discount", type: "flat", value: 50, validUntil: "31 Dec 2026", active: false },
];

const INIT_COUPONS: Coupon[] = [
  { id: "cp1", code: "AETHER20", discount: "20% OFF", uses: 48, maxUses: 100, active: true },
  { id: "cp2", code: "FIRSTCUP", discount: "₹100 OFF", uses: 12, maxUses: 50, active: true },
];

const dailyData = [
  { t: "8AM", v: 2100 }, { t: "9AM", v: 4800 }, { t: "10AM", v: 7200 }, { t: "11AM", v: 6400 },
  { t: "12PM", v: 14200 }, { t: "1PM", v: 12800 }, { t: "2PM", v: 9600 }, { t: "3PM", v: 7100 },
  { t: "4PM", v: 8400 }, { t: "5PM", v: 10200 }, { t: "6PM", v: 14800 }, { t: "7PM", v: 11600 },
];
const weeklyData = [
  { t: "Mon", v: 42000 }, { t: "Tue", v: 38000 }, { t: "Wed", v: 51000 }, { t: "Thu", v: 44000 },
  { t: "Fri", v: 62000 }, { t: "Sat", v: 78000 }, { t: "Sun", v: 71000 },
];
const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  t: `${i + 1}`, v: Math.floor(30000 + Math.random() * 40000)
}));
const topItems = [
  { name: "Classic Cappuccino", qty: 84, rev: 24360 },
  { name: "Avocado Toast", qty: 56, rev: 21840 },
  { name: "Cold Brew", qty: 48, rev: 16800 },
  { name: "Loaded Burrito", qty: 31, rev: 13020 },
  { name: "Matcha Latte", qty: 27, rev: 8640 },
];
const CATEGORY_CHART = [
  { name: "Coffee", value: 42, color: "#6366f1" },
  { name: "Food", value: 28, color: "#10b981" },
  { name: "Bakery", value: 16, color: "#f59e0b" },
  { name: "Tea", value: 8, color: "#3b82f6" },
  { name: "Drinks", value: 6, color: "#f43f5e" },
];

/* ═══════════════════════════════════════════════════════════
   UI PRIMITIVES (TypeScript adapted)
═══════════════════════════════════════════════════════════ */
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "emerald" | "rose" | "amber" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, fullWidth, style }: BtnProps) {
  const [hov, setHov] = useState(false);
  const sz = {
    sm: { padding: "5px 10px", fontSize: "10px" },
    md: { padding: "8px 14px", fontSize: "11px" },
    lg: { padding: "11px 20px", fontSize: "13px" }
  };
  const vr = {
    primary: { background: hov ? "#5254cc" : T.ind, color: "#fff" },
    emerald: { background: hov ? "#0d9668" : T.em, color: "#fff" },
    rose: { background: hov ? "#e02848" : T.rose, color: "#fff" },
    amber: { background: hov ? "#d98a08" : T.amb, color: "#fff" },
    ghost: { background: hov ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", color: T.mu2, border: `1px solid ${T.bdr}` },
    outline: { background: "transparent", color: T.ind, border: `1px solid ${T.ind}` },
    danger: { background: hov ? "rgba(244,63,94,0.2)" : "rgba(244,63,94,0.1)", color: T.rose, border: `1px solid ${T.rA(0.3)}` },
  };
  return (
    <button
      style={{
        ...sz[size], ...vr[variant], borderRadius: "8px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: ff, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
        opacity: disabled ? 0.45 : 1, transition: "all 0.15s", width: fullWidth ? "100%" : "auto", ...style
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
    >{children}</button>
  );
}

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const cols: Record<string, { bg: string; tc: string; br: string }> = {
    gray: { bg: "rgba(255,255,255,0.07)", tc: T.mu2, br: `1px solid ${T.bdr}` },
    indigo: { bg: T.iA(0.12), tc: T.ind, br: `1px solid ${T.iA(0.25)}` },
    emerald: { bg: T.eA(0.12), tc: T.em, br: `1px solid ${T.eA(0.25)}` },
    rose: { bg: T.rA(0.12), tc: T.rose, br: `1px solid ${T.rA(0.25)}` },
    amber: { bg: T.aA(0.12), tc: T.amb, br: `1px solid ${T.aA(0.25)}` },
    gold: { bg: "rgba(234,179,8,0.12)", tc: "#eab308", br: "1px solid rgba(234,179,8,0.25)" },
    blue: { bg: "rgba(59,130,246,0.12)", tc: "#60a5fa", br: "1px solid rgba(59,130,246,0.25)" },
  };
  const c = cols[color] || cols.gray;
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase", background: c.bg, color: c.tc, border: c.br
    }}>{children}</span>
  );
}

function StatusBadge({ s }: { s: string }) {
  const m: Record<string, string> = {
    available: "emerald", occupied: "rose", reserved: "amber", cleaning: "indigo",
    pending: "amber", confirmed: "blue", preparing: "amber", ready: "emerald",
    served: "gray", paid: "emerald", billed: "indigo", cancelled: "rose",
    available_menu: "emerald", unavailable: "rose", hidden: "gray"
  };
  return <Badge color={m[s] || "gray"}>{s}</Badge>;
}

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  active?: boolean;
  hover?: boolean;
}

function Card({ children, style, onClick, active, hover = false }: CardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...G, cursor: onClick ? "pointer" : "default", transition: "all 0.15s",
        ...(active ? { border: `1px solid ${T.iA(0.5)}`, background: T.iA(0.08) } : {}),
        ...(hover && hov && !active ? { border: `1px solid ${T.bdrH}`, background: "rgba(22,22,30,0.92)" } : {}),
        ...style
      }}
    >{children}</div>
  );
}

interface InputProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
}

function Input({ label, value, onChange, placeholder, type = "text", style }: InputProps) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      {label && <label style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          background: "rgba(255,255,255,0.04)", border: `1px solid ${foc ? T.ind : T.bdr}`, borderRadius: "8px",
          padding: "8px 11px", color: T.tx, fontSize: "12px", fontFamily: ff, outline: "none", width: "100%",
          transition: "border-color 0.15s", boxSizing: "border-box"
        }}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      />
    </div>
  );
}

interface SelProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function Sel({ label, value, onChange, children, style }: SelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      {label && <label style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{
          background: "rgba(255,255,255,0.04)", border: `1px solid ${T.bdr}`, borderRadius: "8px",
          padding: "8px 11px", color: T.tx, fontSize: "12px", fontFamily: ff, outline: "none", width: "100%", cursor: "pointer"
        }}
      >{children}</select>
    </div>
  );
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

function Modal({ show, onClose, title, children, width = 440 }: ModalProps) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          ...G, width: "100%", maxWidth: `${width}px`, maxHeight: "90vh", overflowY: "auto",
          background: "rgba(12,12,16,0.97)", border: "1px solid rgba(255,255,255,0.12)"
        }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${T.bdr}`, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: T.mu, cursor: "pointer",
            fontSize: "20px", lineHeight: 1, padding: "0 4px"
          }}>×</button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onClose }: { msg: string; type?: "success" | "error" | "warning"; onClose: () => void }) {
  const col = type === "success" ? T.em : type === "error" ? T.rose : T.amb;
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
      background: "rgba(12,12,16,0.97)", border: `1px solid ${col}40`, borderRadius: "10px",
      padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", minWidth: "280px",
      boxShadow: `0 4px 24px rgba(0,0,0,0.5)`
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: col, flexShrink: 0 }} />
      <span style={{ fontSize: "12px", color: T.tx, fontWeight: 500, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.mu, cursor: "pointer", fontSize: "16px" }}>×</button>
    </div>
  );
}

function useToast() {
  const [t, setT] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);
  const show = (msg: string, type: "success" | "error" | "warning" = "success") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3000);
  };
  return [t, show] as const;
}

interface StatProps {
  label: string;
  value: string | number;
  trend?: string;
  up?: boolean;
  icon?: string;
  color?: string;
}

function Stat({ label, value, trend, up, icon, color }: StatProps) {
  const col = color || T.ind;
  return (
    <Card style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "7px" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>{value}</div>
        {trend && <div style={{ fontSize: "10px", fontWeight: 700, color: up ? T.em : T.rose, marginTop: "4px" }}>{up ? "▲" : "▼"} {trend}</div>}
      </div>
      {icon && <div style={{
        width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
        background: `${col}18`, border: `1px solid ${col}30`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "18px"
      }}>{icon}</div>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: DASHBOARD
═══════════════════════════════════════════════════════════ */
interface PageProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
}

function DashboardPage({ toast, discounts, setDiscounts }: PageProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const chartData = period === "daily" ? dailyData : period === "weekly" ? weeklyData : monthlyData;

  const applyDiscount = (id: string, name: string, pct: number) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, active: true } : d));
    toast(`Flash ${pct}% discount applied to ${name}!`, "success");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "rgba(12,12,16,0.96)", border: `1px solid ${T.bdr}`, borderRadius: "8px", padding: "8px 12px" }}>
        <div style={{ fontSize: "10px", color: T.mu, marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>₹{payload[0].value.toLocaleString()}</div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Dashboard Overview</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Real-time performance for AETHER Cafe & Roastery</p>
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
        <Stat label="Orders Today" value="124" trend="+14% vs yesterday" up icon="🛍" color={T.ind} />
        <Stat label="Revenue Today" value="₹48,250" trend="+8.2% vs yesterday" up icon="₹" color={T.em} />
        <Stat label="Avg Order Value" value="₹389" trend="-2.5% vs last week" icon="📊" color={T.amb} />
        <Stat label="Live Occupancy" value="68%" trend="18/25 covers active" up icon="👥" color={T.ind} />
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
            {topItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: i === 0 ? T.em : T.mu, minWidth: "22px", fontFamily: fm }}>
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: "10px", color: T.mu }}>{item.qty} sold · ₹{item.rev.toLocaleString()}</div>
                </div>
                <div style={{ width: "50px", height: "4px", borderRadius: "2px", background: T.bdr, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(item.qty / 84 * 100).toFixed(0)}%`, background: i === 0 ? T.em : T.ind, borderRadius: "2px" }} />
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
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.bdr}` }}>
                  {["Order ID", "Table", "Amount", "Status", "Time"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0 0 10px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INIT_ORDERS.map(o => (
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
          <div style={{ fontSize: "11px", color: T.mu2, marginBottom: "14px" }}>Low-selling items · boost now</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { id: "d1", name: "Matcha Latte Special", pct: 15, sold: 2 },
              { id: "d2", name: "Vegan Blueberry Muffin", pct: 20, sold: 1 },
              { id: "d3", name: "Student Discount", pct: 10, sold: 3 },
            ].map(s => {
              const isApplied = discounts.find(d => d.id === s.id)?.active;
              return (
                <div key={s.id} style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.bdr}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx }}>{s.name}</div>
                      <div style={{ fontSize: "10px", color: T.mu }}>{s.sold} orders in 7 days</div>
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

/* ═══════════════════════════════════════════════════════════
   PAGE: MENU MANAGEMENT
═══════════════════════════════════════════════════════════ */
function MenuPage({ toast, menu, setMenu }: PageProps) {
  const [cat, setCat] = useState("All");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: "", price: 0, cat: "Coffee", status: "available", desc: "" });
  const [delId, setDelId] = useState<string | null>(null);

  const filtered = menu.filter(i => (cat === "All" || i.cat === cat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())));

  const toggle = (id: string) => {
    setMenu(p => p.map(i => i.id === id ? { ...i, status: i.status === "available" ? "unavailable" : "available" } : i));
    toast("Item availability updated", "success");
  };
  const saveEdit = () => {
    if (!editItem) return;
    setMenu(p => p.map(i => i.id === editItem.id ? editItem : i));
    setEditItem(null);
    toast("Menu item saved successfully", "success");
  };
  const addItem = () => {
    if (!newItem.name || !newItem.price) { toast("Name and price are required", "error"); return; }
    const id = "m" + (menu.length + 1);
    setMenu(p => [...p, { ...newItem, id, price: Number(newItem.price) } as MenuItem]);
    setShowAdd(false);
    setNewItem({ name: "", price: 0, cat: "Coffee", status: "available", desc: "" });
    toast("Menu item added!", "success");
  };
  const deleteItem = (id: string) => {
    setMenu(p => p.filter(i => i.id !== id));
    setDelId(null);
    toast("Item removed from menu", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Menu Management</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Configure categories, items, modifiers, and pricing</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Menu Item</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "16px", height: "fit-content" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Categories</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {MENU_CAT.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: ff,
                  fontSize: "12px", fontWeight: 600, transition: "all 0.12s",
                  background: cat === c ? T.iA(0.15) : "transparent",
                  color: cat === c ? T.tx : T.mu2
                }}>
                {c}
                <span style={{ float: "right", fontSize: "10px", color: T.mu }}>
                  {c === "All" ? menu.length : menu.filter(i => i.cat === c).length}
                </span>
              </button>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${T.bdr}`, marginTop: "12px", paddingTop: "12px" }}>
            <div style={{ fontSize: "10px", color: T.mu, marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: T.mu2 }}>Available</span>
                <span style={{ color: T.em, fontWeight: 700 }}>{menu.filter(i => i.status === "available").length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: T.mu2 }}>Unavailable</span>
                <span style={{ color: T.rose, fontWeight: 700 }}>{menu.filter(i => i.status !== "available").length}</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ gridColumn: "span 3" }}>
          <div style={{ marginBottom: "14px" }}>
            <Input placeholder="Search menu items…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Card style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ color: T.mu, fontSize: "13px" }}>No items found</div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {filtered.map(item => (
                <Card key={item.id} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    height: "80px", background: `linear-gradient(135deg,${T.iA(0.12)},rgba(16,185,129,0.08))`,
                    padding: "12px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative"
                  }}>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <StatusBadge s={item.status === "available" ? "available" : "unavailable"} />
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: T.iA(0.9), textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.cat}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: T.tx, marginTop: "2px" }}>{item.name}</div>
                  </div>
                  <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ fontSize: "10px", color: T.mu2, lineHeight: 1.4, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: T.tx, fontFamily: fm }}>₹{item.price}</span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <Btn size="sm" variant="ghost" onClick={() => toggle(item.id)}>
                          {item.status === "available" ? "Disable" : "Enable"}
                        </Btn>
                        <Btn size="sm" variant="outline" onClick={() => setEditItem({ ...item })}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => setDelId(item.id)}>✕</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={!!editItem} onClose={() => setEditItem(null)} title="Edit Menu Item">
        {editItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Input label="Item Name" value={editItem.name} onChange={e => setEditItem(p => (p ? { ...p, name: e.target.value } : null))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input label="Price (₹)" type="number" value={editItem.price} onChange={e => setEditItem(p => (p ? { ...p, price: Number(e.target.value) } : null))} />
              <Sel label="Status" value={editItem.status} onChange={e => setEditItem(p => (p ? { ...p, status: e.target.value as any } : null))}>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="hidden">Hidden</option>
              </Sel>
            </div>
            <Input label="Description" value={editItem.desc} onChange={e => setEditItem(p => (p ? { ...p, desc: e.target.value } : null))} />
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <Btn onClick={saveEdit} fullWidth>Save Changes</Btn>
              <Btn variant="ghost" onClick={() => setEditItem(null)} fullWidth>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Menu Item">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Item Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Flat White" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input label="Price (₹)" type="number" value={newItem.price || ''} onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))} placeholder="0" />
            <Sel label="Category" value={newItem.cat} onChange={e => setNewItem(p => ({ ...p, cat: e.target.value }))}>
              {["Coffee", "Tea", "Food", "Bakery", "Drinks"].map(c => <option key={c}>{c}</option>)}
            </Sel>
          </div>
          <Input label="Description" value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} placeholder="Short description…" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addItem} fullWidth>Add Item</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal show={!!delId} onClose={() => setDelId(null)} title="Confirm Delete">
        <p style={{ fontSize: "13px", color: T.mu2, marginBottom: "20px" }}>
          This will permanently remove the item from your menu. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="rose" onClick={() => delId && deleteItem(delId)} fullWidth>Delete Item</Btn>
          <Btn variant="ghost" onClick={() => setDelId(null)} fullWidth>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: BILLING OPERATING SYSTEM (POS THERMAL INTEGRATED)
═══════════════════════════════════════════════════════════ */
interface BillingOSProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  menu: MenuItem[];
  triggerReceipt: (data: ReceiptData) => void;
}

function BillingOS({ toast, menu, triggerReceipt }: BillingOSProps) {
  const [tables, setTables] = useState<Table[]>(INIT_TABLES);
  const [tableOrders, setTableOrders] = useState<Record<string, BillItem[]>>(TABLE_ORDERS);
  const [billHistory, setBillHistory] = useState<BillHistoryEntry[]>(INIT_BILL_HISTORY);
  const [view, setView] = useState<"floor" | "session" | "history">("floor");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [gstOn, setGstOn] = useState(true);
  const [svcOn, setSvcOn] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "upi">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [payStep, setPayStep] = useState<"review" | "success">("review");
  const [histSearch, setHistSearch] = useState("");
  const [menuAddOpen, setMenuAddOpen] = useState(false);
  const [addItemId, setAddItemId] = useState("m1");
  const [addItemQty, setAddItemQty] = useState(1);
  const [billCounter, setBillCounter] = useState(42);

  // Editable Tax & Billing Settings
  const [billingSettings, setBillingSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cafe_canva_billing_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      serviceChargeType: "percent" as "percent" | "flat",
      serviceChargeValue: 5,
    };
  });
  const [billingSettingsOpen, setBillingSettingsOpen] = useState(false);

  const saveBillingSettings = (newSettings: typeof billingSettings) => {
    setBillingSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("cafe_canva_billing_settings", JSON.stringify(newSettings));
    }
  };

  const selectTable = (tbl: Table) => {
    if (tbl.status !== "occupied") { toast("Only occupied tables can be billed", "error"); return; }
    setSelectedTable(tbl);
    const orders = tableOrders[tbl.id] || [];
    setBillItems(orders.map(o => ({ ...o, _key: o.id })));
    setPayStep("review");
    setDiscount(0);
    setCouponCode("");
    setCashReceived("");
    setView("session");
  };

  const subtotal = billItems.reduce((s, i) => s + (i.qty * i.price), 0);
  
  // Tax breakdown: CGST and SGST
  const cgstAmt = gstOn ? Math.round(subtotal * (billingSettings.cgstPercent / 100)) : 0;
  const sgstAmt = gstOn ? Math.round(subtotal * (billingSettings.sgstPercent / 100)) : 0;
  const gstAmt = cgstAmt + sgstAmt;

  // Service charge: flat vs percent
  const svcAmt = svcOn
    ? (billingSettings.serviceChargeType === "flat"
        ? billingSettings.serviceChargeValue
        : Math.round(subtotal * (billingSettings.serviceChargeValue / 100)))
    : 0;

  const totalAfterCharges = subtotal + gstAmt + svcAmt;
  const discountAmt = discount > 0 ? Math.round(totalAfterCharges * (discount / 100)) : 0;
  const grandTotal = totalAfterCharges - discountAmt;
  const change = cashReceived ? (Number(cashReceived) - grandTotal) : 0;

  const applyCoupon = () => {
    const found = INIT_COUPONS.find(c => c.code === couponCode.toUpperCase() && c.active);
    if (found) {
      setDiscount(found.code === "AETHER20" ? 20 : 15);
      toast(`Coupon ${found.code} applied! ${found.discount}`, "success");
    } else {
      toast("Invalid or expired coupon code", "error");
    }
  };

  const updateQty = (key: string, delta: number) => {
    setBillItems(p => p.map(i => {
      if (i._key !== key) return i;
      const nq = i.qty + delta;
      return nq <= 0 ? null : { ...i, qty: nq };
    }).filter(Boolean) as BillItem[]);
  };

  const addMenuItemToBill = () => {
    const mi = menu.find(m => m.id === addItemId);
    if (!mi) return;
    const existing = billItems.find(i => i.itemId === addItemId);
    if (existing) {
      setBillItems(p => p.map(i => i.itemId === addItemId ? { ...i, qty: i.qty + addItemQty } : i));
    } else {
      const key = "new-" + Date.now();
      setBillItems(p => [...p, { id: key, _key: key, itemId: addItemId, name: mi.name, price: mi.price, qty: addItemQty }]);
    }
    setMenuAddOpen(false);
    setAddItemQty(1);
    toast(`${mi.name} added to active bill`, "success");
  };

  const buildReceiptData = (
    billId: string,
    tbl: Table | { name: string; section: string },
    items: BillItem[],
    payM: string,
    sub: number,
    gst: number,
    svc: number,
    disc: number,
    total: number,
    cashRec?: number,
    cgstVal?: number,
    sgstVal?: number
  ): ReceiptData => {
    const cgstAmount = cgstVal !== undefined ? cgstVal : (gstOn ? Math.round(gst / 2) : 0);
    const sgstAmount = sgstVal !== undefined ? sgstVal : (gstOn ? (gst - cgstAmount) : 0);
    const cgstP = gstOn ? (cgstVal !== undefined ? billingSettings.cgstPercent : 2.5) : 0;
    const sgstP = gstOn ? (sgstVal !== undefined ? billingSettings.sgstPercent : 2.5) : 0;

    return {
      billId,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
      tableName: tbl.name,
      tableSection: tbl.section,
      items: items.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price,
      })),
      customCharges: [],
      subtotal: sub,
      gstAmount: gst,
      gstPercent: cgstP + sgstP,
      cgstPercent: cgstP,
      cgstAmount: cgstAmount,
      sgstPercent: sgstP,
      sgstAmount: sgstAmount,
      serviceCharge: svc,
      servicePercent: billingSettings.serviceChargeType === 'percent' ? billingSettings.serviceChargeValue : 0,
      serviceChargeType: billingSettings.serviceChargeType,
      discountPercent: disc,
      discountAmount: disc > 0 ? Math.round((sub + gst + svc) * (disc / 100)) : 0,
      couponCode: disc > 0 ? (disc === 20 ? 'AETHER20' : 'PROMO') : '',
      grandTotal: total,
      paymentMethod: payM,
      cashReceived: cashRec,
      changeDue: cashRec ? (cashRec - total) : undefined,
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      footerMessage: DEFAULT_STORE_INFO.footerMessage,
    };
  };

  const processPayment = () => {
    if (payMethod === "cash" && (!cashReceived || Number(cashReceived) < grandTotal)) {
      toast("Cash received must be ≥ grand total", "error"); return;
    }
    if (!selectedTable) return;

    const nextId = billCounter + 1;
    setBillCounter(nextId);
    const billId = `B-00${nextId}`;

    const newBill: BillHistoryEntry = {
      id: billId,
      table: selectedTable.name,
      section: selectedTable.section,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      method: payMethod.toUpperCase(),
      sub: subtotal,
      gst: gstAmt,
      svc: svcAmt,
      discount,
      total: grandTotal,
      itemsCount: billItems.length,
      billItems: [...billItems]
    };

    setBillHistory(p => [newBill, ...p]);
    setTables(p => p.map(t => t.id === selectedTable.id ? { ...t, status: "available" } : t));
    setTableOrders(p => ({ ...p, [selectedTable.id]: [] }));
    setPayStep("success");
    toast("Payment complete! Bill settled.", "success");
  };

  const handlePrint = () => {
    if (!selectedTable) return;
    const rData = buildReceiptData(
      `B-00${billCounter}`,
      selectedTable,
      billItems,
      payMethod.toUpperCase(),
      subtotal,
      gstAmt,
      svcAmt,
      discount,
      grandTotal,
      payMethod === 'cash' ? Number(cashReceived) : undefined,
      cgstAmt,
      sgstAmt
    );
    triggerReceipt(rData);
  };

  const handleHistoryPrint = (entry: BillHistoryEntry) => {
    // Reconstruct CGST & SGST based on typical 50-50 split for historical records
    const historicalCgst = gstOn ? Math.round(entry.gst / 2) : 0;
    const historicalSgst = gstOn ? (entry.gst - historicalCgst) : 0;

    const rData = buildReceiptData(
      entry.id,
      { name: entry.table, section: entry.section },
      entry.billItems,
      entry.method,
      entry.sub,
      entry.gst,
      entry.svc,
      entry.discount,
      entry.total,
      entry.method === 'CASH' ? entry.total : undefined,
      historicalCgst,
      historicalSgst
    );
    triggerReceipt(rData);
  };

  const tableStatusColor = {
    available: T.em, occupied: T.rose, reserved: T.amb, cleaning: T.ind
  };

  const filteredHistory = billHistory.filter(b =>
    !histSearch || b.table.toLowerCase().includes(histSearch.toLowerCase()) || b.id.toLowerCase().includes(histSearch.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>POS Billing System</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Full-cycle POS — table management · direct printing · payment capture</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Btn onClick={() => setBillingSettingsOpen(true)} variant="ghost" size="sm" style={{ border: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: "6px" }}>
            ⚙️ Settings-Billing
          </Btn>
          {[{ v: "floor", l: "Floor View" }, { v: "session", l: "Bill Builder" }, { v: "history", l: "Bill History" }].map(tab => (
            <Btn key={tab.v} onClick={() => setView(tab.v as any)} variant={view === tab.v ? "primary" : "ghost"} size="sm">
              {tab.l}
            </Btn>
          ))}
        </div>
      </div>

      {/* FLOOR VIEW */}
      {view === "floor" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "Occupied", val: tables.filter(t => t.status === "occupied").length, color: T.rose },
              { label: "Available", val: tables.filter(t => t.status === "available").length, color: T.em },
              { label: "Reserved", val: tables.filter(t => t.status === "reserved").length, color: T.amb },
              { label: "Cleaning", val: tables.filter(t => t.status === "cleaning").length, color: T.ind },
            ].map((s, i) => (
              <Card key={i} style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: T.mu2 }}>{s.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "20px", fontWeight: 800, color: T.tx, fontFamily: fm }}>{s.val}</span>
              </Card>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {tables.map(tbl => {
              const occ = tbl.status === "occupied";
              const orders = tableOrders[tbl.id] || [];
              const tblTotal = orders.reduce((s, o) => s + (o.qty * o.price), 0);
              return (
                <Card key={tbl.id} hover onClick={() => occ && selectTable(tbl)}
                  style={{
                    padding: "14px", border: `1px solid ${occ ? T.rA(0.3) : T.bdr}`,
                    background: occ ? T.rA(0.06) : "", display: "flex", flexDirection: "column", gap: "4px"
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>{tbl.name}</span>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: tableStatusColor[tbl.status] || T.mu,
                      boxShadow: occ ? `0 0 6px ${T.rose}` : "none"
                    }} />
                  </div>
                  <div style={{ fontSize: "10px", color: T.mu, marginBottom: "6px" }}>{tbl.section} · {tbl.cap} pax</div>
                  {occ && tblTotal > 0 ? (
                    <div style={{ fontSize: "14px", fontWeight: 800, color: T.tx, fontFamily: fm }}>₹{tblTotal.toLocaleString()}</div>
                  ) : (
                    <div style={{ fontSize: "10px", color: T.mu, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{tbl.status}</div>
                  )}
                  {occ && <div style={{ marginTop: "auto", paddingTop: "8px" }}><Btn size="sm" fullWidth onClick={() => selectTable(tbl)}>Open Bill</Btn></div>}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* BILL BUILDER */}
      {view === "session" && (
        <div>
          {!selectedTable && payStep !== "success" ? (
            <Card style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: T.mu, marginBottom: "12px" }}>No Table Selected</div>
              <p style={{ fontSize: "12px", color: T.mu, marginBottom: "20px" }}>Select an occupied table from the Floor View to begin billing.</p>
              <Btn onClick={() => setView("floor")}>Go to Floor View</Btn>
            </Card>
          ) : payStep === "success" ? (
            <Card style={{ padding: "40px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%", background: T.eA(0.15), border: `2px solid ${T.eA(0.4)}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px"
              }}>✓</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: T.tx, marginBottom: "6px" }}>Payment Successful</div>
              <p style={{ fontSize: "12px", color: T.mu2, marginBottom: "4px" }}>{selectedTable?.name} · {payMethod.toUpperCase()}</p>
              <div style={{ fontSize: "28px", fontWeight: 800, color: T.em, fontFamily: fm, margin: "16px 0" }}>₹{grandTotal.toLocaleString()}</div>
              {payMethod === "cash" && change > 0 && (
                <div style={{ padding: "12px", borderRadius: "8px", background: T.aA(0.1), border: `1px solid ${T.aA(0.25)}`, marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: T.amb, fontWeight: 700 }}>Change Due: ₹{change.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <Btn onClick={handlePrint} variant="outline">🖨️ Print Receipt</Btn>
                <Btn onClick={() => { setView("floor"); setSelectedTable(null); setPayStep("review"); setBillItems([]); }} variant="ghost">
                  Back to Floor
                </Btn>
              </div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", alignItems: "start" }}>
              {/* Left: Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", gridColumn: "span 2" }}>
                <Card style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>{selectedTable?.name} — Active Bill</div>
                      <div style={{ fontSize: "11px", color: T.mu2 }}>{billItems.length} items · {selectedTable?.section}</div>
                    </div>
                    <Btn size="sm" variant="ghost" onClick={() => setMenuAddOpen(true)}>+ Add Item</Btn>
                  </div>
                  {billItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px", color: T.mu, fontSize: "12px" }}>No items on this table</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${T.bdr}` }}>
                            {["Item", "Unit Price", "Qty", "Total", ""].map(h => (
                              <th key={h} style={{ textAlign: "left", padding: "0 0 10px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {billItems.map(item => (
                            <tr key={item._key} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                              <td style={{ padding: "10px 0", fontSize: "12px", color: T.tx, fontWeight: 500 }}>{item.name}</td>
                              <td style={{ padding: "10px 0", fontSize: "12px", color: T.mu2, fontFamily: fm }}>₹{item.price}</td>
                              <td style={{ padding: "10px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <button onClick={() => updateQty(item._key, -1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "22px", height: "22px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: T.tx, minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                                  <button onClick={() => updateQty(item._key, 1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "22px", height: "22px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                </div>
                              </td>
                              <td style={{ padding: "10px 0", fontSize: "12px", fontWeight: 700, color: T.tx, fontFamily: fm }}>₹{(item.qty * item.price).toLocaleString()}</td>
                              <td style={{ padding: "10px 0" }}><Btn size="sm" variant="danger" onClick={() => setBillItems(p => p.filter(i => i._key !== item._key))}>✕</Btn></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right: Summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card style={{ padding: "18px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "14px" }}>Bill Summary</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                      <span>Subtotal</span><span style={{ color: T.tx, fontWeight: 600, fontFamily: fm }}>₹{subtotal.toLocaleString()}</span>
                    </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                        <span className="flex items-center gap-1" style={{ fontWeight: 600 }}>
                          <input type="checkbox" checked={gstOn} onChange={e => setGstOn(e.target.checked)} /> Taxes ({(billingSettings.cgstPercent + billingSettings.sgstPercent)}%)
                        </span>
                        <span style={{ color: T.tx, fontFamily: fm, fontWeight: 600 }}>₹{gstAmt.toLocaleString()}</span>
                      </div>
                      {gstOn && (
                        <div style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", color: T.mu2 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>CGST ({billingSettings.cgstPercent}%)</span>
                            <span style={{ fontFamily: fm }}>₹{cgstAmt.toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>SGST ({billingSettings.sgstPercent}%)</span>
                            <span style={{ fontFamily: fm }}>₹{sgstAmt.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                      <span className="flex items-center gap-1">
                        <input type="checkbox" checked={svcOn} onChange={e => setSvcOn(e.target.checked)} /> Service Charge ({billingSettings.serviceChargeType === 'percent' ? `${billingSettings.serviceChargeValue}%` : `₹${billingSettings.serviceChargeValue}`})
                      </span>
                      <span style={{ color: T.tx, fontFamily: fm }}>₹{svcAmt.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.em }}>
                        <span>Discount ({discount}%)</span><span style={{ fontFamily: fm }}>-₹{discountAmt.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800, color: T.tx }}>
                      <span>Total</span><span style={{ fontFamily: fm }}>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: "18px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Coupon</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Input placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ flex: 1 }} />
                    <Btn size="sm" onClick={applyCoupon}>Apply</Btn>
                  </div>
                </Card>

                <Card style={{ padding: "18px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Payment Method</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    {(["cash", "card", "upi"] as const).map(m => (
                      <Btn key={m} size="sm" variant={payMethod === m ? "primary" : "ghost"} onClick={() => setPayMethod(m)} fullWidth>
                        {m.toUpperCase()}
                      </Btn>
                    ))}
                  </div>
                  {payMethod === "cash" && (
                    <Input label="Cash Received (₹)" type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0" />
                  )}
                </Card>

                <Btn variant="emerald" size="lg" fullWidth onClick={processPayment} disabled={billItems.length === 0}>
                  Settle Bill — ₹{grandTotal.toLocaleString()}
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BILL HISTORY */}
      {view === "history" && (
        <div>
          <div style={{ marginBottom: "14px" }}>
            <Input placeholder="Search bills by ID or table…" value={histSearch} onChange={e => setHistSearch(e.target.value)} />
          </div>
          <Card style={{ overflow: "hidden" }}>
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)" }}>
                    {["Bill ID", "Table", "Time", "Method", "Subtotal", "GST", "SVC", "Total", "Items", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(b => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                      <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 700, color: T.tx, fontFamily: fm }}>{b.id}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2 }}>{b.table}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2 }}>{b.time}</td>
                      <td style={{ padding: "12px 14px" }}><Badge color={b.method === "UPI" ? "indigo" : b.method === "CARD" ? "blue" : "gray"}>{b.method}</Badge></td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontFamily: fm }}>₹{b.sub.toLocaleString()}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>₹{b.gst}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>₹{b.svc}</td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: T.em, fontFamily: fm }}>₹{b.total.toLocaleString()}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2 }}>{b.itemsCount}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <Btn size="sm" variant="ghost" onClick={() => handleHistoryPrint(b)}>
                          <Printer size={12} style={{ marginRight: '4px' }} /> Print
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add menu item modal */}
      <Modal show={menuAddOpen} onClose={() => setMenuAddOpen(false)} title="Add Item to Bill">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Sel label="Menu Item" value={addItemId} onChange={e => setAddItemId(e.target.value)}>
            {menu.filter(m => m.status === "available").map(m => (
              <option key={m.id} value={m.id}>{m.name} — ₹{m.price}</option>
            ))}
          </Sel>
          <Input label="Quantity" type="number" value={addItemQty} onChange={e => setAddItemQty(Number(e.target.value))} />
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn onClick={addMenuItemToBill} fullWidth>Add to Bill</Btn>
            <Btn variant="ghost" onClick={() => setMenuAddOpen(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Billing Settings Modal */}
      <Modal show={billingSettingsOpen} onClose={() => setBillingSettingsOpen(false)} title="Settings — Billing & Taxes">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="CGST Rate (%)"
              type="number"
              step="0.01"
              value={billingSettings.cgstPercent}
              onChange={e => saveBillingSettings({ ...billingSettings, cgstPercent: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="SGST Rate (%)"
              type="number"
              step="0.01"
              value={billingSettings.sgstPercent}
              onChange={e => saveBillingSettings({ ...billingSettings, sgstPercent: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>Service Charge Type</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <Btn
                size="sm"
                variant={billingSettings.serviceChargeType === 'percent' ? 'primary' : 'ghost'}
                onClick={() => saveBillingSettings({ ...billingSettings, serviceChargeType: 'percent' })}
                style={{ flex: 1 }}
              >
                Percentage (%)
              </Btn>
              <Btn
                size="sm"
                variant={billingSettings.serviceChargeType === 'flat' ? 'primary' : 'ghost'}
                onClick={() => saveBillingSettings({ ...billingSettings, serviceChargeType: 'flat' })}
                style={{ flex: 1 }}
              >
                Flat Amount (₹)
              </Btn>
            </div>
          </div>

          <Input
            label={billingSettings.serviceChargeType === 'percent' ? "Service Charge Rate (%)" : "Service Charge Flat Amount (₹)"}
            type="number"
            step="0.01"
            value={billingSettings.serviceChargeValue}
            onChange={e => saveBillingSettings({ ...billingSettings, serviceChargeValue: parseFloat(e.target.value) || 0 })}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <Btn onClick={() => setBillingSettingsOpen(false)} fullWidth>Save & Apply</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: CUSTOMER CRM
═══════════════════════════════════════════════════════════ */
function CustomerPage({ toast }: { toast: (msg: string, type?: "success" | "error" | "warning") => void }) {
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "", tier: "Bronze" as const });

  const tierColors = { Platinum: "indigo", Gold: "gold", Silver: "gray", Bronze: "amber" };
  const tiers = ["All", "Platinum", "Gold", "Silver", "Bronze"];

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = tierFilter === "All" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const addCustomer = () => {
    if (!newCust.name || !newCust.phone) { toast("Name and phone are required", "error"); return; }
    const id = "c" + (customers.length + 1);
    setCustomers(p => [...p, { id, name: newCust.name, phone: newCust.phone, visits: 0, spend: 0, last: "Today", tier: newCust.tier }]);
    setShowAdd(false);
    setNewCust({ name: "", phone: "", tier: "Bronze" });
    toast("Customer added!", "success");
  };

  const totalSpend = customers.reduce((s, c) => s + c.spend, 0);
  const totalVisits = customers.reduce((s, c) => s + c.visits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Customer CRM</h2>
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Loyalty tiers, spend analytics, and engagement tracking</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Add Customer</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <Stat label="Total Customers" value={customers.length} icon="👥" color={T.ind} />
        <Stat label="Total Visits" value={totalVisits.toLocaleString()} icon="📊" color={T.em} />
        <Stat label="Total Spend" value={`₹${totalSpend.toLocaleString()}`} icon="₹" color={T.amb} />
        <Stat label="Avg Spend" value={`₹${Math.round(totalSpend / customers.length).toLocaleString()}`} icon="📈" color={T.ind} />
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "end", flexWrap: "wrap" }}>
        <Input placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "6px" }}>
          {tiers.map(t => (
            <Btn key={t} size="sm" variant={tierFilter === t ? "primary" : "ghost"} onClick={() => setTierFilter(t)}>
              {t}
            </Btn>
          ))}
        </div>
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)" }}>
                {["Customer", "Phone", "Tier", "Visits", "Total Spend", "Last Visit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                  <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 600, color: T.tx }}>{c.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>{c.phone}</td>
                  <td style={{ padding: "12px 14px" }}><Badge color={tierColors[c.tier]}>{c.tier}</Badge></td>
                  <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontFamily: fm }}>{c.visits}</td>
                  <td style={{ padding: "12px 14px", fontSize: "12px", fontWeight: 700, color: T.em, fontFamily: fm }}>₹{c.spend.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2 }}>{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Name" value={newCust.name} onChange={e => setNewCust(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
          <Input label="Phone" value={newCust.phone} onChange={e => setNewCust(p => ({ ...p, phone: e.target.value }))} placeholder="9876543200" />
          <Sel label="Tier" value={newCust.tier} onChange={e => setNewCust(p => ({ ...p, tier: e.target.value as any }))}>
            {["Bronze", "Silver", "Gold", "Platinum"].map(t => <option key={t}>{t}</option>)}
          </Sel>
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addCustomer} fullWidth>Add Customer</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: DISCOUNTS & COUPONS
═══════════════════════════════════════════════════════════ */
function DiscountsPage({ toast, discounts, setDiscounts }: PageProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newDisc, setNewDisc] = useState({ name: "", type: "percent" as const, value: "", validUntil: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", maxUses: "" });

  const addDiscount = () => {
    if (!newDisc.name || !newDisc.value) { toast("Name and value required", "error"); return; }
    const id = "d" + (discounts.length + 1);
    setDiscounts(p => [...p, { id, name: newDisc.name, type: newDisc.type, value: Number(newDisc.value), validUntil: newDisc.validUntil || "—", active: true }]);
    setShowAddDiscount(false);
    setNewDisc({ name: "", type: "percent", value: "", validUntil: "" });
    toast("Discount created!", "success");
  };

  const addCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) { toast("Code and discount required", "error"); return; }
    const id = "cp" + (coupons.length + 1);
    setCoupons(p => [...p, { id, code: newCoupon.code.toUpperCase(), discount: newCoupon.discount, uses: 0, maxUses: Number(newCoupon.maxUses) || 100, active: true }]);
    setShowAddCoupon(false);
    setNewCoupon({ code: "", discount: "", maxUses: "" });
    toast("Coupon created!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.tx, letterSpacing: "-0.02em", fontFamily: ff }}>Discounts & Coupons</h2>
        <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Manage promotions, flash sales, and coupon codes</p>
      </div>

      {/* Discounts Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.tx }}>Active Discounts</div>
          <Btn size="sm" onClick={() => setShowAddDiscount(true)}>+ New Discount</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {discounts.map(d => (
            <Card key={d.id} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: T.tx }}>{d.name}</div>
                <Badge color={d.active ? "emerald" : "gray"}>{d.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: T.ind, fontFamily: fm, marginBottom: "6px" }}>
                {d.type === "percent" ? `${d.value}%` : `₹${d.value}`}
              </div>
              <div style={{ fontSize: "10px", color: T.mu }}>Valid until: {d.validUntil}</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                <Btn size="sm" variant={d.active ? "danger" : "emerald"} onClick={() => {
                  setDiscounts(p => p.map(x => x.id === d.id ? { ...x, active: !x.active } : x));
                  toast(d.active ? "Discount deactivated" : "Discount activated", "success");
                }}>
                  {d.active ? "Deactivate" : "Activate"}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Coupons Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.tx }}>Coupon Codes</div>
          <Btn size="sm" onClick={() => setShowAddCoupon(true)}>+ New Coupon</Btn>
        </div>
        <Card style={{ overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)" }}>
                  {["Code", "Discount", "Uses", "Max Uses", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                    <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: T.ind, fontFamily: fm, letterSpacing: "0.04em" }}>{c.code}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontWeight: 600 }}>{c.discount}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.mu2, fontFamily: fm }}>{c.uses}</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: T.mu2, fontFamily: fm }}>{c.maxUses}</td>
                    <td style={{ padding: "12px 14px" }}><Badge color={c.active ? "emerald" : "gray"}>{c.active ? "Active" : "Expired"}</Badge></td>
                    <td style={{ padding: "12px 14px" }}>
                      <Btn size="sm" variant={c.active ? "danger" : "emerald"} onClick={() => {
                        setCoupons(p => p.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
                        toast(c.active ? "Coupon deactivated" : "Coupon activated", "success");
                      }}>
                        {c.active ? "Deactivate" : "Activate"}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Discount Modal */}
      <Modal show={showAddDiscount} onClose={() => setShowAddDiscount(false)} title="New Discount">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Discount Name" value={newDisc.name} onChange={e => setNewDisc(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Happy Hour 10%" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Sel label="Type" value={newDisc.type} onChange={e => setNewDisc(p => ({ ...p, type: e.target.value as any }))}>
              <option value="percent">Percentage</option>
              <option value="flat">Flat Amount</option>
            </Sel>
            <Input label="Value" type="number" value={newDisc.value} onChange={e => setNewDisc(p => ({ ...p, value: e.target.value }))} placeholder="0" />
          </div>
          <Input label="Valid Until" value={newDisc.validUntil} onChange={e => setNewDisc(p => ({ ...p, validUntil: e.target.value }))} placeholder="e.g. 31 Dec 2026" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addDiscount} fullWidth>Create Discount</Btn>
            <Btn variant="ghost" onClick={() => setShowAddDiscount(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Add Coupon Modal */}
      <Modal show={showAddCoupon} onClose={() => setShowAddCoupon(false)} title="New Coupon Code">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Coupon Code" value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER25" />
          <Input label="Discount Label" value={newCoupon.discount} onChange={e => setNewCoupon(p => ({ ...p, discount: e.target.value }))} placeholder="e.g. 25% OFF" />
          <Input label="Max Uses" type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon(p => ({ ...p, maxUses: e.target.value }))} placeholder="100" />
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <Btn onClick={addCoupon} fullWidth>Create Coupon</Btn>
            <Btn variant="ghost" onClick={() => setShowAddCoupon(false)} fullWidth>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: ANALYTICS
═══════════════════════════════════════════════════════════ */
function AnalyticsPage() {
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

/* ═══════════════════════════════════════════════════════════
   MAIN APP (SHELL + NAVIGATION)
═══════════════════════════════════════════════════════════ */
export default function CafeCanvaAdmin() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastItem, toast] = useToast();
  const [menu, setMenu] = useState<MenuItem[]>(INIT_MENU);
  const [discounts, setDiscounts] = useState<Discount[]>(INIT_DISCOUNTS);
  const [mounted, setMounted] = useState(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerReceiptPrint = (data: ReceiptData) => {
    setReceiptData(data);
    setShowReceipt(true);
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "menu", label: "Menu", icon: "🍽" },
    { id: "billing", label: "Billing OS", icon: "🧾" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "discounts", label: "Discounts", icon: "🏷" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: ff, color: T.tx, overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "220px" : "64px", transition: "width 0.2s", background: T.card,
        borderRight: `1px solid ${T.bdr}`, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? "20px" : "14px", borderBottom: `1px solid ${T.bdr}`, display: "flex",
          alignItems: "center", gap: "10px", cursor: "pointer"
        }} onClick={() => setSidebarOpen(p => !p)}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", background: `linear-gradient(135deg,${T.ind},${T.em})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#fff", flexShrink: 0
          }}>
            C
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "-0.02em" }}>CafeCanva</div>
              <div style={{ fontSize: "9px", color: T.mu, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: sidebarOpen ? "10px 12px" : "10px",
                  borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: ff, fontSize: "12px", fontWeight: 600,
                  transition: "all 0.12s", width: "100%", textAlign: "left",
                  background: active ? T.iA(0.15) : "transparent",
                  color: active ? T.tx : T.mu2,
                  justifyContent: sidebarOpen ? "flex-start" : "center"
                }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{n.icon}</span>
                {sidebarOpen && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div style={{ padding: "16px", borderTop: `1px solid ${T.bdr}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", background: T.iA(0.2),
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: T.ind
              }}>
                YZ
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: T.tx }}>Yash Z.</div>
                <div style={{ fontSize: "9px", color: T.mu }}>Owner · Admin</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        {mounted && (
          <>
            {page === "dashboard" && <DashboardPage toast={toast} menu={menu} setMenu={setMenu} discounts={discounts} setDiscounts={setDiscounts} />}
            {page === "menu" && <MenuPage toast={toast} menu={menu} setMenu={setMenu} discounts={discounts} setDiscounts={setDiscounts} />}
            {page === "billing" && <BillingOS toast={toast} menu={menu} triggerReceipt={triggerReceiptPrint} />}
            {page === "customers" && <CustomerPage toast={toast} />}
            {page === "discounts" && <DiscountsPage toast={toast} menu={menu} setMenu={setMenu} discounts={discounts} setDiscounts={setDiscounts} />}
            {page === "analytics" && <AnalyticsPage />}
          </>
        )}
      </main>

      {/* Thermal Receipt Preview Modal */}
      {receiptData && (
        <ReceiptPreviewModal
          show={showReceipt}
          onClose={() => setShowReceipt(false)}
          data={receiptData}
        />
      )}

      {/* Toast */}
      {toastItem && <Toast msg={toastItem.msg} type={toastItem.type} onClose={() => { }} />}
    </div>
  );
}
