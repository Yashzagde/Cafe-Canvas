'use client';

import React, { useState } from 'react';

export default function BillingPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>('4');
  const [extraServiceCharge, setExtraServiceCharge] = useState<boolean>(true);
  const [billStatus, setBillStatus] = useState<string | null>(null);

  const handleCheckout = (method: string) => {
    setBillStatus(`Success: Table ${selectedTable} marked as vacated. Payment: ${method.toUpperCase()}`);
    setTimeout(() => setBillStatus(null), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Billing Dashboard</h2>
        <p className="text-sm text-neutral-400 mt-1">Review active tables, generate thermal invoices, and collect payments.</p>
      </div>

      {billStatus && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-bold animate-pulse">
          {billStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area: Table Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-4">Floor Tables Status</span>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: '1', name: 'Table 01', status: 'available', size: 2 },
                { id: '2', name: 'Table 02', status: 'cleaning', size: 4 },
                { id: '3', name: 'Table 03', status: 'reserved', size: 2 },
                { id: '4', name: 'Table 04', status: 'occupied', size: 6, bill: 1450 },
                { id: '5', name: 'Table 05', status: 'available', size: 2 },
                { id: '6', name: 'Table 06', status: 'occupied', size: 4, bill: 890 },
                { id: '7', name: 'Table 07', status: 'occupied', size: 2, bill: 320 },
                { id: '8', name: 'Table 08', status: 'available', size: 4 },
              ].map(tbl => (
                <button
                  key={tbl.id}
                  onClick={() => tbl.status === 'occupied' && setSelectedTable(tbl.id)}
                  className={`p-4 rounded-xl border flex flex-col justify-between text-left h-28 transition ${selectedTable === tbl.id ? 'bg-accent-indigo/10 border-accent-indigo' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-bold text-white">{tbl.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${tbl.status === 'available' ? 'bg-accent-emerald' : tbl.status === 'occupied' ? 'bg-accent-rose animate-pulse' : tbl.status === 'cleaning' ? 'bg-accent-amber' : 'bg-neutral-500'}`}></span>
                  </div>
                  <div>
                    {tbl.bill ? (
                      <span className="font-display font-extrabold text-sm text-white block">₹{tbl.bill}</span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 block">Vacant ({tbl.size} pax)</span>
                    )}
                    <span className="text-[9px] uppercase font-semibold text-neutral-400 mt-1 block">{tbl.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Checkout Form & Receipt */}
        <div className="glass-card p-6 flex flex-col justify-between">
          {selectedTable ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Receipt Summary */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-sm font-bold text-white block">Table Checkout Summary</span>
                    <span className="text-xs text-neutral-400">Reviewing Table 0{selectedTable}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTable(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Classic Cappuccino (x2)</span>
                    <span className="text-white">₹580</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Avocado Sourdough (x2)</span>
                    <span className="text-white">₹780</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Chocolate Truffle Pastry</span>
                    <span className="text-white">₹90</span>
                  </div>
                </div>
              </div>

              {/* Extra charge adjustment */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300">Add Service Charge (5%)</label>
                  <input 
                    type="checkbox" 
                    checked={extraServiceCharge} 
                    onChange={(e) => setExtraServiceCharge(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-accent-indigo focus:ring-accent-indigo"
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-white">₹1,450</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">CGST + SGST (5%)</span>
                    <span className="text-white">₹72.50</span>
                  </div>
                  {extraServiceCharge && (
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Service Charge (5%)</span>
                      <span className="text-white">₹72.50</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display font-extrabold text-sm border-t border-border/30 pt-2 text-white">
                    <span>GRAND TOTAL</span>
                    <span>₹{extraServiceCharge ? '1,595.00' : '1,522.50'}</span>
                  </div>
                </div>
              </div>

              {/* Quick payment collection actions */}
              <div className="pt-6 space-y-3">
                <button 
                  onClick={() => handleCheckout('cash')}
                  className="w-full py-3 bg-accent-emerald hover:bg-accent-emerald/90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-emerald/20"
                >
                  Pay via Cash / UPI
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleCheckout('card')}
                    className="py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-[10px] font-bold transition"
                  >
                    Pay via Card
                  </button>
                  <a 
                    href="/api/store-admin/billing/bill/mock-id/print" 
                    target="_blank"
                    className="py-2.5 bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo rounded-lg text-[10px] font-bold transition text-center flex items-center justify-center"
                  >
                    Print Thermal Bill
                  </a>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 h-64 text-neutral-500 text-xs font-bold text-center">
              Select an occupied table<br />to generate checkout invoices.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
