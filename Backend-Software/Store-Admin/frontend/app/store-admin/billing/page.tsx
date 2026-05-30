'use client';

import React, { useState, useCallback } from 'react';
import { Printer, Trash2, Plus, Check, Search, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';
import { ReceiptPreviewModal } from '@/components/billing';
import type { ReceiptData } from '@/components/billing/types';
import { DEFAULT_STORE_INFO } from '@/components/billing/types';

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
          width: "100%", maxWidth: `${width}px`, maxHeight: "90vh", overflowY: "auto",
          background: "rgba(12,12,16,0.97)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
        }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid rgba(255,255,255,0.07)`, display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f1f3" }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#6b7280", cursor: "pointer",
            fontSize: "20px", lineHeight: 1, padding: "0 4px"
          }}>×</button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Mock Menu Items ─── */
const MENU_ITEMS = [
  { id: 'm1', name: 'Classic Cappuccino', price: 290 },
  { id: 'm2', name: 'Specialty Cold Brew', price: 350 },
  { id: 'm3', name: 'Matcha Latte Special', price: 320 },
  { id: 'm4', name: 'Avocado Sourdough Toast', price: 390 },
  { id: 'm5', name: 'Almond Butter Croissant', price: 240 },
  { id: 'm6', name: 'Green Tea Mint Infusion', price: 210 },
  { id: 'm7', name: 'Chocolate Truffle Pastry', price: 180 },
  { id: 'm8', name: 'Vegan Blueberry Muffin', price: 160 },
  { id: 'm9', name: 'Aether Loaded Burrito', price: 420 },
  { id: 'm10', name: 'Hibiscus Rose Cooler', price: 230 },
];

/* ─── Interfaces ─── */
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface TableState {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  size: number;
  orders: CartItem[];
}

interface BillHistoryEntry {
  id: string;
  tableId: string;
  tableName: string;
  subtotal: number;
  gstAmount: number;
  serviceCharge: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  dateTime: string;
  items: CartItem[];
}

export default function StoreAdminBilling() {
  // Floor Tables State
  const [tables, setTables] = useState<TableState[]>([
    { id: '1', name: 'Table 01', status: 'available', size: 2, orders: [] },
    { id: '2', name: 'Table 02', status: 'cleaning', size: 4, orders: [] },
    { id: '3', name: 'Table 03', status: 'reserved', size: 2, orders: [] },
    {
      id: '4', name: 'Table 04', status: 'occupied', size: 6, orders: [
        { id: 'm1', name: 'Classic Cappuccino', price: 290, qty: 2 },
        { id: 'm4', name: 'Avocado Sourdough Toast', price: 390, qty: 2 },
        { id: 'm7', name: 'Chocolate Truffle Pastry', price: 180, qty: 1 },
      ]
    },
    { id: '5', name: 'Table 05', status: 'available', size: 2, orders: [] },
    {
      id: '6', name: 'Table 06', status: 'occupied', size: 4, orders: [
        { id: 'm2', name: 'Specialty Cold Brew', price: 350, qty: 2 },
        { id: 'm5', name: 'Almond Butter Croissant', price: 240, qty: 1 },
      ]
    },
    {
      id: '7', name: 'Table 07', status: 'occupied', size: 2, orders: [
        { id: 'm3', name: 'Matcha Latte Special', price: 320, qty: 1 },
      ]
    },
    { id: '8', name: 'Table 08', status: 'available', size: 4, orders: [] },
  ]);

  const [selectedTableId, setSelectedTableId] = useState<string | null>('4');
  const [billHistory, setBillHistory] = useState<BillHistoryEntry[]>([
    {
      id: 'B-0088', tableId: '3', tableName: 'Table 03', subtotal: 930, gstAmount: 47, serviceCharge: 47, discountAmount: 0, grandTotal: 1024, paymentMethod: 'UPI', dateTime: '28 May 2026, 08:30 PM',
      items: [{ id: 'm1', name: 'Classic Cappuccino', price: 290, qty: 2 }, { id: 'm2', name: 'Specialty Cold Brew', price: 350, qty: 1 }]
    }
  ]);

  // POS State
  const [subView, setSubView] = useState<'checkout' | 'history'>('checkout');
  const [gstOn, setGstOn] = useState(true);
  const [svcOn, setSvcOn] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0); // percent
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [payStep, setPayStep] = useState<'review' | 'success'>('review');
  const [histSearch, setHistSearch] = useState('');

  // Add menu item popover state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemId, setAddItemId] = useState('m1');
  const [addItemQty, setAddItemQty] = useState(1);

  // Thermal Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [billCounter, setBillCounter] = useState(89);

  // Active Selected Table Helper
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const cartItems = selectedTable?.orders || [];

  // Cart Calculations
  const subtotal = cartItems.reduce((s, i) => s + (i.qty * i.price), 0);
  const gstAmt = gstOn ? Math.round(subtotal * 0.05) : 0;
  const svcAmt = svcOn ? Math.round(subtotal * 0.05) : 0;
  const totalBeforeDiscount = subtotal + gstAmt + svcAmt;
  const discountAmt = discount > 0 ? Math.round(totalBeforeDiscount * (discount / 100)) : 0;
  const grandTotal = totalBeforeDiscount - discountAmt;
  const changeDue = cashReceived ? (Number(cashReceived) - grandTotal) : 0;

  // Cart Handlers
  const updateQty = (itemId: string, delta: number) => {
    if (!selectedTableId) return;
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      const updatedOrders = t.orders.map(o => {
        if (o.id !== itemId) return o;
        const newQty = o.qty + delta;
        return newQty <= 0 ? null : { ...o, qty: newQty };
      }).filter(Boolean) as CartItem[];
      return { ...t, orders: updatedOrders };
    }));
  };

  const removeItem = (itemId: string) => {
    if (!selectedTableId) return;
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return { ...t, orders: t.orders.filter(o => o.id !== itemId) };
    }));
  };

  const handleAddItem = () => {
    if (!selectedTableId) return;
    const mi = MENU_ITEMS.find(m => m.id === addItemId);
    if (!mi) return;

    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      const existing = t.orders.find(o => o.id === addItemId);
      let updatedOrders;
      if (existing) {
        updatedOrders = t.orders.map(o => o.id === addItemId ? { ...o, qty: o.qty + addItemQty } : o);
      } else {
        updatedOrders = [...t.orders, { id: mi.id, name: mi.name, price: mi.price, qty: addItemQty }];
      }
      return { ...t, orders: updatedOrders };
    }));

    setAddItemOpen(false);
    setAddItemQty(1);
  };

  // Coupons
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'AETHER20') {
      setDiscount(20);
      alert('Coupon AETHER20 applied! 20% discount set.');
    } else {
      alert('Invalid coupon code.');
    }
  };

  // Receipt builder
  const buildReceiptDataObj = (billId: string, tbl: TableState | { name: string; section: string }, items: CartItem[], payM: string, sub: number, gst: number, svc: number, disc: number, total: number, cashRec?: number): ReceiptData => {
    return {
      billId,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
      tableName: tbl.name,
      tableSection: 'section' in tbl ? tbl.section : 'Indoor',
      items: items.map(i => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price,
      })),
      customCharges: [],
      subtotal: sub,
      gstAmount: gst,
      gstPercent: 5,
      serviceCharge: svc,
      servicePercent: 5,
      discountPercent: disc,
      discountAmount: disc > 0 ? Math.round((sub + gst + svc) * (disc / 100)) : 0,
      couponCode: disc > 0 ? 'AETHER20' : '',
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

  // Payment Settlement
  const handleCheckoutPayment = () => {
    if (payMethod === 'cash' && (!cashReceived || Number(cashReceived) < grandTotal)) {
      alert('Cash received must be ≥ grand total');
      return;
    }
    if (!selectedTable) return;

    const nextId = billCounter + 1;
    setBillCounter(nextId);
    const billId = `B-00${nextId}`;

    const newBill: BillHistoryEntry = {
      id: billId,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      subtotal,
      gstAmount: gstAmt,
      serviceCharge: svcAmt,
      discountAmount: discountAmt,
      grandTotal,
      paymentMethod: payMethod.toUpperCase(),
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      items: [...cartItems]
    };

    setBillHistory(p => [newBill, ...p]);
    setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'available', orders: [] } : t));
    setPayStep('success');
  };

  const triggerLivePrint = () => {
    if (!selectedTable) return;
    const rData = buildReceiptDataObj(
      `B-00${billCounter}`,
      selectedTable,
      cartItems,
      payMethod.toUpperCase(),
      subtotal,
      gstAmt,
      svcAmt,
      discount,
      grandTotal,
      payMethod === 'cash' ? Number(cashReceived) : undefined
    );
    setReceiptData(rData);
    setShowReceipt(true);
  };

  const triggerHistoryPrint = (entry: BillHistoryEntry) => {
    const rData = buildReceiptDataObj(
      entry.id,
      { name: entry.tableName, section: 'Indoor' },
      entry.items,
      entry.paymentMethod,
      entry.subtotal,
      entry.gstAmount,
      entry.serviceCharge,
      entry.discountAmount > 0 ? 20 : 0,
      entry.grandTotal,
      entry.paymentMethod === 'CASH' ? entry.grandTotal : undefined
    );
    setReceiptData(rData);
    setShowReceipt(true);
  };

  const resetPOSSession = () => {
    setSelectedTableId(null);
    setPayStep('review');
    setDiscount(0);
    setCouponCode('');
    setCashReceived('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">POS Billing terminal</h2>
          <p className="text-sm text-neutral-400 mt-1">Manage physical tables, customize items, apply coupons, and print receipts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSubView('checkout')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition ${subView === 'checkout' ? 'bg-accent-indigo text-white shadow-lg shadow-accent-indigo/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
          >
            Floor POS
          </button>
          <button
            onClick={() => setSubView('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition ${subView === 'history' ? 'bg-accent-indigo text-white shadow-lg shadow-accent-indigo/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
          >
            Bill History Log
          </button>
        </div>
      </div>

      {/* POS FLOOR CHECKOUT VIEW */}
      {subView === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tables layout */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Floor Layout Selector</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: "Occupied", color: "bg-accent-rose" },
                    { label: "Available", color: "bg-accent-emerald" },
                    { label: "Cleaning", color: "bg-accent-amber" },
                    { label: "Reserved", color: "bg-neutral-500" },
                  ].map((leg, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <span className={`w-2 h-2 rounded-full ${leg.color}`} />
                      <span>{leg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tables.map(tbl => {
                  const isSelected = selectedTableId === tbl.id;
                  const isOccupied = tbl.status === 'occupied';
                  const tblTotal = tbl.orders.reduce((s, o) => s + (o.qty * o.price), 0);
                  return (
                    <button
                      key={tbl.id}
                      onClick={() => {
                        if (tbl.status !== 'occupied') {
                          // Allow admin to open/occupy a vacant table
                          setTables(prev => prev.map(t => t.id === tbl.id ? { ...t, status: 'occupied' } : t));
                        }
                        setSelectedTableId(tbl.id);
                        setPayStep('review');
                      }}
                      className={`p-4 rounded-xl border flex flex-col justify-between text-left h-28 transition ${isSelected ? 'bg-accent-indigo/10 border-accent-indigo' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-bold text-white">{tbl.name}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${tbl.status === 'available' ? 'bg-accent-emerald' : tbl.status === 'occupied' ? 'bg-accent-rose animate-pulse' : tbl.status === 'cleaning' ? 'bg-accent-amber' : 'bg-neutral-500'}`}></span>
                      </div>
                      <div>
                        {tblTotal > 0 ? (
                          <span className="font-display font-extrabold text-sm text-white block">₹{tblTotal.toLocaleString()}</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 block">Vacant ({tbl.size} pax)</span>
                        )}
                        <span className="text-[9px] uppercase font-semibold text-neutral-400 mt-1 block">{tbl.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkout Cart Summary Panel */}
          <div className="glass-card p-6 flex flex-col min-h-[480px]">
            {selectedTableId ? (
              payStep === 'success' ? (
                /* Payment Success View */
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center mb-2">
                    <Check size={28} className="text-accent-emerald" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-white">Invoice Settled</h3>
                  <p className="text-xs text-neutral-400">{selectedTable?.name} vacated successfully.</p>
                  <div className="text-2xl font-black text-white py-2">₹{grandTotal.toLocaleString()}</div>
                  {payMethod === 'cash' && changeDue > 0 && (
                    <div className="p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-xl text-accent-amber text-xs font-bold">
                      Change Due: ₹{changeDue.toLocaleString()}
                    </div>
                  )}
                  <div className="pt-6 w-full space-y-2">
                    <button
                      onClick={triggerLivePrint}
                      className="w-full py-3 bg-accent-indigo text-white font-bold text-xs rounded-xl hover:bg-accent-indigo/90 transition shadow-lg shadow-accent-indigo/25 flex items-center justify-center gap-2"
                    >
                      <Printer size={14} /> Print Receipt
                    </button>
                    <button
                      onClick={resetPOSSession}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs rounded-lg transition"
                    >
                      VACATE TABLE
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Settle View */
                <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                  {/* Cart List */}
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div>
                        <span className="text-sm font-bold text-white block">Active Order Summary</span>
                        <span className="text-xs text-neutral-400">Reviewing {selectedTable?.name}</span>
                      </div>
                      <button
                        onClick={() => setAddItemOpen(true)}
                        className="text-xs font-bold text-accent-indigo hover:text-accent-indigo/80"
                      >
                        + Add Item
                      </button>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500 text-xs">
                        No active items on this table. Add some below to bill!
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {cartItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex-1 min-w-0 pr-2">
                              <span className="text-xs text-neutral-300 block truncate">{item.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-5 h-5 rounded bg-white/5 text-neutral-300 text-xs font-bold flex items-center justify-center hover:bg-white/10 transition"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-white">{item.qty}</span>
                                <button
                                  onClick={() => updateQty(item.id, 1)}
                                  className="w-5 h-5 rounded bg-white/5 text-neutral-300 text-xs font-bold flex items-center justify-center hover:bg-white/10 transition"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white font-mono">₹{(item.qty * item.price).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-neutral-500 hover:text-accent-rose p-1 transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Charge settings */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={gstOn} onChange={e => setGstOn(e.target.checked)} className="rounded border-white/10 bg-white/5 text-accent-indigo" /> CGST + SGST (5%)
                      </label>
                      <span className="font-mono">₹{gstAmt}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={svcOn} onChange={e => setSvcOn(e.target.checked)} className="rounded border-white/10 bg-white/5 text-accent-indigo" /> Service Charge (5%)
                      </label>
                      <span className="font-mono">₹{svcAmt}</span>
                    </div>

                    {/* Coupons */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        className="bg-white/5 border border-white/5 focus:border-accent-indigo rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none flex-1 font-bold"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-bold transition"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Grand totals */}
                    <div className="p-4 rounded-xl bg-white/5 space-y-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Subtotal</span>
                        <span className="text-white font-mono">₹{subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-xs text-accent-rose">
                          <span>Discount ({discount}%)</span>
                          <span className="font-mono">-₹{discountAmt.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-display font-extrabold text-sm border-t border-white/5 pt-2 text-white">
                        <span>GRAND TOTAL</span>
                        <span className="text-accent-indigo font-mono">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment selector */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-2">Collect Payment Method</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['cash', 'card', 'upi'] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => setPayMethod(m)}
                            className={`py-2 rounded-lg text-[10px] font-bold border transition ${payMethod === m ? 'border-accent-indigo bg-accent-indigo/10 text-white' : 'border-white/5 text-neutral-400 hover:bg-white/5'}`}
                          >
                            {m.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {payMethod === 'cash' && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500 block">Cash Tendered (₹)</label>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={e => setCashReceived(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/5 focus:border-accent-indigo rounded-xl px-4 py-2.5 text-center text-lg font-bold text-white outline-none font-mono"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleCheckoutPayment}
                      disabled={cartItems.length === 0}
                      className="w-full py-3 bg-accent-emerald hover:bg-accent-emerald/90 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-emerald/20"
                    >
                      Settle Bill — ₹{grandTotal.toLocaleString()}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center flex-1 h-64 text-neutral-500 text-xs font-bold text-center">
                Select an occupied table<br />to generate checkout invoices.
              </div>
            )}
          </div>
        </div>
      )}

      {/* BILL HISTORY LOGS VIEW */}
      {subView === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl flex-1 max-w-md">
              <Search className="text-neutral-500" size={16} />
              <input
                type="text"
                placeholder="Search bills by ID or table..."
                value={histSearch}
                onChange={e => setHistSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs text-white placeholder-neutral-500"
              />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-neutral-300">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5">
                    <th className="p-4">Bill ID</th>
                    <th className="p-4">Table</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">GST (5%)</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Method</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {billHistory.filter(b => !histSearch || b.id.toLowerCase().includes(histSearch.toLowerCase()) || b.tableName.toLowerCase().includes(histSearch.toLowerCase())).map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white font-mono">{b.id}</td>
                      <td className="p-4">{b.tableName}</td>
                      <td className="p-4 text-neutral-400">{b.dateTime}</td>
                      <td className="p-4 font-mono">₹{b.subtotal.toLocaleString()}</td>
                      <td className="p-4 font-mono">₹{b.gstAmount.toLocaleString()}</td>
                      <td className="p-4 font-mono">₹{b.serviceCharge.toLocaleString()}</td>
                      <td className="p-4 font-bold text-accent-emerald font-mono">₹{b.grandTotal.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.paymentMethod === 'UPI' ? 'bg-accent-indigo/10 text-accent-indigo' : b.paymentMethod === 'CARD' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-neutral-500/10 text-neutral-400'}`}>
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => triggerHistoryPrint(b)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Printer size={10} /> Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal show={addItemOpen} onClose={() => setAddItemOpen(false)} title="Add Item to Table Bill">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Select Menu Item</label>
            <select
              value={addItemId}
              onChange={e => setAddItemId(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white cursor-pointer outline-none"
            >
              {MENU_ITEMS.map(mi => (
                <option key={mi.id} value={mi.id} className="bg-neutral-900">{mi.name} — ₹{mi.price}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 block">Quantity</label>
            <input
              type="number"
              value={addItemQty}
              onChange={e => setAddItemQty(Number(e.target.value))}
              min="1"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setAddItemOpen(false)}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="flex-1 py-2.5 bg-accent-indigo text-white rounded-xl text-xs font-bold transition"
            >
              Add to Bill
            </button>
          </div>
        </div>
      </Modal>

      {/* Receipts Preview Popup Modal */}
      {receiptData && (
        <ReceiptPreviewModal
          show={showReceipt}
          onClose={() => setShowReceipt(false)}
          data={receiptData}
        />
      )}
    </div>
  );
}
