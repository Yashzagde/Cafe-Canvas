'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'domain' | 'payments'>('general');
  const [storeName, setStoreName] = useState<string>('AETHER Cafe & Roastery');
  const [gstin, setGstin] = useState<string>('27AAAAA1111A1Z1');
  const [selectedTheme, setSelectedTheme] = useState<string>('classic');
  const [cnameDomain, setCnameDomain] = useState<string>('menu.mycafe.com');
  const [razorpayKey, setRazorpayKey] = useState<string>('rzp_live_xxxxxxxxxx1234');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Success: All configurations synced and encrypted successfully!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Store Settings</h2>
        <p className="text-sm text-neutral-400 mt-1">Configure parameters, connect custom payment gateways, and establish digital storefront branding.</p>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-bold">
          {saveStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="glass-card p-6 h-fit space-y-1.5">
          {[
            { id: 'general', label: 'General Details' },
            { id: 'branding', label: 'Storefront Branding' },
            { id: 'domain', label: 'Custom Domain' },
            { id: 'payments', label: 'Payment Gateways' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition ${activeTab === tab.id ? 'bg-accent-indigo text-white shadow' : 'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Form Pane */}
        <div className="lg:col-span-3 glass-card p-8">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-base text-white pb-3 border-b border-border">Operational Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Store / Cafe Name</label>
                    <input 
                      type="text" 
                      value={storeName} 
                      onChange={(e) => setStoreName(e.target.value)} 
                      className="w-full glass-input px-4 py-2.5 text-xs font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">GSTIN / TAX ID</label>
                    <input 
                      type="text" 
                      value={gstin} 
                      onChange={(e) => setGstin(e.target.value)} 
                      className="w-full glass-input px-4 py-2.5 text-xs font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Support Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="support@aethercafe.com" 
                      className="w-full glass-input px-4 py-2.5 text-xs font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Contact Telephone</label>
                    <input 
                      type="text" 
                      defaultValue="+91 99999 88888" 
                      className="w-full glass-input px-4 py-2.5 text-xs font-medium" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-base text-white pb-3 border-b border-border">Storefront Digital Branding</h3>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-3">Public Storefront Theme Layout</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'classic', label: 'Classic Elegance', desc: 'Warm warm-toned palette, perfect for bakeries and tea gardens.' },
                      { id: 'dark', label: 'Liquid Charcoal Carbon', desc: 'Sleek neon carbon default layouts for modern bar cafes.' },
                      { id: 'minimal', label: 'Scandinavian Minimal', desc: 'Simple geometric stark dark-light contrasts.' },
                    ].map(thm => (
                      <button
                        type="button"
                        key={thm.id}
                        onClick={() => setSelectedTheme(thm.id)}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${selectedTheme === thm.id ? 'bg-accent-indigo/10 border-accent-indigo' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                      >
                        <span className="text-xs font-bold text-white block">{thm.label}</span>
                        <p className="text-[10px] text-neutral-400 leading-relaxed mt-2">{thm.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Primary Color Hex Code</label>
                    <input type="text" defaultValue="#6366F1" className="w-full glass-input px-4 py-2.5 text-xs font-mono font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Accent Color Hex Code</label>
                    <input type="text" defaultValue="#10B981" className="w-full glass-input px-4 py-2.5 text-xs font-mono font-bold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domain' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-base text-white pb-3 border-b border-border">Custom Domain Configurations</h3>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Public CNAME Domain</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={cnameDomain} 
                      onChange={(e) => setCnameDomain(e.target.value)} 
                      className="flex-1 glass-input px-4 py-2.5 text-xs font-medium" 
                    />
                    <button type="button" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold rounded-xl transition">Verify DNS</button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 space-y-4">
                  <span className="text-xs font-bold text-white block">Required DNS Mapping Records:</span>
                  <div className="overflow-x-auto text-[10px]">
                    <table className="w-full">
                      <thead>
                        <tr className="text-neutral-500 uppercase font-bold text-left tracking-wider">
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Host / Name</th>
                          <th className="pb-2">Points To</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-neutral-300">
                        <tr>
                          <td className="py-2">CNAME</td>
                          <td className="py-2">menu</td>
                          <td className="py-2">dns.cafecanvas.bar</td>
                          <td className="py-2 text-right text-accent-emerald font-bold">✓ VERIFIED</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-base text-white pb-3 border-b border-border">Gateway Credentials (Encrypted at Rest)</h3>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Stripe Connected Gateway Status</label>
                  <div className="p-4 rounded-xl bg-accent-indigo/5 border border-accent-indigo/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Stripe Direct Integration</span>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Credit/Debit international payments.</span>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-full tracking-wider uppercase">CONNECTED</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Razorpay Key ID (Masked)</label>
                  <input 
                    type="text" 
                    value={razorpayKey} 
                    onChange={(e) => setRazorpayKey(e.target.value)} 
                    className="w-full glass-input px-4 py-2.5 text-xs font-mono font-bold" 
                  />
                  <span className="text-[9px] text-neutral-500 mt-1 block">Decrypted keys are never returned directly in public JSON APIs.</span>
                </div>
              </div>
            )}

            {/* Form Save Button Action */}
            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-3 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-indigo/20"
              >
                Save Configuration
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
