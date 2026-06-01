'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSyncContext } from '@/app/context/SyncContext';
import type { FloorTable, MenuItem, MenuCategory, OrderItem as OrderItemType, TableStatus } from '@/app/types';
import { db, enqueueOperation, addToLocalCache, updateLocalCache } from '@/app/utils/offline-sync';

/* ═══════════════════════════════════════════════════════
   DEMO DATA — replaced by Dexie cache / API in production
   ═══════════════════════════════════════════════════════ */

const DEMO_SECTIONS = [
  { id: 'all', name: 'All Sections' },
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Indoor' },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Outdoor' },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'Bar' },
];

const DEMO_TABLES: FloorTable[] = [
  { id: 'c001', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000001', name: 'Table 01', capacity: 2, status: 'free', position_x: 0, position_y: 0, shape: 'square', created_at: '', updated_at: '' },
  { id: 'c002', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000001', name: 'Table 02', capacity: 4, status: 'free', position_x: 1, position_y: 0, shape: 'square', created_at: '', updated_at: '' },
  { id: 'c003', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000001', name: 'Table 03', capacity: 2, status: 'reserved', position_x: 2, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
  { id: 'c004', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000001', name: 'Table 04', capacity: 6, status: 'occupied', position_x: 0, position_y: 1, shape: 'long', created_at: '', updated_at: '' },
  { id: 'c005', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000001', name: 'Table 05', capacity: 2, status: 'free', position_x: 1, position_y: 1, shape: 'square', created_at: '', updated_at: '' },
  { id: 'c006', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000002', name: 'Patio 01', capacity: 4, status: 'occupied', position_x: 0, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
  { id: 'c007', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000002', name: 'Patio 02', capacity: 2, status: 'free', position_x: 1, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
  { id: 'c008', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000003', name: 'Bar Seat 1', capacity: 1, status: 'free', position_x: 0, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
  { id: 'c009', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000003', name: 'Bar Seat 2', capacity: 1, status: 'occupied', position_x: 1, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
  { id: 'c010', tenant_id: 'demo', section_id: 'b0000000-0000-0000-0000-000000000003', name: 'Bar Seat 3', capacity: 1, status: 'cleaning', position_x: 2, position_y: 0, shape: 'round', created_at: '', updated_at: '' },
];

const DEMO_CATEGORIES: MenuCategory[] = [
  { id: 'd001', tenant_id: 'demo', name: 'Hot Coffee', icon: '☕', sort_order: 0, visible: true },
  { id: 'd002', tenant_id: 'demo', name: 'Cold Brews', icon: '🧊', sort_order: 1, visible: true },
  { id: 'd003', tenant_id: 'demo', name: 'Teas', icon: '🍵', sort_order: 2, visible: true },
  { id: 'd004', tenant_id: 'demo', name: 'Bakery', icon: '🥐', sort_order: 3, visible: true },
  { id: 'd005', tenant_id: 'demo', name: 'Bites', icon: '🍽️', sort_order: 4, visible: true },
  { id: 'd006', tenant_id: 'demo', name: 'Coolers', icon: '🍹', sort_order: 5, visible: true },
];

const DEMO_MENU: MenuItem[] = [
  { id: 'e001', tenant_id: 'demo', category_id: 'd001', name: 'Classic Cappuccino', description: 'Double espresso with silky steamed milk', price: 290, image_url: null, available: true, featured: true, tags: ['bestseller'], prep_time_min: 5, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e002', tenant_id: 'demo', category_id: 'd001', name: 'Flat White', description: 'Velvety micro-foam espresso', price: 310, image_url: null, available: true, featured: false, tags: [], prep_time_min: 5, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e003', tenant_id: 'demo', category_id: 'd001', name: 'Caramel Macchiato', description: 'Espresso with vanilla and caramel drizzle', price: 350, image_url: null, available: true, featured: false, tags: ['sweet'], prep_time_min: 6, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'e004', tenant_id: 'demo', category_id: 'd002', name: 'Specialty Cold Brew', description: '24-hour slow-dripped single origin', price: 350, image_url: null, available: true, featured: true, tags: ['bestseller'], prep_time_min: 1, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e005', tenant_id: 'demo', category_id: 'd002', name: 'Iced Mocha Shake', description: 'Chocolate blended with espresso over ice', price: 380, image_url: null, available: true, featured: false, tags: ['sweet'], prep_time_min: 4, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e006', tenant_id: 'demo', category_id: 'd003', name: 'Green Tea Mint', description: 'Premium green tea with fresh mint', price: 210, image_url: null, available: true, featured: false, tags: ['veg'], prep_time_min: 4, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e007', tenant_id: 'demo', category_id: 'd004', name: 'Almond Croissant', description: 'Buttery pastry with almond cream', price: 240, image_url: null, available: true, featured: true, tags: ['bestseller'], prep_time_min: 2, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e008', tenant_id: 'demo', category_id: 'd004', name: 'Chocolate Truffle', description: 'Dark chocolate ganache pastry', price: 180, image_url: null, available: true, featured: false, tags: [], prep_time_min: 2, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e009', tenant_id: 'demo', category_id: 'd005', name: 'Avocado Toast', description: 'Organic avocado on sourdough', price: 390, image_url: null, available: true, featured: true, tags: ['bestseller','veg'], prep_time_min: 8, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e010', tenant_id: 'demo', category_id: 'd005', name: 'Loaded Burrito', description: 'Grilled chicken, guac, salsa wrap', price: 420, image_url: null, available: true, featured: false, tags: ['spicy'], prep_time_min: 12, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e011', tenant_id: 'demo', category_id: 'd006', name: 'Hibiscus Cooler', description: 'Hibiscus tea with rose syrup and lime', price: 230, image_url: null, available: true, featured: false, tags: ['cold'], prep_time_min: 3, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e012', tenant_id: 'demo', category_id: 'd006', name: 'Matcha Latte', description: 'Ceremonial matcha with oat milk', price: 320, image_url: null, available: true, featured: false, tags: ['cold'], prep_time_min: 4, sort_order: 1, created_at: '', updated_at: '' },
];

// Pre-fill Table 04 with demo order
const DEMO_INITIAL_ORDERS: Record<string, CartItem[]> = {
  'c004': [
    { menuItemId: 'e001', name: 'Classic Cappuccino', price: 290, quantity: 2, modifiers: [] },
    { menuItemId: 'e009', name: 'Avocado Toast', price: 390, quantity: 2, modifiers: [] },
    { menuItemId: 'e008', name: 'Chocolate Truffle', price: 180, quantity: 1, modifiers: [] },
  ],
  'c006': [
    { menuItemId: 'e004', name: 'Specialty Cold Brew', price: 350, quantity: 2, modifiers: [] },
    { menuItemId: 'e007', name: 'Almond Croissant', price: 240, quantity: 1, modifiers: [] },
  ],
  'c009': [
    { menuItemId: 'e012', name: 'Matcha Latte', price: 320, quantity: 1, modifiers: [] },
  ],
};

/* ═══════════════════════════════════════════════════════ */

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: Array<{ label: string; price_delta: number }>;
}

type PayMethod = 'cash' | 'card' | 'upi' | 'split' | 'complimentary';
type BillingStep = 'order' | 'settle' | 'success';

export default function BillingPage() {
  const { effectivelyOnline, queueAction } = useSyncContext();

  // Floor state
  const [tables, setTables] = useState<FloorTable[]>(DEMO_TABLES);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selectedTableId, setSelectedTableId] = useState<string | null>('c004');

  // Order state
  const [tableOrders, setTableOrders] = useState<Record<string, CartItem[]>>(DEMO_INITIAL_ORDERS);
  const [occupiedTimers, setOccupiedTimers] = useState<Record<string, number>>({ c004: 1800, c006: 900, c009: 420 });
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);

  // Billing state
  const [billingStep, setBillingStep] = useState<BillingStep>('order');
  const [payMethod, setPayMethod] = useState<PayMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [billCounter, setBillCounter] = useState(142);
  const [customerName, setCustomerName] = useState('');

  // Derived
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const cartItems = selectedTableId ? (tableOrders[selectedTableId] || []) : [];
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxRate = 0.05;
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxAmount;

  // Elapsed timers
  useEffect(() => {
    const timer = setInterval(() => {
      setOccupiedTimers(prev => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = prev[key] + 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered tables
  const filteredTables = useMemo(() => {
    if (sectionFilter === 'all') return tables;
    return tables.filter(t => t.section_id === sectionFilter);
  }, [tables, sectionFilter]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    let items = DEMO_MENU.filter(m => m.available);
    if (catFilter) items = items.filter(m => m.category_id === catFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(m => m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
    }
    return items;
  }, [catFilter, searchQuery]);

  // Format elapsed time
  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ─── Cart Handlers ──────────────────────────────

  const addItemToCart = (item: MenuItem) => {
    if (!selectedTableId) return;
    setTableOrders(prev => {
      const existing = prev[selectedTableId] || [];
      const found = existing.find(c => c.menuItemId === item.id);
      if (found) {
        return { ...prev, [selectedTableId]: existing.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
      }
      return { ...prev, [selectedTableId]: [...existing, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, modifiers: [] }] };
    });
    // Mark table as occupied
    setTables(prev => prev.map(t => t.id === selectedTableId && t.status === 'free' ? { ...t, status: 'occupied' as TableStatus } : t));
    if (!occupiedTimers[selectedTableId]) {
      setOccupiedTimers(prev => ({ ...prev, [selectedTableId]: 0 }));
    }
  };

  const updateQty = (menuItemId: string, delta: number) => {
    if (!selectedTableId) return;
    setTableOrders(prev => {
      const existing = prev[selectedTableId] || [];
      return {
        ...prev,
        [selectedTableId]: existing.map(c => {
          if (c.menuItemId !== menuItemId) return c;
          const newQ = c.quantity + delta;
          return newQ <= 0 ? null! : { ...c, quantity: newQ };
        }).filter(Boolean),
      };
    });
  };

  const removeItem = (menuItemId: string) => {
    if (!selectedTableId) return;
    setTableOrders(prev => ({
      ...prev,
      [selectedTableId]: (prev[selectedTableId] || []).filter(c => c.menuItemId !== menuItemId),
    }));
  };

  // ─── Settlement ─────────────────────────────────

  const handleSettleBill = async () => {
    if (payMethod === 'cash' && (!cashReceived || Number(cashReceived) < grandTotal)) {
      return;
    }
    if (!selectedTableId || !selectedTable) return;

    const nextId = billCounter + 1;
    setBillCounter(nextId);
    const billNumber = `CC-2026-${String(nextId).padStart(4, '0')}`;
    const localRef = effectivelyOnline ? undefined : `LOCAL-${Date.now()}`;

    const billData = {
      table_id: selectedTableId,
      bill_number: billNumber,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total: grandTotal,
      payment_method: payMethod,
      customer_name: customerName || null,
      items: cartItems,
      local_ref: localRef,
    };

    if (!effectivelyOnline) {
      // Offline: save locally and queue
      await queueAction({
        operation: 'SETTLE_BILL',
        endpoint: '/api/store-admin/billing/bills/settle',
        method: 'POST',
        payload: billData as Record<string, unknown>,
      });
    }

    // Update table to free
    setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, status: 'free' as TableStatus } : t));
    setTableOrders(prev => ({ ...prev, [selectedTableId]: [] }));
    setOccupiedTimers(prev => {
      const next = { ...prev };
      delete next[selectedTableId];
      return next;
    });
    setBillingStep('success');
  };

  const handleSendToKitchen = async () => {
    if (!selectedTableId || cartItems.length === 0) return;

    const payload = {
      table_id: selectedTableId,
      items: cartItems,
    };

    if (!effectivelyOnline) {
      await queueAction({
        operation: 'SEND_TO_KDS',
        endpoint: '/api/store-admin/billing/orders/kds',
        method: 'POST',
        payload: payload as Record<string, unknown>,
      });
    }
    // Visual feedback could be added here
  };

  const handlePrintReceipt = () => {
    const receiptData = {
      storeName: 'AETHER Café & Roastery',
      storeAddress: '42 Bandra West, Mumbai 400050',
      billNumber: `CC-2026-${String(billCounter).padStart(4, '0')}`,
      tableNumber: selectedTable?.name || '',
      items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      tax: taxAmount,
      discount: 0,
      total: grandTotal,
      paymentMethod: payMethod.toUpperCase(),
      settledAt: new Date().toLocaleString(),
      thankYouMessage: 'Thank you for visiting AETHER! ☕',
    };

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.printReceipt(receiptData);
    } else {
      window.print();
    }
  };

  const resetSession = () => {
    setSelectedTableId(null);
    setBillingStep('order');
    setCashReceived('');
    setCustomerName('');
  };

  // ─── Render ─────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          Billing & Floor
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage tables, create orders, settle bills, and print receipts.
        </p>
      </div>

      {/* Split Layout */}
      <div className="flex gap-5" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* ─── LEFT: Floor Map (65%) ──────────────── */}
        <div className="flex-[65] space-y-4">
          {/* Section Tabs */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                {DEMO_SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSectionFilter(s.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
                    style={{
                      background: sectionFilter === s.id ? 'var(--accent-sapphire)' : 'rgba(255,255,255,0.04)',
                      color: sectionFilter === s.id ? '#fff' : 'var(--text-secondary)',
                      boxShadow: sectionFilter === s.id ? '0 2px 8px rgba(77,124,254,0.3)' : 'none',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {/* Legend */}
              <div className="flex gap-3">
                {[
                  { label: 'Free', color: 'var(--canvas-muted)' },
                  { label: 'Occupied', color: 'var(--accent-sapphire)' },
                  { label: 'Reserved', color: 'var(--accent-amber)' },
                  { label: 'Cleaning', color: 'var(--text-muted)' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTables.map(tbl => {
                const isSelected = selectedTableId === tbl.id;
                const orders = tableOrders[tbl.id] || [];
                const tblTotal = orders.reduce((s, o) => s + o.price * o.quantity, 0);
                const elapsed = occupiedTimers[tbl.id];
                const isOverdue = elapsed > 2700; // 45 min

                return (
                  <button
                    key={tbl.id}
                    onClick={() => {
                      setSelectedTableId(tbl.id);
                      setBillingStep('order');
                    }}
                    className={`glass-card-interactive p-3.5 flex flex-col justify-between text-left h-[110px] ${isSelected ? 'active' : ''} table-${tbl.status}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{tbl.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{
                        background: tbl.status === 'free' ? 'var(--accent-emerald)' :
                                    tbl.status === 'occupied' ? 'var(--accent-sapphire)' :
                                    tbl.status === 'reserved' ? 'var(--accent-amber)' : 'var(--canvas-muted)',
                        animation: tbl.status === 'occupied' ? 'pulse 2s infinite' : 'none',
                      }} />
                    </div>
                    <div>
                      {tbl.status === 'occupied' && tblTotal > 0 ? (
                        <>
                          <span className="font-heading font-extrabold text-sm block" style={{ color: 'var(--text-primary)' }}>
                            ₹{tblTotal.toLocaleString()}
                          </span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                              {orders.length} items
                            </span>
                            {elapsed !== undefined && (
                              <span className="text-[9px] font-mono font-bold" style={{
                                color: isOverdue ? 'var(--accent-crimson)' : 'var(--accent-sapphire)',
                              }}>
                                {formatElapsed(elapsed)}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                            {tbl.capacity} pax · {tbl.shape}
                          </span>
                          <span className="text-[9px] uppercase font-semibold mt-0.5 block" style={{ color: 'var(--text-muted)' }}>
                            {tbl.status}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Search & Item Grid (visible when a table is selected) */}
          {selectedTableId && billingStep === 'order' && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Add Items to Order</span>
              </div>

              {/* Search + Category Pills */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--canvas-border)' }}>
                  <SearchIcon size={14} />
                  <input
                    type="text"
                    placeholder="Search menu items…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-xs"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex gap-1.5 mb-3 flex-wrap">
                <button
                  onClick={() => setCatFilter(null)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    background: !catFilter ? 'var(--accent-sapphire)' : 'rgba(255,255,255,0.04)',
                    color: !catFilter ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  All
                </button>
                {DEMO_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCatFilter(cat.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      background: catFilter === cat.id ? 'var(--accent-sapphire)' : 'rgba(255,255,255,0.04)',
                      color: catFilter === cat.id ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItemToCart(item)}
                    className="p-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--canvas-border)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-sapphire)'; e.currentTarget.style.background = 'rgba(77,124,254,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--canvas-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <span className="text-[11px] font-semibold block truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className="text-[10px] block truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent-emerald)' }}>₹{item.price}</span>
                      {item.featured && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{
                          background: 'rgba(77,124,254,0.1)', color: 'var(--accent-sapphire)',
                        }}>★ BEST</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Order Panel (35%) ──────────── */}
        <div className="flex-[35] glass-card p-5 flex flex-col">
          {!selectedTableId ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <ReceiptLineIcon size={24} color="var(--text-muted)" />
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Select a table to<br />start an order
                </p>
              </div>
            </div>
          ) : billingStep === 'success' ? (
            /* Success View */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                background: 'rgba(0,214,143,0.1)', border: '2px solid rgba(0,214,143,0.2)',
              }}>
                <CheckmarkIcon size={32} color="var(--accent-emerald)" />
              </div>
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Bill Settled</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {selectedTable?.name} is now free.
                {!effectivelyOnline && (
                  <span style={{ color: 'var(--accent-amber)' }}><br />Queued for sync when online.</span>
                )}
              </p>
              <div className="text-3xl font-heading font-extrabold py-2" style={{ color: 'var(--text-primary)' }}>
                ₹{grandTotal.toLocaleString()}
              </div>

              {payMethod === 'cash' && Number(cashReceived) > grandTotal && (
                <div className="px-4 py-2 rounded-xl text-xs font-bold" style={{
                  background: 'rgba(255,201,77,0.08)', border: '1px solid rgba(255,201,77,0.15)', color: 'var(--accent-amber)',
                }}>
                  Change Due: ₹{(Number(cashReceived) - grandTotal).toLocaleString()}
                </div>
              )}

              <div className="w-full space-y-2 pt-4">
                <button onClick={handlePrintReceipt} className="btn-primary w-full flex items-center justify-center gap-2">
                  <PrinterIcon size={14} /> Print Receipt
                </button>
                <button onClick={resetSession} className="btn-ghost w-full">
                  New Session
                </button>
              </div>
            </div>
          ) : billingStep === 'settle' ? (
            /* Settle View */
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--canvas-border)' }}>
                  <div>
                    <span className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>Settle Bill</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{selectedTable?.name}</span>
                  </div>
                  <button onClick={() => setBillingStep('order')} className="btn-ghost text-[10px]">← Back</button>
                </div>

                {/* Payment Method */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'card', 'upi'] as PayMethod[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                        style={{
                          border: `1px solid ${payMethod === m ? 'var(--accent-sapphire)' : 'var(--canvas-border)'}`,
                          background: payMethod === m ? 'rgba(77,124,254,0.08)' : 'transparent',
                          color: payMethod === m ? 'var(--accent-sapphire)' : 'var(--text-secondary)',
                        }}
                      >
                        {m === 'cash' ? '💵' : m === 'card' ? '💳' : '📱'} {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['split', 'complimentary'] as PayMethod[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className="py-2 rounded-xl text-[10px] font-bold transition-all"
                        style={{
                          border: `1px solid ${payMethod === m ? 'var(--accent-sapphire)' : 'var(--canvas-border)'}`,
                          background: payMethod === m ? 'rgba(77,124,254,0.08)' : 'transparent',
                          color: payMethod === m ? 'var(--accent-sapphire)' : 'var(--text-muted)',
                        }}
                      >
                        {m === 'split' ? '✂️ Split' : '🎁 Comp'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Input */}
                {payMethod === 'cash' && (
                  <div className="mt-4">
                    <label className="text-[10px] uppercase font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>Cash Tendered (₹)</label>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                      placeholder="0"
                      className="glass-input w-full px-4 py-3 text-center text-xl font-bold font-mono"
                    />
                    {cashReceived && Number(cashReceived) >= grandTotal && (
                      <div className="text-center mt-2 text-xs font-bold" style={{ color: 'var(--accent-emerald)' }}>
                        Change: ₹{(Number(cashReceived) - grandTotal).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div>
                <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>GST (5%)</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-sm pt-2 border-t" style={{ borderColor: 'var(--canvas-border)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>TOTAL</span>
                    <span className="font-mono" style={{ color: 'var(--accent-sapphire)' }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSettleBill}
                  disabled={cartItems.length === 0 || (payMethod === 'cash' && (!cashReceived || Number(cashReceived) < grandTotal))}
                  className="btn-success w-full mt-3"
                >
                  Settle — ₹{grandTotal.toLocaleString()}
                </button>
              </div>
            </div>
          ) : (
            /* Order View */
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Cart Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--canvas-border)' }}>
                  <div>
                    <span className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                      {selectedTable?.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {selectedTable?.status === 'occupied' ? `${cartItems.length} items` : 'No active order'}
                    </span>
                  </div>
                  {cartItems.length > 0 && (
                    <button onClick={handleSendToKitchen} className="btn-ghost text-[10px] flex items-center gap-1.5">
                      🔥 Send to Kitchen
                    </button>
                  )}
                </div>

                {/* Customer Name */}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="glass-input w-full px-3 py-2 text-xs"
                  />
                </div>

                {/* Cart Items */}
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      No items yet.<br />Click items from the menu grid to add.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {cartItems.map(item => (
                      <div key={item.menuItemId} className="flex items-center justify-between group p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-xs font-medium block truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQty(item.menuItemId, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>−</button>
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item.menuItemId, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>+</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button onClick={() => removeItem(item.menuItemId)}
                            className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                            style={{ color: 'var(--accent-crimson)' }}>
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Totals + Actions */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>GST (5%)</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-sm pt-2 border-t" style={{ borderColor: 'var(--canvas-border)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>TOTAL</span>
                    <span className="font-mono" style={{ color: 'var(--accent-sapphire)' }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setBillingStep('settle')}
                  disabled={cartItems.length === 0}
                  className="btn-primary w-full"
                >
                  Generate Bill — ₹{grandTotal.toLocaleString()}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline SVG Icons ─── */

function SearchIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
}

function TrashIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
}

function ReceiptLineIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>;
}

function CheckmarkIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

function PrinterIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}
