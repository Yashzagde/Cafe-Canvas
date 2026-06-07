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
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<"cash" | "card" | "upi">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [payStep, setPayStep] = useState<"review" | "success">("review");
  const [histSearch, setHistSearch] = useState("");
  const [menuAddOpen, setMenuAddOpen] = useState(false);
  const [addItemId, setAddItemId] = useState(menu[0]?.id || "");
  const [addItemQty, setAddItemQty] = useState(1);
  const [billCounter, setBillCounter] = useState(42);

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

  const saveBillingSettings = (newSettings: typeof billingSettings) => {
    setBillingSettings(newSettings);
  };

  const selectTable = (tbl: Table) => {
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
  const cgstAmt = gstOn ? Math.round(subtotal * (billingSettings.cgstPercent / 100)) : 0;
  const sgstAmt = gstOn ? Math.round(subtotal * (billingSettings.sgstPercent / 100)) : 0;
  const gstAmt = cgstAmt + sgstAmt;

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
      setDiscount(20);
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

        // 2. Insert bill
        const { error: billErr } = await supabase
          .from('bills')
          .insert({
            tenant_id: tenantId,
            table_id: selectedTable.id,
            order_ids: orderIds,
            subtotal: Math.round(subtotal * 100),
            tax: Math.round(gstAmt * 100),
            discount_amount: Math.round(discountAmt * 100),
            total: Math.round(grandTotal * 100),
            payment_method: payMethod.toUpperCase(),
            status: 'paid',
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
        const { data: activeSession } = await supabase
          .from('table_sessions')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('table_id', selectedTable.id)
          .is('check_out_at', null)
          .maybeSingle();

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
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handlePrint = () => {
    if (!selectedTable) return;
    const rData: ReceiptData = {
      billId: `B-00${billCounter}`,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
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
      discountPercent: discount,
      discountAmount: discountAmt,
      couponCode: couponCode,
      grandTotal: grandTotal,
      paymentMethod: payMethod.toUpperCase(),
      cashReceived: payMethod === 'cash' ? Number(cashReceived) : undefined,
      changeDue: payMethod === 'cash' ? change : undefined,
      dateTime: new Date().toLocaleString('en-IN'),
      footerMessage: DEFAULT_STORE_INFO.footerMessage
    };
    triggerReceipt(rData);
  };

  const handleHistoryPrint = (entry: BillHistoryEntry) => {
    const rData: ReceiptData = {
      billId: entry.id,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
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
      gstPercent: 5,
      cgstPercent: 2.5,
      cgstAmount: Math.round(entry.gst / 2),
      sgstPercent: 2.5,
      sgstAmount: entry.gst - Math.round(entry.gst / 2),
      serviceCharge: entry.svc,
      servicePercent: 5,
      serviceChargeType: 'percent',
      discountPercent: entry.discount,
      discountAmount: entry.discount > 0 ? Math.round((entry.sub + entry.gst + entry.svc) * (entry.discount / 100)) : 0,
      couponCode: '',
      grandTotal: entry.total,
      paymentMethod: entry.method,
      dateTime: entry.time,
      footerMessage: DEFAULT_STORE_INFO.footerMessage
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
                    <div style={{ overflowX: "auto" }}>
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
                              <td style={{ padding: "10px 0", fontSize: "12px", color: T.mu2, fontFamily: fm }}>₹{item.price.toFixed(2)}</td>
                              <td style={{ padding: "10px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <button onClick={() => updateQty(item._key, -1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "22px", height: "22px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: T.tx, minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                                  <button onClick={() => updateQty(item._key, 1)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.bdr}`, borderRadius: "4px", color: T.mu2, cursor: "pointer", width: "22px", height: "22px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                </div>
                              </td>
                              <td style={{ padding: "10px 0", fontSize: "12px", fontWeight: 700, color: T.tx, fontFamily: fm }}>₹{(item.qty * item.price).toFixed(2)}</td>
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
                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: T.em }}>
                        <span>Discount ({discount}%)</span><span style={{ fontFamily: fm }}>-₹{discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: `1px solid ${T.bdr}`, paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800, color: T.tx }}>
                      <span>Total</span><span style={{ fontFamily: fm }}>₹{grandTotal.toFixed(2)}</span>
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
                  Settle Bill — ₹{grandTotal.toFixed(2)}
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
