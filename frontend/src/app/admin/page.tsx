'use client';

import { useState, useEffect, useRef } from 'react';
import { Coffee, AlertCircle, LogOut, ChevronDown, User, Layers, ShieldAlert, Award } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Zustand stores
import { useBranchStore } from '@/store/branch';
import { useStaffPresenceStore } from '@/store/staff-realtime';

// Visual Tabs
import Sidebar from '@/components/admin/Sidebar';
import DashboardTab from '@/components/admin/DashboardTab';
import MenuTab from '@/components/admin/MenuTab';
import BillingTab from '@/components/admin/BillingTab';
import CustomersTab from '@/components/admin/CustomersTab';
import DiscountsTab from '@/components/admin/DiscountsTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import { useToast, Toast, T, ff } from '@/components/admin/UIPrimitives';

// Phase 6 new tabs
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import StorefrontEditor from '@/components/admin/StorefrontEditor';
import TableQRManager from '@/components/admin/TableQRManager';
import StaffManager from '@/components/admin/StaffManager';
import MenuEditor from '@/components/admin/MenuEditor';
import ActivityFeedTab from '@/components/admin/ActivityFeedTab';
import AttendanceTab from '@/components/admin/AttendanceTab';
import FeedbackTab from '@/components/admin/FeedbackTab';
import SettingsTab from '@/components/admin/SettingsTab';

import ReceiptPreviewModal from '@/components/billing/ReceiptPreviewModal';
import type { ReceiptData } from '@/components/billing/types';

interface MenuItem {
  id: string;
  name: string;
  price: number; // in rupees
  cat: string;
  status: 'available' | 'unavailable' | 'hidden';
  desc: string;
  image_url?: string | null;
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
  table_number?: number;
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

interface RecentOrder {
  id: string;
  tableId: string;
  desc: string;
  amount: number;
  status: string;
  age: string;
}

export default function CafeCanvaAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFetchDbData = () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchDbData();
    }, 300);
  };

  const { activeBranch, branches, setActiveBranch, setBranches } = useBranchStore();
  const { setOnline, setOffline } = useStaffPresenceStore();

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastItem, toast] = useToast();
  const [mounted, setMounted] = useState(false);

  // Auth profile states
  const [userRole, setUserRole] = useState<'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff'>('staff');
  const [userName, setUserName] = useState('Staff Operator');

  // Dynamic states
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("My Cafe");
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [tableOrders, setTableOrders] = useState<Record<string, BillItem[]>>({});
  const [billHistory, setBillHistory] = useState<BillHistoryEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [dbPending, setDbPending] = useState(false);

  // Receipt Preview
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const fetchDbData = async () => {
    try {
      // 1. Resolve user profile session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
        return;
      }

      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operator');

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.tenant_id) {
        console.error("User profile or tenant_id not found.");
        router.push('/admin/login');
        return;
      }

      setUserRole(profile.role as any);
      setTenantId(profile.tenant_id);
      if (profile.name) {
        setUserName(profile.name);
      }

      const activeTenantId = profile.tenant_id;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // --- STAGE 1: Parallel Fetching of Branch List and Tenant/Menu/Billing/CRM Metadata ---
      const [
        branchResult,
        tenantResult,
        categoriesResult,
        itemsResult,
        billsResult,
        customersResult
      ] = await Promise.all([
        supabase.from('branches').select('*').eq('tenant_id', activeTenantId).eq('active', true),
        supabase.from('tenants').select('name, public_id, slug, logo_url').eq('id', activeTenantId).maybeSingle(),
        supabase.from('menu_categories').select('id, name').eq('tenant_id', activeTenantId),
        supabase.from('menu_items').select('*').eq('tenant_id', activeTenantId).order('sort_order', { ascending: true }),
        supabase.from('bills').select('*').eq('tenant_id', activeTenantId).order('created_at', { ascending: false }).limit(10),
        supabase.from('customers').select('*').eq('tenant_id', activeTenantId).is('deleted_at', null).limit(20)
      ]);

      if (branchResult.error) throw branchResult.error;
      if (tenantResult.error) throw tenantResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (itemsResult.error) throw itemsResult.error;
      if (billsResult.error) throw billsResult.error;
      if (customersResult.error) throw customersResult.error;

      // Extract Branch List
      const branchList = branchResult.data || [];
      setBranches(branchList as any[]);
      const currentBranchId = activeBranch?.id || branchList?.[0]?.id || '';

      // Extract Tenant Metadata
      const tenData = tenantResult.data;
      if (tenData) {
        setTenantName(tenData.name);
        setPublicId(tenData.public_id || "");
        setTenantSlug((tenData as any).slug || "");
        setTenantLogoUrl(tenData.logo_url || null);
      }

      // Extract Menu Categories
      const catData = categoriesResult.data || [];
      const catsMap = new Map(catData.map(c => [c.id, c.name]));

      // Extract Menu Items
      const itemsData = itemsResult.data || [];
      const mappedMenu: MenuItem[] = itemsData.map(i => ({
        id: i.id,
        name: i.name,
        price: (i.price ?? i.price_paise ?? 0) / 100,
        cat: catsMap.get(i.category_id || "") || "Uncategorized",
        status: i.is_available ? 'available' : 'unavailable',
        desc: i.description || "",
        image_url: i.image_url || null
      }));
      setMenu(mappedMenu);

      // --- STAGE 2: Parallel Fetching of Branch-Specific Tables and Orders ---
      const [tablesResult, ordersResult] = await Promise.all([
        supabase.from('tables').select('*').eq('tenant_id', activeTenantId).eq('branch_id', currentBranchId).is('deleted_at', null).order('name', { ascending: true }),
        supabase.from('orders').select('*, order_items(*)').eq('tenant_id', activeTenantId).eq('branch_id', currentBranchId).or(`status.in.(pending,confirmed,preparing,ready,served,billed),and(status.eq.paid,created_at.gte.${todayStart.toISOString()})`)
      ]);

      if (tablesResult.error) throw tablesResult.error;
      if (ordersResult.error) throw ordersResult.error;

      // Extract Tables
      const tablesData = tablesResult.data || [];
      const mappedTables: Table[] = tablesData.map(t => ({
        id: t.id,
        name: t.name,
        capacity: t.capacity,
        section: t.section,
        status: t.status as any,
        floor_x: t.floor_x,
        floor_y: t.floor_y,
        qr_version: t.qr_version,
        table_number: t.table_number
      }));
      setTables(mappedTables);

      // Extract and Parse Orders
      const activeOrders = ordersResult.data || [];
      const ordersByTable: Record<string, BillItem[]> = {};
      const recentOrdersList: RecentOrder[] = [];

      activeOrders.forEach(o => {
        if (o.table_id && o.status !== 'paid') {
          if (!ordersByTable[o.table_id]) ordersByTable[o.table_id] = [];
          
          (o.order_items || []).forEach((i: any) => {
            ordersByTable[o.table_id].push({
              id: i.id,
              _key: i.id,
              itemId: i.menu_item_id || "",
              name: i.item_name,
              price: (i.unit_price || i.unit_price_paise || 0) / 100,
              qty: i.quantity
            });
          });
        }

        const orderSummary = (o.order_items || []).map((i: any) => `${i.item_name} x${i.quantity}`).join(', ');
        const diffMs = Date.now() - new Date(o.created_at).getTime();
        const mins = Math.max(1, Math.floor(diffMs / 60000));

        recentOrdersList.push({
          id: `#${o.id.substring(0, 4).toUpperCase()}`,
          tableId: mappedTables.find(t => t.id === o.table_id)?.name || "Table Guest",
          desc: orderSummary.length > 30 ? orderSummary.substring(0, 27) + "..." : orderSummary,
          amount: (o.total || o.total_amount_paise || 0) / 100,
          status: o.status,
          age: `${mins}m ago`
        });
      });

      setTableOrders(ordersByTable);
      setOrders(recentOrdersList);

      // Parse Bills (from Stage 1)
      const billsData = billsResult.data || [];
      const mappedHistory: BillHistoryEntry[] = billsData.map(b => {
        const matchingTable = mappedTables.find(t => t.table_number === b.table_number);
        return {
          id: b.id.substring(0, 8).toUpperCase(),
          table: matchingTable?.name || (b.table_number ? `Table ${b.table_number}` : "Table"),
          section: matchingTable?.section || "Indoor",
          time: new Date(b.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          method: b.payment_method || "CASH",
          sub: (b.subtotal || 0) / 100,
          gst: ((b.cgst || 0) + (b.sgst || 0)) / 100,
          svc: ((b.total || 0) - (b.subtotal || 0) - (b.cgst || 0) - (b.sgst || 0) + (b.discount_amount || 0)) / 100,
          discount: (b.discount_amount || 0) / 100,
          total: (b.total || 0) / 100,
          itemsCount: 1,
          billItems: []
        };
      });
      setBillHistory(mappedHistory);

      // Parse Customers (from Stage 1)
      const custData = customersResult.data || [];
      const mappedCustomers: Customer[] = custData.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "—",
        visits: c.total_visits || 1,
        spend: (c.total_spent || 0) / 100,
        last: new Date(c.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
        tier: (c.total_spent || 0) / 100 > 5000 ? "Platinum" : (c.total_spent || 0) / 100 > 2500 ? "Gold" : (c.total_spent || 0) / 100 > 1000 ? "Silver" : "Bronze"
      }));
      setCustomers(mappedCustomers);

      setDbPending(false);
    } catch (err: any) {
      console.error("Supabase sync issue. Running client preview sandbox:", err.message);
      setDbPending(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDbData();
  }, [activeBranch]);

  // Real-time Order Subscriptions
  useEffect(() => {
    if (dbPending || !tenantId) return;

    const channel = supabase
      .channel('admin-pos-dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        () => { triggerFetchDbData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items', filter: `tenant_id=eq.${tenantId}` },
        () => { triggerFetchDbData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills', filter: `tenant_id=eq.${tenantId}` },
        () => { triggerFetchDbData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers', filter: `tenant_id=eq.${tenantId}` },
        () => { triggerFetchDbData(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notification_log', filter: `tenant_id=eq.${tenantId}` },
        (payload: any) => {
          if (payload.new && payload.new.body) {
            toast(payload.new.body, payload.new.type === 'customer_checkin' ? 'success' : 'warning');
          }
          triggerFetchDbData();
        }
      )
      .subscribe();

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [tenantId, dbPending]);

  const triggerReceiptPrint = (data: ReceiptData) => {
    setReceiptData(data);
    setShowReceipt(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf7] text-[#1e293b] flex flex-col justify-center items-center gap-5">
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-[#d97706] animate-spin absolute" />
          <Coffee className="w-5 h-5 text-[#d97706]" />
        </div>
        <span className="font-extrabold text-xs tracking-widest uppercase opacity-75">Syncing OS Core...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#fdfcf7", fontFamily: ff, color: "#1e293b", overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      <Sidebar
        page={page}
        setPage={setPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tenantName={tenantName}
      />

      {/* Main content frame */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#e2e8f0] px-6 flex items-center justify-between bg-[#ffffff] relative z-20">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-sm tracking-wide font-display text-[#1e293b]">{tenantName} Operations</span>
            
            {/* Active Branch Select Dropdown */}
            {branches.length > 0 && (
              <div className="relative group">
                <button className="px-3.5 py-1.5 bg-[#ffffff] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#1e293b]/70 flex items-center gap-1.5 hover:text-[#1e293b] transition-all">
                  <span>{activeBranch?.name || 'Select Location'}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBranch(b)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#fdfcf7] hover:text-[#d97706] transition-all"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d97706]/10 border border-[#d97706]/30 text-[#d97706] rounded-full flex items-center justify-center font-extrabold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#1e293b]">{userName}</span>
                <span className="text-[10px] text-[#d97706] font-bold uppercase tracking-wider scale-[0.9] origin-left">{userRole}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#fdfcf7] border border-[#e2e8f0] rounded-xl text-[#64748b] hover:text-red-500 cursor-pointer transition-all"
              title="Logout session"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard inner content viewport */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="absolute top-20 left-10 w-[40%] h-[40%] bg-[#d97706]/3 rounded-full blur-[100px] pointer-events-none"></div>
          
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
              {page === "modifiers" && <MenuEditor />}
              {page === "tables" && <TableQRManager branchId={activeBranch?.id || ''} />}
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
              {page === "staff" && <StaffManager branchId={activeBranch?.id || ''} />}
              {page === "attendance" && <AttendanceTab branchId={activeBranch?.id || ''} />}
              {page === "feedback" && <FeedbackTab branchId={activeBranch?.id || ''} />}
              {page === "storefront" && <StorefrontEditor tenantPublicId={publicId} tenantPrivateId={tenantId} tenantName={tenantName} setTenantName={setTenantName} tenantLogoUrl={tenantLogoUrl} tenantSlug={tenantSlug} />}
              {page === "settings" && <SettingsTab toast={toast} tenantName={tenantName} setTenantName={setTenantName} setTenantLogoUrl={setTenantLogoUrl} />}
              {page === "audit" && <AuditLogViewer />}
              {page === "activity" && <ActivityFeedTab />}
            </>
          )}
        </main>
      </div>

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptPreviewModal
          show={showReceipt}
          onClose={() => setShowReceipt(false)}
          data={receiptData}
        />
      )}

      {/* Global toast notification system */}
      {toastItem && <Toast msg={toastItem.msg} type={toastItem.type} onClose={() => { }} />}
    </div>
  );
}
