'use client';

import { useState, useCallback } from 'react';
import { Receipt, Search, Grid2x2, List, Printer, CreditCard, Banknote, Smartphone, Check } from 'lucide-react';
import ReceiptPreviewModal from '@/components/billing/ReceiptPreviewModal';
import type { ReceiptData } from '@/components/billing/types';
import { DEFAULT_STORE_INFO } from '@/components/billing/types';

/* ─── Mock Menu Data (₹ INR) ─── */
const menuCategories = ['All', 'Coffee', 'Tea', 'Pastries', 'Mains'];
const menuItems = [
  { id: 'm1', name: 'Classic Cappuccino', price: 290, category: 'Coffee' },
  { id: 'm2', name: 'Specialty Cold Brew', price: 350, category: 'Coffee' },
  { id: 'm3', name: 'Matcha Latte Special', price: 320, category: 'Tea' },
  { id: 'm4', name: 'Avocado Sourdough Toast', price: 390, category: 'Mains' },
  { id: 'm5', name: 'Almond Butter Croissant', price: 240, category: 'Pastries' },
  { id: 'm6', name: 'Americano', price: 180, category: 'Coffee' },
  { id: 'm7', name: 'Eggs Benedict', price: 420, category: 'Mains' },
  { id: 'm8', name: 'Butter Croissant', price: 160, category: 'Pastries' },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function StaffPOS() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'm1', name: 'Classic Cappuccino', price: 290, qty: 2 },
    { id: 'm4', name: 'Avocado Sourdough Toast', price: 390, qty: 1 },
  ]);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [billCounter, setBillCounter] = useState(96);

  // ─── Cart Calculations ───
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstPercent = 5;
  const svcPercent = 5;
  const gstAmt = Math.round(subtotal * (gstPercent / 100));
  const svcAmt = Math.round(subtotal * (svcPercent / 100));
  const grandTotal = subtotal + gstAmt + svcAmt;
  const changeDue = cashReceived ? Math.max(0, Number(cashReceived) - grandTotal) : 0;

  // ─── Cart Actions ───
  const addToCart = useCallback((item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev =>
      prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0)
    );
  }, []);

  // ─── Payment Flow ───
  const handleCharge = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const processPayment = () => {
    if (payMethod === 'cash' && (!cashReceived || Number(cashReceived) < grandTotal)) {
      alert('Cash received must be ≥ total amount');
      return;
    }
    setBillCounter(prev => prev + 1);
    setPaymentSuccess(true);
    setShowPayment(false);
  };

  const handleNewOrder = () => {
    setCart([]);
    setPaymentSuccess(false);
    setShowPayment(false);
    setCashReceived('');
  };

  // ─── Receipt Data Builder ───
  const buildReceiptData = useCallback((): ReceiptData => {
    return {
      billId: `B-00${billCounter}`,
      storeName: DEFAULT_STORE_INFO.storeName,
      storeAddress: DEFAULT_STORE_INFO.storeAddress,
      storePhone: DEFAULT_STORE_INFO.storePhone,
      gstNumber: DEFAULT_STORE_INFO.gstNumber,
      fssaiNumber: DEFAULT_STORE_INFO.fssaiNumber,
      tableName: 'Table 02',
      tableSection: 'Indoor',
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        price: c.price,
        total: c.price * c.qty,
      })),
      customCharges: [],
      subtotal,
      gstAmount: gstAmt,
      gstPercent,
      serviceCharge: svcAmt,
      servicePercent: svcPercent,
      discountPercent: 0,
      discountAmount: 0,
      couponCode: '',
      grandTotal,
      paymentMethod: payMethod,
      cashReceived: payMethod === 'cash' ? Number(cashReceived) : undefined,
      changeDue: payMethod === 'cash' ? changeDue : undefined,
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }),
      footerMessage: DEFAULT_STORE_INFO.footerMessage,
    };
  }, [cart, subtotal, gstAmt, svcAmt, grandTotal, payMethod, cashReceived, changeDue, billCounter]);

  // ─── Filter Menu ───
  const filteredMenu = menuItems.filter(i => {
    const matchCat = activeCat === 'All' || i.category === activeCat;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="h-screen flex bg-zinc-100 text-zinc-900 overflow-hidden font-sans">

      {/* ═══ LEFT: MENU GRID ═══ */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4 bg-zinc-100 px-4 py-2 rounded-full flex-1 max-w-md">
            <Search className="text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200"><Grid2x2 size={20} /></button>
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100"><List size={20} /></button>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 flex gap-2 overflow-x-auto">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${
                activeCat === cat
                  ? 'bg-[#ff6b35] text-white shadow-md shadow-orange-500/20'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white border-2 border-zinc-100 hover:border-[#ff6b35] rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square transition-all hover:shadow-lg group"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 mb-3 flex items-center justify-center text-[#ff6b35] group-hover:scale-110 transition-transform">
                <Receipt size={24} />
              </div>
              <span className="font-bold text-sm mb-1">{item.name}</span>
              <span className="text-zinc-500 font-medium">₹{item.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT: CART & CHECKOUT ═══ */}
      <div className="w-96 bg-white border-l shadow-2xl z-10 flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
          <h2 className="text-xl font-black">Current Order</h2>
          <span className="text-sm font-bold text-zinc-500 bg-zinc-200 px-3 py-1 rounded-full">#{billCounter}</span>
        </div>

        {/* ─── PAYMENT SUCCESS STATE ─── */}
        {paymentSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
              <Check size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-green-700 mb-2">Payment Successful!</h3>
            <p className="text-zinc-500 mb-1">Bill #{billCounter} · {payMethod.toUpperCase()}</p>
            <p className="text-4xl font-black text-zinc-900 my-4">₹{grandTotal.toLocaleString()}</p>
            {payMethod === 'cash' && changeDue > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-6">
                <span className="text-amber-700 font-bold">Change Due: ₹{changeDue.toLocaleString()}</span>
              </div>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowReceipt(true)}
                className="flex-1 bg-[#6366f1] hover:bg-[#5254cc] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Printer size={20} /> Print Receipt
              </button>
              <button
                onClick={handleNewOrder}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-4 rounded-2xl transition-colors"
              >
                New Order
              </button>
            </div>
          </div>
        ) : showPayment ? (
          /* ─── PAYMENT METHOD SELECTION ─── */
          <div className="flex-1 flex flex-col p-6">
            <h3 className="text-lg font-black mb-6">Select Payment Method</h3>
            <div className="flex gap-3 mb-6">
              {([
                { method: 'cash' as const, icon: <Banknote size={20} />, label: 'Cash' },
                { method: 'card' as const, icon: <CreditCard size={20} />, label: 'Card' },
                { method: 'upi' as const, icon: <Smartphone size={20} />, label: 'UPI' },
              ]).map(pm => (
                <button
                  key={pm.method}
                  onClick={() => setPayMethod(pm.method)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-bold transition-all ${
                    payMethod === pm.method
                      ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                      : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  {pm.icon}
                  {pm.label}
                </button>
              ))}
            </div>

            {payMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-zinc-500 mb-2">Cash Received (₹)</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-zinc-200 focus:border-[#ff6b35] rounded-xl px-4 py-3 text-2xl font-bold text-center outline-none transition-colors"
                />
                {cashReceived && Number(cashReceived) >= grandTotal && (
                  <div className="text-center mt-3 text-green-600 font-bold">
                    Change: ₹{(Number(cashReceived) - grandTotal).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto flex gap-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-4 rounded-2xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={processPayment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        ) : (
          /* ─── CART ITEMS ─── */
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <Receipt size={40} className="mb-3 opacity-30" />
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm">Tap a menu item to add</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex-1">
                      <div className="font-bold">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold flex items-center justify-center transition-colors"
                        >
                          −
                        </button>
                        <span className="font-bold text-sm min-w-[20px] text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-lg">₹{(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            {/* Summary & Charge */}
            <div className="p-6 bg-zinc-50 border-t">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>GST ({gstPercent}%)</span>
                  <span>₹{gstAmt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Service ({svcPercent}%)</span>
                  <span>₹{svcAmt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-2xl font-black mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCharge}
                disabled={cart.length === 0}
                className="w-full bg-[#ff6b35] hover:bg-[#e85b24] disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xl font-black py-5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Charge ₹{grandTotal.toLocaleString()}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ═══ RECEIPT PREVIEW MODAL ═══ */}
      <ReceiptPreviewModal
        show={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={buildReceiptData()}
      />
    </div>
  );
}
