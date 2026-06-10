import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Printer } from 'lucide-react';
import {
  Card, Btn, Input, Sel, Modal, Badge, T, ff, fm
} from './UIPrimitives';
import type { ReceiptData } from '@/components/billing/types';
import { DEFAULT_STORE_INFO } from '@/components/billing/types';

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
  capacity: number;
  section: string | null;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  floor_x: number;
  floor_y: number;
  qr_version: number;
  location_id?: string;
  branch_id?: string;
  table_number?: number;
}

interface BillItem {
  id: string;
  _key: string;
  itemId: string;
  name: string;
  price: number; // in rupees
  qty: number;
  notes?: string;
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
  discount: number; // percent/flat value
  total: number; // rupees
  itemsCount: number;
  billItems: BillItem[];
}

interface BillingTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  menu: MenuItem[];
  triggerReceipt: (data: ReceiptData) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  tableOrders: Record<string, BillItem[]>;
  setTableOrders: React.Dispatch<React.SetStateAction<Record<string, BillItem[]>>>;
  billHistory: BillHistoryEntry[];
  setBillHistory: React.Dispatch<React.SetStateAction<BillHistoryEntry[]>>;
  dbPending: boolean;
  tenantId: string;
}

const INIT_COUPONS = [
  { id: "cp1", code: "AETHER20", discount: "20% OFF", uses: 48, maxUses: 100, active: true }
];

export default function BillingTab({
  toast,
  menu,
  triggerReceipt,
  tables,
  setTables,
  tableOrders,
  setTableOrders,
  billHistory,
  setBillHistory,
  dbPending,
  tenantId
}: BillingTabProps) {
  const supabase = createClient();
  const [view, setView] = useState<"floor" | "session" | "history">("floor");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [gstOn, setGstOn] = useState(true);
  const [svcOn, setSvcOn] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // compatibility fallback
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "upi">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [payStep, setPayStep] = useState<"review" | "success">("review");
  const [histSearch, setHistSearch] = useState("");
  const [menuAddOpen, setMenuAddOpen] = useState(false);
  const [addItemId, setAddItemId] = useState(menu[0]?.id || "");
  const [addItemQty, setAddItemQty] = useState(1);
  const [billCounter, setBillCounter] = useState(42);

  // --- New POS State ---
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [customerPhone, setCustomerPhone] = useState('');
  const [extraChargesAmount, setExtraChargesAmount] = useState(0);
  const [extraChargesLabel, setExtraChargesLabel] = useState('Packing/Delivery');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState(0);

  const [storeInfo, setStoreInfo] = useState({
    storeName: 'CAFE CANVA',
    storeAddress: '123 Main Street, Mumbai 400001',
    storePhone: '+91 98765 43210',
    gstNumber: '27AABCU9603R1ZM',
    fssaiNumber: '11521999000123',
    footerMessage: 'Thank you for visiting! See you again soon ☕',
    logoUrl: '',
  });

  const [billingSettings, setBillingSettings] = useState({
    cgstPercent: 2.5,
    sgstPercent: 2.5,
    serviceChargeType: "percent" as "percent" | "flat",
    serviceChargeValue: 5,
  });
  const [billingSettingsOpen, setBillingSettingsOpen] = useState(false);

  useEffect(() => {
    if (menu[0]) setAddItemId(menu[0].id);
  }, [menu]);

  // Load tenant/store settings from database
  useEffect(() => {
    async function loadStoreDetails() {
      if (!tenantId) return;
      try {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('name, logo_url, phone, address, city, state, pincode')
          .eq('id', tenantId)
          .maybeSingle();

        const { data: settings } = await supabase
          .from('store_settings')
          .select('receipt_header, receipt_footer, tax_cgst, tax_sgst')
          .eq('tenant_id', tenantId)
          .maybeSingle();

        const name = tenant?.name || 'CAFE CANVA';
        const addressParts = [tenant?.address, tenant?.city, tenant?.state, tenant?.pincode].filter(Boolean);
        const address = addressParts.length > 0 ? addressParts.join(', ') : '123 Main Street, Mumbai 400001';
        const phone = tenant?.phone || '+91 98765 43210';
        const logoUrl = tenant?.logo_url || '';
        const footerMessage = settings?.receipt_footer || 'Thank you for visiting! See you again soon ☕';

        let gstNumber = '27AABCU9603R1ZM';
        let fssaiNumber = '11521999000123';
        let serviceChargeType: 'percent' | 'flat' = 'percent';
        let serviceChargeValue = 5;

        if (settings?.receipt_header) {
          try {
            const parsed = JSON.parse(settings.receipt_header);
            if (parsed.gstNumber) gstNumber = parsed.gstNumber;
            if (parsed.fssaiNumber) fssaiNumber = parsed.fssaiNumber;
            if (parsed.serviceChargeType) serviceChargeType = parsed.serviceChargeType;
            if (parsed.serviceChargeValue != null) serviceChargeValue = parsed.serviceChargeValue;
          } catch (e) {
            // receipt_header is just text
          }
        }

        setStoreInfo({
          storeName: name,
          storeAddress: address,
          storePhone: phone,
          gstNumber: gstNumber,
          fssaiNumber: fssaiNumber,
          footerMessage: footerMessage,
          logoUrl: logoUrl,
        });

        setBillingSettings({
          cgstPercent: settings?.tax_cgst ? settings.tax_cgst / 100 : 2.5,
          sgstPercent: settings?.tax_sgst ? settings.tax_sgst / 100 : 2.5,
          serviceChargeType: serviceChargeType,
          serviceChargeValue: serviceChargeValue,
        });
      } catch (err) {
        console.error('Failed to load store details:', err);
      }
    }
    loadStoreDetails();
  }, [tenantId]);

  const saveBillingSettings = (newSettings: typeof billingSettings) => {
    setBillingSettings(newSettings);
  };

  const handleSaveAllSettings = async () => {
    try {
      // 1. Update tenants table
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          name: storeInfo.storeName,
          logo_url: storeInfo.logoUrl,
          phone: storeInfo.storePhone,
          address: storeInfo.storeAddress,
        })
        .eq('id', tenantId);

      if (tenantError) throw tenantError;

      // 2. Update store_settings table
      const serializedHeader = JSON.stringify({
        gstNumber: storeInfo.gstNumber,
        fssaiNumber: storeInfo.fssaiNumber,
        serviceChargeType: billingSettings.serviceChargeType,
        serviceChargeValue: billingSettings.serviceChargeValue,
      });

      const { error: settingsError } = await supabase
        .from('store_settings')
        .upsert({
          tenant_id: tenantId,
          tax_cgst: Math.round(billingSettings.cgstPercent * 100),
          tax_sgst: Math.round(billingSettings.sgstPercent * 100),
          receipt_footer: storeInfo.footerMessage,
          receipt_header: serializedHeader,
        }, { onConflict: 'tenant_id' });

      if (settingsError) throw settingsError;

      setBillingSettingsOpen(false);
      toast("Billing & Store settings saved successfully!", "success");
    } catch (err: any) {
      toast("Failed to save settings: " + err.message, "error");
    }
  };

  const selectTable = async (tbl: Table) => {
    setSelectedTable(tbl);
    const orders = tableOrders[tbl.id] || [];
    setBillItems(orders.map(o => ({ ...o, _key: o.id })));
    setPayStep("review");
    setDiscountValue(0);
    setDiscountType("percent");
    setExtraChargesAmount(0);
    setCouponCode("");
    setCashReceived("");

    // Fetch customer details if they checked in
    if (!dbPending) {
      const { data: activeSession } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('table_id', tbl.id)
        .is('check_out_at', null)
        .maybeSingle();

      if (activeSession) {
        setCustomerPhone(activeSession.customer_phone || '');
      } else {
        setCustomerPhone('');
      }
    } else {
      setCustomerPhone('');
    }
    setView("session");
  };

  const subtotal = billItems.reduce((s, i) => s + (i.qty * i.price), 0);
  const cgstAmt = gstOn ? Math.round(subtotal * (billingSettings.cgstPercent / 100)) : 0;
  const sgstAmt = gstOn ? Math.round(subtotal * (billingSettings.sgstPercent / 100)) : 0;
  const gstAmt = cgstAmt + sgstAmt;

  const svcAmt = svcOn
    ? (billingSettings.serviceChargeType === "flat"
        ? billingSettings.serviceChargeValue
        : Math.round(subtotal * (billingSettings.serviceChargeValue / 100)))
    : 0;

  const totalAfterCharges = subtotal + gstAmt + svcAmt;
  const discountAmt = discountValue > 0
    ? (discountType === "percent"
        ? Math.round(totalAfterCharges * (discountValue / 100))
        : discountValue)
    : 0;
  const grandTotal = Math.max(0, totalAfterCharges - discountAmt + extraChargesAmount);
  const change = cashReceived ? (Number(cashReceived) - grandTotal) : 0;

  const applyCoupon = () => {
    const found = INIT_COUPONS.find(c => c.code === couponCode.toUpperCase() && c.active);
    if (found) {
      setDiscountType("percent");
      setDiscountValue(20);
      toast(`Coupon ${found.code} applied! 20% OFF`, "success");
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

  const addCatalogItemToBill = (mi: MenuItem) => {
    const existing = billItems.find(i => i.itemId === mi.id);
    if (existing) {
      setBillItems(p => p.map(i => i.itemId === mi.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      const key = "new-" + Date.now();
      setBillItems(p => [...p, { id: key, _key: key, itemId: mi.id, name: mi.name, price: mi.price, qty: 1 }]);
    }
    toast(`${mi.name} added to active bill`, "success");
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

  const saveDraft = async () => {
    if (!selectedTable) return;
    try {
      if (!dbPending) {
        // A. Fetch active session or create one
        let activeSession = null;
        const { data: sData } = await supabase
          .from('table_sessions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .is('check_out_at', null)
          .maybeSingle();

        if (sData) {
          activeSession = sData;
        } else {
          const { data: newSess, error: sErr } = await supabase
            .from('table_sessions')
            .insert({
              tenant_id: tenantId,
              table_id: selectedTable.id,
              customer_name: 'Walk-in Guest',
              status: 'active',
              started_at: new Date().toISOString()
            })
            .select()
            .single();

          if (sErr) throw sErr;
          activeSession = newSess;
        }

        // B. Fetch active order
        const { data: activeOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed']);

        let targetOrderId = '';
        const subtotalInPaise = Math.round(subtotal * 100);
        const grandTotalInPaise = Math.round(grandTotal * 100);

        if (activeOrders && activeOrders.length > 0) {
          const existingOrder = activeOrders[0];
          targetOrderId = existingOrder.id;

          const { error: updErr } = await supabase
            .from('orders')
            .update({
              subtotal: subtotalInPaise,
              total: grandTotalInPaise,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetOrderId);

          if (updErr) throw updErr;

          // Delete existing order items
          const { error: delErr } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', targetOrderId);

          if (delErr) throw delErr;
        } else {
          const { data: newOrder, error: insErr } = await supabase
            .from('orders')
            .insert({
              tenant_id: tenantId,
              location_id: selectedTable.location_id || selectedTable.branch_id,
              table_id: selectedTable.id,
              status: 'pending',
              subtotal: subtotalInPaise,
              discount_amount: 0,
              total: grandTotalInPaise,
              order_type: 'dine_in'
            })
            .select()
            .single();

          if (insErr) throw insErr;
          targetOrderId = newOrder.id;
        }

        // C. Insert items
        if (billItems.length > 0) {
          const itemsPayload = billItems.map(item => ({
            order_id: targetOrderId,
            tenant_id: tenantId,
            menu_item_id: item.itemId && item.itemId.startsWith('new-') ? null : item.itemId,
            item_name: item.name,
            unit_price: Math.round(item.price * 100),
            quantity: item.qty,
            notes: item.notes || null
          }));

          const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(itemsPayload);

          if (itemsErr) throw itemsErr;
        }

        // D. Set table status to occupied
        await supabase
          .from('tables')
          .update({ status: 'occupied' })
          .eq('id', selectedTable.id);
      }

      // Sync local states
      setTableOrders(p => ({
        ...p,
        [selectedTable.id]: billItems.map(i => ({ ...i }))
      }));
      setTables(p => p.map(t => t.id === selectedTable.id ? { ...t, status: "occupied" } : t));

      toast("Draft saved successfully to database!", "success");
    } catch (err: any) {
      toast("Failed to save draft: " + err.message, "error");
    }
  };

  const processPayment = async () => {
    if (payMethod === "cash" && (!cashReceived || Number(cashReceived) < grandTotal)) {
      toast("Cash received must be ≥ grand total", "error"); return;
    }
    if (!selectedTable) return;

    try {
      const nextId = billCounter + 1;
      setBillCounter(nextId);
      const billId = `B-00${nextId}`;

      if (!dbPending) {
        // 1. Get active orders for this table
        const { data: activeOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed']);

        const orderIds = (activeOrders || []).map(o => o.id);

        // 2a. Fetch active session details from table_sessions
        const { data: activeSession } = await supabase
          .from('table_sessions')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .is('check_out_at', null)
          .maybeSingle();

        // 2b. Insert bill
        const { error: billErr } = await supabase
          .from('bills')
          .insert({
            tenant_id: tenantId,
            location_id: selectedTable.location_id || selectedTable.branch_id,
            order_ids: orderIds,
            table_number: selectedTable.table_number || parseInt(selectedTable.name.replace(/\D/g, '')) || 0,
            customer_name: activeSession?.customer_name || 'Walk-in Guest',
            customer_phone: activeSession?.customer_phone || customerPhone || null,
            subtotal: Math.round(subtotal * 100),
            cgst: Math.round(cgstAmt * 100),
            sgst: Math.round(sgstAmt * 100),
            discount_amount: Math.round(discountAmt * 100),
            total: Math.round(grandTotal * 100),
            status: 'paid',
            payment_method: payMethod.toLowerCase(),
            paid_at: new Date().toISOString()
          });

        if (billErr) throw billErr;

        // 3. Mark orders as paid
        if (orderIds.length > 0) {
          const { error: ordErr } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .in('id', orderIds);
          if (ordErr) throw ordErr;
        }

        // 4. Checkout table session
        if (activeSession) {
          await supabase
            .from('table_sessions')
            .update({
              check_out_at: new Date().toISOString(),
              total_revenue: Math.round(grandTotal * 100)
            })
            .eq('id', activeSession.id);
        }

        // 5. Update table status to available
        await supabase
          .from('tables')
          .update({ status: 'available' })
          .eq('id', selectedTable.id);
      }

      const newBill: BillHistoryEntry = {
        id: billId,
        table: selectedTable.name,
        section: selectedTable.section || 'Indoor',
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        method: payMethod.toUpperCase(),
        sub: subtotal,
        gst: gstAmt,
        svc: svcAmt,
        discount: discountValue,
        total: grandTotal,
        itemsCount: billItems.length,
        billItems: [...billItems]
      };

      setBillHistory(p => [newBill, ...p]);
      setTables(p => p.map(t => t.id === selectedTable.id ? { ...t, status: "available" } : t));
      setTableOrders(p => ({ ...p, [selectedTable.id]: [] }));
      setPayStep("success");
      toast("Payment complete! Bill settled.", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handlePrint = () => {
    if (!selectedTable) return;
    const rData: ReceiptData = {
      billId: `B-00${billCounter}`,
      storeName: storeInfo.storeName,
      storeAddress: storeInfo.storeAddress,
      storePhone: storeInfo.storePhone,
      gstNumber: storeInfo.gstNumber,
      fssaiNumber: storeInfo.fssaiNumber,
      logoUrl: storeInfo.logoUrl,
      tableName: selectedTable.name,
      tableSection: selectedTable.section || 'Indoor',
      items: billItems.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price,
      })),
      customCharges: [],
      subtotal: subtotal,
      gstAmount: gstAmt,
      gstPercent: billingSettings.cgstPercent + billingSettings.sgstPercent,
      cgstPercent: billingSettings.cgstPercent,
      cgstAmount: cgstAmt,
      sgstPercent: billingSettings.sgstPercent,
      sgstAmount: sgstAmt,
      serviceCharge: svcAmt,
      servicePercent: billingSettings.serviceChargeType === 'percent' ? billingSettings.serviceChargeValue : 0,
      serviceChargeType: billingSettings.serviceChargeType,
      discountPercent: discountType === 'percent' ? discountValue : 0,
      discountAmount: discountAmt,
      couponCode: couponCode,
      extraChargesAmount: extraChargesAmount,
      extraChargesLabel: extraChargesLabel,
      grandTotal: grandTotal,
      paymentMethod: payMethod.toUpperCase(),
      cashReceived: payMethod === 'cash' ? Number(cashReceived) : undefined,
      changeDue: payMethod === 'cash' ? change : undefined,
      dateTime: new Date().toLocaleString('en-IN'),
      footerMessage: storeInfo.footerMessage,
      customerPhone: customerPhone || undefined,
    };
    triggerReceipt(rData);
  };

  const handleHistoryPrint = (entry: BillHistoryEntry) => {
    const rData: ReceiptData = {
      billId: entry.id,
      storeName: storeInfo.storeName,
      storeAddress: storeInfo.storeAddress,
      storePhone: storeInfo.storePhone,
      gstNumber: storeInfo.gstNumber,
      fssaiNumber: storeInfo.fssaiNumber,
      logoUrl: storeInfo.logoUrl,
      tableName: entry.table,
      tableSection: entry.section,
      items: entry.billItems.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price,
      })),
      customCharges: [],
      subtotal: entry.sub,
      gstAmount: entry.gst,
      gstPercent: billingSettings.cgstPercent + billingSettings.sgstPercent,
      cgstPercent: billingSettings.cgstPercent,
      cgstAmount: Math.round(entry.gst / 2),
      sgstPercent: billingSettings.sgstPercent,
      sgstAmount: entry.gst - Math.round(entry.gst / 2),
      serviceCharge: entry.svc,
      servicePercent: billingSettings.serviceChargeType === 'percent' ? billingSettings.serviceChargeValue : 0,
      serviceChargeType: billingSettings.serviceChargeType,
      discountPercent: 0,
      discountAmount: 0,
      couponCode: '',
      grandTotal: entry.total,
      paymentMethod: entry.method,
      dateTime: entry.time,
      footerMessage: storeInfo.footerMessage
    };
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
          <p style={{ fontSize: "12px", color: T.mu2, marginTop: "4px" }}>Full-cycle POS — tables billing · payment settlement</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Btn onClick={() => setBillingSettingsOpen(true)} variant="ghost" size="sm" style={{ border: `1px solid ${T.bdr}` }}>
            ⚙️ Billing settings
          </Btn>
          {[{ v: "floor", l: "Floor View" }, { v: "session", l: "Bill Creator" }, { v: "history", l: "Bill History" }].map(tab => (
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
                <Card key={tbl.id} hover onClick={() => selectTable(tbl)}
                  style={{
                    padding: "14px", border: `1px solid ${occ ? T.rA(0.3) : T.bdr}`,
                    background: occ ? T.rA(0.06) : "", display: "flex", flexDirection: "column", gap: "4px"
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>{tbl.name}</span>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: tableStatusColor[tbl.status] || T.mu,
                    }} />
                  </div>
                  <div style={{ fontSize: "10px", color: T.mu, marginBottom: "6px" }}>{tbl.section} · {tbl.capacity} pax</div>
                  {occ && tblTotal > 0 ? (
                    <div style={{ fontSize: "14px", fontWeight: 800, color: T.tx, fontFamily: fm }}>₹{tblTotal.toFixed(2)}</div>
                  ) : (
                    <div style={{ fontSize: "10px", color: T.mu, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{tbl.status}</div>
                  )}
                  <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                    <Btn 
                      size="sm" 
                      fullWidth 
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                        e.stopPropagation(); 
                        selectTable(tbl); 
                      }}
                    >
                      {occ ? "Open Bill" : "Create Bill"}
                    </Btn>
                  </div>
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
            <Card style={{ padding: "40px", textAlign: "center", maxWidth: "440px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: T.tx, marginBottom: "8px" }}>No Table Selected</div>
              <p style={{ fontSize: "12px", color: T.mu2, marginBottom: "20px" }}>Select a table below to start a manual billing session, or choose one from the Floor View.</p>
              
              <div style={{ width: "100%", marginBottom: "20px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mu, marginBottom: "6px" }}>
                  Select Table for Bill Creation
                </label>
                <Sel 
                  value="" 
                  onChange={(e) => {
                    const tbl = tables.find(t => t.id === e.target.value);
                    if (tbl) selectTable(tbl);
                  }}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled>-- Select a Table --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.section || 'Indoor'}) — {t.status.toUpperCase()}
                    </option>
                  ))}
                </Sel>
              </div>

              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <Btn onClick={() => setView("floor")} variant="outline" style={{ flex: 1 }}>
                  Go to Floor View
                </Btn>
              </div>
            </Card>
          ) : payStep === "success" ? (
            <Card style={{ padding: "40px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%", background: T.eA(0.15), border: `2px solid ${T.eA(0.4)}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 16px"
              }}>✓</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: T.tx, marginBottom: "6px" }}>Payment Successful</div>
              <p style={{ fontSize: "12px", color: T.mu2, marginBottom: "4px" }}>{selectedTable?.name} · {payMethod.toUpperCase()}</p>
              <div style={{ fontSize: "28px", fontWeight: 800, color: T.em, fontFamily: fm, margin: "16px 0" }}>₹{grandTotal.toFixed(2)}</div>
              {payMethod === "cash" && change > 0 && (
                <div style={{ padding: "12px", borderRadius: "8px", background: T.aA(0.1), border: `1px solid ${T.aA(0.25)}`, marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: T.amb, fontWeight: 700 }}>Change Due: ₹{change.toFixed(2)}</span>
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
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1.2fr", gap: "16px", alignItems: "start" }}>
              
              {/* Column 1: Menu Catalog */}
              <Card style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px", height: "600px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>Menu Items</span>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={menuSearch} 
                    onChange={e => setMenuSearch(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.03)", border: `1px solid ${T.bdr}`,
                      borderRadius: "6px", padding: "4px 8px", color: T.tx, fontSize: "11px",
                      outline: "none", width: "100px"
                    }}
                  />
                </div>

                {/* Categories Tab */}
                <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "6px", borderBottom: `1px solid ${T.bdr}` }}>
                  <button
                    onClick={() => setSelectedCat("All")}
                    style={{
                      padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
                      background: selectedCat === "All" ? T.eA(0.12) : "transparent",
                      color: selectedCat === "All" ? T.em : T.mu, border: "none", cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    All
                  </button>
                  {Array.from(new Set(menu.map(m => m.cat))).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCat(cat)}
                      style={{
                        padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
                        background: selectedCat === cat ? T.eA(0.12) : "transparent",
                        color: selectedCat === cat ? T.em : T.mu, border: "none", cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: "8px" }}>
                  {menu
                    .filter(m => m.status === "available")
                    .filter(m => selectedCat === "All" || m.cat === selectedCat)
                    .filter(m => !menuSearch || m.name.toLowerCase().includes(menuSearch.toLowerCase()))
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => addCatalogItemToBill(m)}
                        style={{
                          display: "flex", flexDirection: "column", gap: "4px", padding: "10px",
                          borderRadius: "8px", border: `1px solid ${T.bdr}`, background: "rgba(255,255,255,0.03)",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                          alignItems: "stretch"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = T.em}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = T.bdr}
                      >
                        <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: "30px", lineHeight: 1.3 }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: T.em, fontFamily: fm }}>
                          ₹{m.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                </div>
              </Card>

              {/* Column 2: Items Table */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card style={{ padding: "18px", height: "600px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx }}>{selectedTable?.name} — Active Bill</div>
                      <div style={{ fontSize: "11px", color: T.mu2 }}>{billItems.length} items · {selectedTable?.section}</div>
                    </div>
                    <Btn size="sm" variant="ghost" onClick={() => setMenuAddOpen(true)}>+ Add Custom</Btn>
                  </div>
                  
                  {billItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: T.mu, fontSize: "12px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      No items on this table. Click items from the catalog on the left to add.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto", flex: 1 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${T.bdr}` }}>
                            {["Item", "Price", "Qty", "Total", ""].map(h => (
                              <th key={h} style={{ textAlign: "left", padding: "0 0 10px", fontSize: "10px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {billItems.map(item => (
                            <tr key={item._key} style={{ borderBottom: `1px solid ${T.bdr}` }}>
                              <td style={{ padding: "10px 0", fontSize: "12px", color: T.tx, fontWeight: 500 }}>
                                <div>{item.name}</div>
                                <input
                                  type="text"
                                  placeholder="Add notes..."
                                  value={item.notes || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBillItems(p => p.map(i => i._key === item._key ? { ...i, notes: val } : i));
                                  }}
                                  style={{
                                    width: "90%", background: "transparent", border: "none",
                                    borderBottom: `1px dashed ${T.bdr}`, color: T.mu2, fontSize: "10px",
                                    padding: "2px 0", outline: "none", marginTop: "2px"
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 0" }}>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={item.price} 
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setBillItems(p => p.map(i => i._key === item._key ? { ...i, price: val } : i));
                                  }}
                                  style={{
                                    width: "55px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.bdr}`,
                                    borderRadius: "4px", padding: "2px 4px", color: T.tx, fontSize: "12px", fontFamily: fm,
                                    outline: "none"
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <button onClick={() => updateQty(item._key, -1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "20px", height: "20px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: T.tx, minWidth: "16px", textAlign: "center" }}>{item.qty}</span>
                                  <button onClick={() => updateQty(item._key, 1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "20px", height: "20px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                </div>
                              </td>
                              <td style={{ padding: "8px 0", fontSize: "12px", fontWeight: 700, color: T.tx, fontFamily: fm }}>₹{(item.qty * item.price).toFixed(2)}</td>
                              <td style={{ padding: "8px 0" }}>
                                <button onClick={() => setBillItems(p => p.filter(i => i._key !== item._key))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>

              {/* Column 3: Summary & Payment */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Card style={{ padding: "18px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.tx, marginBottom: "14px" }}>Bill Summary</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                      <span>Subtotal</span><span style={{ color: T.tx, fontWeight: 600, fontFamily: fm }}>₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                        <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <input type="checkbox" checked={gstOn} onChange={e => setGstOn(e.target.checked)} /> Taxes ({(billingSettings.cgstPercent + billingSettings.sgstPercent)}%)
                        </span>
                        <span style={{ color: T.tx, fontFamily: fm, fontWeight: 600 }}>₹{gstAmt.toFixed(2)}</span>
                      </div>
                      {gstOn && (
                        <div style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px", color: T.mu2 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>CGST ({billingSettings.cgstPercent}%)</span>
                            <span style={{ fontFamily: fm }}>₹{cgstAmt.toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>SGST ({billingSettings.sgstPercent}%)</span>
                            <span style={{ fontFamily: fm }}>₹{sgstAmt.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <input type="checkbox" checked={svcOn} onChange={e => setSvcOn(e.target.checked)} /> Service Charge ({billingSettings.serviceChargeType === 'percent' ? `${billingSettings.serviceChargeValue}%` : `₹${billingSettings.serviceChargeValue}`})
                      </span>
                      <span style={{ color: T.tx, fontFamily: fm }}>₹{svcAmt.toFixed(2)}</span>
                    </div>

                    {extraChargesAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.mu2 }}>
                        <span>{extraChargesLabel}</span>
                        <span style={{ color: T.tx, fontFamily: fm }}>₹{extraChargesAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {discountAmt > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.em }}>
                        <span>Discount {discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
                        <span style={{ fontFamily: fm }}>-₹{discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800, color: T.tx }}>
                      <span>Total</span><span style={{ fontFamily: fm }}>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                {/* Optional Discounts & Extra Charges */}
                <Card style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>Custom Discounts & Charges</div>
                  
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ display: "block", fontSize: "9px", color: T.mu2, marginBottom: "4px" }}>Discount Value</label>
                      <Input type="number" placeholder="0" value={discountValue || ""} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ display: "block", fontSize: "9px", color: T.mu2, marginBottom: "4px" }}>Type</label>
                      <Sel value={discountType} onChange={e => setDiscountType(e.target.value as any)}>
                        <option value="percent">Percent (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </Sel>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ display: "block", fontSize: "9px", color: T.mu2, marginBottom: "4px" }}>Extra Charges Label</label>
                      <Input placeholder="Packing/Delivery" value={extraChargesLabel} onChange={e => setExtraChargesLabel(e.target.value)} />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <label style={{ display: "block", fontSize: "9px", color: T.mu2, marginBottom: "4px" }}>Amount (₹)</label>
                      <Input type="number" placeholder="0" value={extraChargesAmount || ""} onChange={e => setExtraChargesAmount(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: "18px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Coupon / Phone</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                    <Input placeholder="Enter coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ flex: 1 }} />
                    <Btn size="sm" onClick={applyCoupon}>Apply</Btn>
                  </div>
                  <Input label="Customer Phone (for WhatsApp)" placeholder="10-digit number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
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

                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn variant="outline" size="lg" style={{ flex: 1 }} onClick={saveDraft} disabled={billItems.length === 0}>
                    Save Draft
                  </Btn>
                  <Btn variant="emerald" size="lg" style={{ flex: 2 }} onClick={processPayment} disabled={billItems.length === 0}>
                    Settle Bill — ₹{grandTotal.toFixed(2)}
                  </Btn>
                </div>
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
            <div style={{ overflowX: "auto" }}>
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
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: T.tx, fontFamily: fm }}>₹{b.sub.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>₹{b.gst.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: T.mu2, fontFamily: fm }}>₹{b.svc.toFixed(2)}</td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 800, color: T.em, fontFamily: fm }}>₹{b.total.toFixed(2)}</td>
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
      <Modal show={menuAddOpen} onClose={() => setMenuAddOpen(false)} title="Add Custom Item to Bill">
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
      <Modal show={billingSettingsOpen} onClose={() => setBillingSettingsOpen(false)} title="Settings — Billing & Store Info">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "80vh", overflowY: "auto", paddingRight: "4px" }}>
          
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em" }}>Store Details</div>
          
          <Input
            label="Store Logo URL"
            value={storeInfo.logoUrl}
            onChange={e => setStoreInfo({ ...storeInfo, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Store Name"
              value={storeInfo.storeName}
              onChange={e => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
            />
            <Input
              label="Store Phone"
              value={storeInfo.storePhone}
              onChange={e => setStoreInfo({ ...storeInfo, storePhone: e.target.value })}
            />
          </div>

          <Input
            label="Store Address"
            value={storeInfo.storeAddress}
            onChange={e => setStoreInfo({ ...storeInfo, storeAddress: e.target.value })}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="GSTIN Number"
              value={storeInfo.gstNumber}
              onChange={e => setStoreInfo({ ...storeInfo, gstNumber: e.target.value.toUpperCase() })}
            />
            <Input
              label="FSSAI License No."
              value={storeInfo.fssaiNumber}
              onChange={e => setStoreInfo({ ...storeInfo, fssaiNumber: e.target.value })}
            />
          </div>

          <Input
            label="Receipt Footer Message"
            value={storeInfo.footerMessage}
            onChange={e => setStoreInfo({ ...storeInfo, footerMessage: e.target.value })}
          />

          <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.mu, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Taxes & Service Charges</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
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
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Btn onClick={handleSaveAllSettings} variant="emerald" fullWidth>Save & Apply Settings</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
