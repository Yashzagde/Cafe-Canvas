'use client';

import { useState, useEffect } from "react";
import { Coffee, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import ReceiptPreviewModal from '@/components/billing/ReceiptPreviewModal';
import type { ReceiptData } from '@/components/billing/types';

import Sidebar from '@/components/admin/Sidebar';
import DashboardTab from '@/components/admin/DashboardTab';
import MenuTab from '@/components/admin/MenuTab';
import BillingTab from '@/components/admin/BillingTab';
import CustomersTab from '@/components/admin/CustomersTab';
import DiscountsTab from '@/components/admin/DiscountsTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import { useToast, Toast, T, ff } from '@/components/admin/UIPrimitives';

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */
interface MenuItem {
  id: string;
  name: string;
  price: number; // in rupees
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
  price: number; // in rupees
  qty: number;
}

interface BillHistoryEntry {
  id: string;
  table: string;
  section: string;
  time: string;
  method: string;
  sub: number; // rupees
  gst: number; // rupees
  svc: number; // rupees
  discount: number; // percent
  total: number; // rupees
  itemsCount: number;
  billItems: BillItem[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spend: number; // rupees
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

interface RecentOrder {
  id: string;
  tableId: string;
  desc: string;
  amount: number;
  status: string;
  age: string;
}

/* ═══════════════════════════════════════════════════════════
   MOCK/FALLBACK SANDBOX DATA
   ═══════════════════════════════════════════════════════════ */
const SEED_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

const INIT_MENU: MenuItem[] = [
  { id: "e0000000-0000-0000-0000-000000000001", name: "Classic Cappuccino", price: 290, cat: "Coffee", status: "available", desc: "Double ristretto, microfoam, 6oz" },
  { id: "e0000000-0000-0000-0000-000000000004", name: "Specialty Cold Brew", price: 350, cat: "Coffee", status: "available", desc: "24-hr Ethiopian single origin" },
  { id: "e0000000-0000-0000-0000-000000000014", name: "Matcha Latte Special", price: 320, cat: "Tea", status: "available", desc: "Ceremonial grade Uji matcha" },
  { id: "e0000000-0000-0000-0000-000000000011", name: "Avocado Sourdough Toast", price: 390, cat: "Food", status: "available", desc: "Organic avocado, feta, dukkah" },
  { id: "e0000000-0000-0000-0000-000000000008", name: "Almond Butter Croissant", price: 240, cat: "Bakery", status: "available", desc: "Flaky, house almond cream" }
];

const INIT_TABLES: Table[] = [
  { id: "c0000000-0000-0000-0000-000000000001", name: "Table 1", section: "Indoor", cap: 2, status: "available" },
  { id: "c0000000-0000-0000-0000-000000000002", name: "Table 2", section: "Indoor", cap: 4, status: "occupied" },
  { id: "c0000000-0000-0000-0000-000000000003", name: "Table 3", section: "Indoor", cap: 4, status: "available" }
];

const TABLE_ORDERS: Record<string, BillItem[]> = {
  "c0000000-0000-0000-0000-000000000002": [
    { id: "oi1", _key: "oi1", itemId: "e0000000-0000-0000-0000-000000000001", name: "Classic Cappuccino", qty: 2, price: 290 },
    { id: "oi2", _key: "oi2", itemId: "e0000000-0000-0000-0000-000000000011", name: "Avocado Sourdough Toast", qty: 1, price: 390 }
  ]
};

const INIT_BILL_HISTORY: BillHistoryEntry[] = [
  {
    id: "B-0041", table: "Table 3", section: "Indoor", time: "2:45 PM", method: "UPI", sub: 930, gst: 46, svc: 46, discount: 0, total: 1022, itemsCount: 3,
    billItems: [
      { id: "oi4", _key: "oi4", itemId: "e0000000-0000-0000-0000-000000000004", name: "Specialty Cold Brew", qty: 2, price: 350 },
      { id: "oi5", _key: "oi5", itemId: "e0000000-0000-0000-0000-000000000008", name: "Almond Butter Croissant", qty: 1, price: 240 }
    ]
  }
];

const INIT_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Priya Sharma", phone: "9876543290", visits: 23, spend: 34250, last: "27 May 2026", tier: "Gold" },
  { id: "c2", name: "Arjun Mehta", phone: "9812345634", visits: 14, spend: 19800, last: "25 May 2026", tier: "Silver" }
];

const INIT_ORDERS: RecentOrder[] = [
  { id: "#095", tableId: "Table 4", desc: "Avocado Toast x1, Flat White x2", amount: 970, status: "pending", age: "2 min ago" }
];

const INIT_DISCOUNTS: Discount[] = [
  { id: "d1", name: "Weekday Flash 15%", type: "percent", value: 15, validUntil: "30 June 2026", active: true }
];

export default function CafeCanvaAdmin() {
  const supabase = createClient();
  
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastItem, toast] = useToast();
  const [mounted, setMounted] = useState(false);

  // Dynamic states linked to live database
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState(SEED_TENANT_ID);
  const [tenantName, setTenantName] = useState("AETHER Café");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>(INIT_DISCOUNTS);
  const [tables, setTables] = useState<Table[]>([]);
  const [tableOrders, setTableOrders] = useState<Record<string, BillItem[]>>({});
  const [billHistory, setBillHistory] = useState<BillHistoryEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [dbPending, setDbPending] = useState(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const fetchDbData = async () => {
    try {
      // 1. Resolve user session & tenant ID
      const { data: { user } } = await supabase.auth.getUser();
      let activeTenantId = SEED_TENANT_ID;

      if (user?.app_metadata?.tenant_id) {
        activeTenantId = user.app_metadata.tenant_id;
      }
      setTenantId(activeTenantId);

      // Fetch tenant name
      const { data: tenData } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', activeTenantId)
        .maybeSingle();

      if (tenData) setTenantName(tenData.name);

      // 2. Fetch categories to map to menu items
      const { data: catData, error: catErr } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('tenant_id', activeTenantId)
        .is('deleted_at', null);

      if (catErr) throw catErr;
      const catsMap = new Map((catData || []).map(c => [c.id, c.name]));

      // 3. Fetch menu items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('menu_items')
        .select('id, name, price, status, description, category_id')
        .eq('tenant_id', activeTenantId)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (itemsErr) throw itemsErr;

      const mappedMenu: MenuItem[] = (itemsData || []).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price / 100, // paise to rupees
        cat: catsMap.get(i.category_id || "") || "Uncategorized",
        status: i.status,
        desc: i.description || ""
      }));
      setMenu(mappedMenu);

      // 4. Fetch tables
      const { data: tablesData, error: tablesErr } = await supabase
        .from('tables')
        .select('id, name, capacity, section, status')
        .eq('tenant_id', activeTenantId)
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (tablesErr) throw tablesErr;

      const mappedTables: Table[] = (tablesData || []).map(t => ({
        id: t.id,
        name: t.name,
        cap: t.capacity,
        section: t.section || "Indoor",
        status: t.status
      }));
      setTables(mappedTables);

      // 5. Fetch active orders
      const { data: activeOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('tenant_id', activeTenantId)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed']);

      if (ordersErr) throw ordersErr;

      const ordersByTable: Record<string, BillItem[]> = {};
      const recentOrdersList: RecentOrder[] = [];

      (activeOrders || []).forEach(o => {
        if (o.table_id) {
          if (!ordersByTable[o.table_id]) ordersByTable[o.table_id] = [];
          
          (o.order_items || []).forEach((i: any) => {
            ordersByTable[o.table_id].push({
              id: i.id,
              _key: i.id,
              itemId: i.menu_item_id || "",
              name: i.item_name,
              price: i.unit_price / 100, // paise to rupees
              qty: i.quantity
            });
          });
        }

        // Map to recent transaction feed
        const orderSummary = (o.order_items || []).map((i: any) => `${i.item_name} x${i.quantity}`).join(', ');
        const diffMs = Date.now() - new Date(o.created_at).getTime();
        const mins = Math.max(1, Math.floor(diffMs / 60000));

        recentOrdersList.push({
          id: `#${o.id.substring(0, 4).toUpperCase()}`,
          tableId: mappedTables.find(t => t.id === o.table_id)?.name || "Table Guest",
          desc: orderSummary.length > 30 ? orderSummary.substring(0, 27) + "..." : orderSummary,
          amount: o.total / 100, // paise to rupees
          status: o.status,
          age: `${mins}m ago`
        });
      });

      setTableOrders(ordersByTable);
      setOrders(recentOrdersList);

      // 6. Fetch historical bills
      const { data: billsData, error: billsErr } = await supabase
        .from('bills')
        .select('*')
        .eq('tenant_id', activeTenantId)
        .order('paid_at', { ascending: false })
        .limit(10);

      if (billsErr) throw billsErr;

      const mappedHistory: BillHistoryEntry[] = (billsData || []).map(b => ({
        id: b.id.substring(0, 8).toUpperCase(),
        table: mappedTables.find(t => t.id === b.table_id)?.name || "Table",
        section: mappedTables.find(t => t.id === b.table_id)?.section || "Indoor",
        time: new Date(b.paid_at || b.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        method: b.payment_method || "CASH",
        sub: b.subtotal / 100,
        gst: b.tax / 100,
        svc: 0,
        discount: b.discount_amount > 0 ? 10 : 0,
        total: b.total / 100,
        itemsCount: 1,
        billItems: []
      }));
      setBillHistory(mappedHistory);

      // 7. Fetch customers
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', activeTenantId)
        .is('deleted_at', null)
        .limit(20);

      if (custErr) throw custErr;
      const mappedCustomers: Customer[] = (custData || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "—",
        visits: c.visit_count || 1,
        spend: (c.total_spend || 0) / 100,
        last: new Date(c.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
        tier: (c.total_spend || 0) / 100 > 5000 ? "Platinum" : (c.total_spend || 0) / 100 > 2500 ? "Gold" : (c.total_spend || 0) / 100 > 1000 ? "Silver" : "Bronze"
      }));
      setCustomers(mappedCustomers);

      setDbPending(false);
    } catch (err: any) {
      console.error("Dashboard database fetch failed. Operating in offline simulation mode:", err.message);
      // Fallback
      setMenu(INIT_MENU);
      setTables(INIT_TABLES);
      setTableOrders(TABLE_ORDERS);
      setBillHistory(INIT_BILL_HISTORY);
      setCustomers(INIT_CUSTOMERS);
      setOrders(INIT_ORDERS);
      setDbPending(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDbData();
  }, []);

  // Sync real-time updates for new active orders
  useEffect(() => {
    if (dbPending) return;

    const channel = supabase
      .channel('admin-pos-dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        () => { fetchDbData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => { fetchDbData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, dbPending]);

  const triggerReceiptPrint = (data: ReceiptData) => {
    setReceiptData(data);
    setShowReceipt(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] text-[#4a2d22] flex flex-col justify-center items-center gap-4">
        <Coffee className="w-12 h-12 text-[#e05e35] animate-spin" />
        <span className="font-extrabold text-sm tracking-widest uppercase opacity-75">Booting Admin Panel...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: ff, color: T.tx, overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        page={page}
        setPage={setPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tenantName={tenantName}
      />

      {/* Main Content Viewport */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 32px", position: "relative" }}>
        {/* Luxury Liquid Floating Background Gradients */}
        <div className="liquid-blob-1 top-20 left-10"></div>
        <div className="liquid-blob-2 top-1/2 right-10"></div>
        
        {/* Database Warning Alert Banner */}
        {dbPending && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-scale-up">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Admin offline sandbox active. Please run <code>node db_setup.js</code> to initialize the tables on your remote Supabase instance.</span>
            </div>
          </div>
        )}

        {mounted && (
          <>
            {page === "dashboard" && (
              <DashboardTab
                toast={toast}
                discounts={discounts}
                setDiscounts={setDiscounts}
                tables={tables}
                orders={orders}
              />
            )}
            {page === "menu" && (
              <MenuTab
                toast={toast}
                menu={menu}
                setMenu={setMenu}
                dbPending={dbPending}
                tenantId={tenantId}
              />
            )}
            {page === "billing" && (
              <BillingTab
                toast={toast}
                menu={menu}
                triggerReceipt={triggerReceiptPrint}
                tables={tables}
                setTables={setTables}
                tableOrders={tableOrders}
                setTableOrders={setTableOrders}
                billHistory={billHistory}
                setBillHistory={setBillHistory}
                dbPending={dbPending}
                tenantId={tenantId}
              />
            )}
            {page === "customers" && (
              <CustomersTab
                toast={toast}
                customers={customers}
                setCustomers={setCustomers}
                dbPending={dbPending}
                tenantId={tenantId}
              />
            )}
            {page === "discounts" && (
              <DiscountsTab
                toast={toast}
                discounts={discounts}
                setDiscounts={setDiscounts}
              />
            )}
            {page === "analytics" && <AnalyticsTab />}
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

      {/* Toast Notification Container */}
      {toastItem && <Toast msg={toastItem.msg} type={toastItem.type} onClose={() => { }} />}
    </div>
  );
}
