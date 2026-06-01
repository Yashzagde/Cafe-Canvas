'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/utils/supabase';

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const THEME_OPTIONS = ['light', 'dark', 'custom'] as const;

export default function StorefrontPage() {
  const [config, setConfig] = useState({
    theme: 'dark' as 'light' | 'dark' | 'custom',
    primary_color: '#0f0f13',
    accent_color: '#4d7cfe',
    font_heading: 'Sora',
    font_body: 'DM Sans',
    banner_text: '',
    show_prices: true,
    allow_orders: false,
    hero_image_url: '',
  });

  const [previewUrl, setPreviewUrl] = useState('https://demo.cafecanvas.bar');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load storefront config from Supabase
  const loadConfig = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('storefront_configs')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .single();

    if (data) {
      setConfig({
        theme: data.theme || 'dark',
        primary_color: data.primary_color || '#0f0f13',
        accent_color: data.accent_color || '#4d7cfe',
        font_heading: data.font_heading || 'Sora',
        font_body: data.font_body || 'DM Sans',
        banner_text: data.banner_text || '',
        show_prices: data.show_prices !== false,
        allow_orders: data.allow_orders === true,
        hero_image_url: data.hero_image_url || '',
      });
    }
    if (error && error.code !== 'PGRST116') {
      console.error('[Storefront] Load error:', error);
    }

    // Get tenant subdomain for preview URL
    const { data: tenant } = await supabase
      .from('tenants')
      .select('subdomain')
      .eq('id', TENANT_ID)
      .single();

    if (tenant?.subdomain) {
      setPreviewUrl(`https://${tenant.subdomain}.cafecanvas.bar`);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('storefront_configs')
      .upsert({
        tenant_id: TENANT_ID,
        ...config,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'tenant_id' });

    if (error) {
      console.error('[Storefront] Save error:', error);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Storefront Configuration</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Customize the customer-facing menu page at <span className="font-mono" style={{ color: 'var(--accent-sapphire)' }}>demo.cafecanvas.bar</span>
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Config Panel */}
        <div className="space-y-4">
          {/* Theme */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Theme & Colors</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map(t => (
                    <button
                      key={t}
                      onClick={() => setConfig({ ...config, theme: t })}
                      className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                      style={{
                        border: `1px solid ${config.theme === t ? 'var(--accent-sapphire)' : 'var(--canvas-border)'}`,
                        background: config.theme === t ? 'rgba(77,124,254,0.08)' : 'transparent',
                        color: config.theme === t ? 'var(--accent-sapphire)' : 'var(--text-secondary)',
                      }}
                    >
                      {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🎨'} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input type="text" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} className="glass-input flex-1 px-3 py-2 text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input type="text" value={config.accent_color} onChange={e => setConfig({ ...config, accent_color: e.target.value })} className="glass-input flex-1 px-3 py-2 text-xs font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Typography</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Heading Font</label>
                <select value={config.font_heading} onChange={e => setConfig({ ...config, font_heading: e.target.value })} className="glass-input w-full px-3 py-2.5 text-xs">
                  <option value="Sora">Sora</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Body Font</label>
                <select value={config.font_body} onChange={e => setConfig({ ...config, font_body: e.target.value })} className="glass-input w-full px-3 py-2.5 text-xs">
                  <option value="DM Sans">DM Sans</option>
                  <option value="Inter">Inter</option>
                  <option value="Nunito">Nunito</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Content & Features</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Banner Text</label>
                <input type="text" value={config.banner_text} onChange={e => setConfig({ ...config, banner_text: e.target.value })} className="glass-input w-full px-3 py-2.5 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--canvas-border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Show Prices</span>
                  <button
                    onClick={() => setConfig({ ...config, show_prices: !config.show_prices })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{
                      background: config.show_prices ? 'var(--accent-emerald)' : 'var(--canvas-muted)',
                    }}
                  >
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{
                      left: config.show_prices ? '22px' : '2px',
                    }} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--canvas-border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Online Orders</span>
                  <button
                    onClick={() => setConfig({ ...config, allow_orders: !config.allow_orders })}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{
                      background: config.allow_orders ? 'var(--accent-emerald)' : 'var(--canvas-muted)',
                    }}
                  >
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{
                      left: config.allow_orders ? '22px' : '2px',
                    }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--canvas-border)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Live Preview</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{previewUrl}</span>
          </div>
          <div className="flex-1 min-h-[500px] flex items-center justify-center" style={{
            background: config.theme === 'dark' ? config.primary_color : '#fafaf7',
          }}>
            {/* Mockup Preview */}
            <div className="w-full max-w-sm p-6 space-y-5" style={{ fontFamily: config.font_body }}>
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3" style={{
                  background: `${config.accent_color}20`,
                  border: `1px solid ${config.accent_color}40`,
                }}>☕</div>
                <h3 style={{
                  fontFamily: config.font_heading,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: config.theme === 'dark' ? '#f0f0f7' : '#1a1a1a',
                  lineHeight: 1.2,
                }}>
                  AETHER Café
                </h3>
                <p style={{
                  fontSize: '11px',
                  color: config.theme === 'dark' ? '#8888aa' : '#777',
                  marginTop: '4px',
                }}>42 Bandra West, Mumbai</p>
              </div>

              {/* Banner */}
              {config.banner_text && (
                <div className="text-center py-2 px-4 rounded-xl text-[11px] font-medium" style={{
                  background: `${config.accent_color}15`,
                  color: config.accent_color,
                  border: `1px solid ${config.accent_color}25`,
                }}>
                  {config.banner_text}
                </div>
              )}

              {/* Sample Menu Items */}
              <div className="space-y-2">
                {[
                  { name: 'Classic Cappuccino', price: '₹290', desc: 'Double espresso, steamed milk' },
                  { name: 'Avocado Toast', price: '₹390', desc: 'Organic avocado on sourdough' },
                  { name: 'Cold Brew', price: '₹350', desc: '24hr slow-dripped single origin' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{
                    background: config.theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
                    border: `1px solid ${config.theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#eee'}`,
                  }}>
                    <div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: config.theme === 'dark' ? '#f0f0f7' : '#1a1a1a',
                        display: 'block',
                      }}>{item.name}</span>
                      <span style={{
                        fontSize: '10px',
                        color: config.theme === 'dark' ? '#8888aa' : '#999',
                        display: 'block',
                        marginTop: '2px',
                      }}>{item.desc}</span>
                    </div>
                    {config.show_prices && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: config.accent_color,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>{item.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
