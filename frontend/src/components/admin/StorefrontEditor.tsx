'use client';

import { useState, useEffect } from 'react';
import { getStorefrontConfigAction, updateStorefrontConfigAction } from '@/app/admin/actions/storefront.actions';
import { useStorefrontEditorStore } from '@/store/storefront-editor';
import { Layout, Palette, Phone, ShieldAlert, Monitor, Smartphone, Check, Sparkles } from 'lucide-react';

const PRESETS = [
  { name: 'Classic Cream', primary: '#d97706', accent: '#fdfcf7' },
  { name: 'Ocean Breeze', primary: '#0284c7', accent: '#f0f9ff' },
  { name: 'Mint Sage', primary: '#16a34a', accent: '#f0fdf4' },
  { name: 'Corporate Indigo', primary: '#4f46e5', accent: '#e0e7ff' },
  { name: 'Luxury Gold', primary: '#ca8a04', accent: '#fef9c3' },
  { name: 'Rose Clean', primary: '#db2777', accent: '#fdf2f8' }
];

export default function StorefrontEditor() {
  const { config, setConfig, updateField, isDirty, clearDirty } = useStorefrontEditorStore();
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'social'>('branding');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    try {
      const data = await getStorefrontConfigAction();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load storefront configuration:', err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await updateStorefrontConfigAction(config.id, config);
      if (updated) {
        setConfig(updated);
        clearDirty();
      }
    } catch (err) {
      console.error('Failed to save storefront configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    updateField('primary_color', preset.primary);
    updateField('accent_color', preset.accent);
    updateField('theme_preset', preset.name);
  };

  if (!config) {
    return (
      <div className="py-8 text-center text-[#1e293b]/40">
        <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-[#1e293b] animate-fade-in">
      {/* Settings Form */}
      <div className="space-y-6 bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-xl h-fit">
        <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
          <div>
            <h2 className="text-lg font-extrabold font-display">Storefront Experience Editor</h2>
            <p className="text-xs text-[#1e293b]/50">Modify client site themes, branding, and layouts.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-4 py-2 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-[#ffffff] font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0]/30 pb-2">
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'branding' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Palette size={14} />
            <span>Theme & Colors</span>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'hero' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Layout size={14} />
            <span>Hero Header</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'social' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Phone size={14} />
            <span>Integrations</span>
          </button>
        </div>

        {/* Edit fields based on active tab */}
        <div className="space-y-5">
          {activeTab === 'branding' && (
            <>
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Quick Design Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESETS.map((p) => {
                    const isSelected = config.theme_preset === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => applyPreset(p)}
                        className={`p-3 bg-[#f1f5f9] border rounded-2xl flex flex-col gap-2 items-start text-left cursor-pointer transition-all ${
                          isSelected ? 'border-[#d97706]' : 'border-[#e2e8f0] hover:border-[#e2e8f0]/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primary }}></div>
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.accent }}></div>
                          {isSelected && <Check size={10} className="text-[#d97706] ml-auto" />}
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wide uppercase text-[#1e293b]/60">
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Swatches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Primary Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="flex-1 px-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] uppercase text-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Accent/Background Dark
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={config.accent_color}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="flex-1 px-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706] uppercase text-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fonts selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Heading Typography
                  </label>
                  <select
                    value={config.font_heading}
                    onChange={(e) => updateField('font_heading', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  >
                    <option value="Outfit">Outfit (Recommended)</option>
                    <option value="Playfair Display">Playfair Serif</option>
                    <option value="Inter">Inter Sans</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                    Body Text Typography
                  </label>
                  <select
                    value={config.font_body}
                    onChange={(e) => updateField('font_body', e.target.value)}
                    className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  >
                    <option value="Inter">Inter (Recommended)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hero' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Welcome Title
                </label>
                <input
                  type="text"
                  value={config.hero_title || 'Indulge in Artful Brews'}
                  onChange={(e) => updateField('hero_title', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Subtitle
                </label>
                <textarea
                  value={config.hero_subtitle || 'Taste the single-origin specialty blends crafted by master baristas.'}
                  onChange={(e) => updateField('hero_subtitle', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Background Image Link
                </label>
                <input
                  type="text"
                  value={config.hero_image_url || ''}
                  onChange={(e) => updateField('hero_image_url', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>
            </>
          )}

          {activeTab === 'social' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Google Place ID (Reviews Display)
                </label>
                <input
                  type="text"
                  value={config.google_place_id || ''}
                  onChange={(e) => updateField('google_place_id', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Instagram Handle (Feed Integration)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1e293b]/40">@</span>
                  <input
                    type="text"
                    value={config.instagram_handle || ''}
                    onChange={(e) => updateField('instagram_handle', e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visual Live Preview Frame */}
      <div className="flex flex-col gap-4 bg-[#fdfcf7] border border-[#e2e8f0]/50 rounded-3xl p-6 shadow-2xl relative min-h-[500px]">
        {/* Device toggle toolbar */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <div className="flex items-center gap-1 bg-[#ffffff] p-1 border border-[#e2e8f0] rounded-xl">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                previewMode === 'desktop' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                previewMode === 'mobile' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>

        {/* Live rendering container */}
        <div className="flex-1 flex justify-center items-center overflow-hidden">
          <div
            className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl overflow-hidden transition-all shadow-inner relative flex flex-col"
            style={{
              width: previewMode === 'mobile' ? '320px' : '100%',
              height: previewMode === 'mobile' ? '500px' : '100%',
              fontFamily: config.font_body
            }}
          >
            {/* Nav Header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b border-[#e2e8f0]/30"
              style={{ backgroundColor: config.accent_color }}
            >
              <span className="font-extrabold text-xs font-display" style={{ color: config.primary_color }}>
                CafeCanvas
              </span>
              <div className="flex gap-2">
                <span className="w-6 h-1 rounded bg-[#1e293b]/20"></span>
                <span className="w-6 h-1 rounded bg-[#1e293b]/20"></span>
              </div>
            </div>

            {/* Hero Render */}
            <div
              className="p-6 text-center flex flex-col justify-center items-center gap-3 relative overflow-hidden"
              style={{
                backgroundImage: config.hero_image_url ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${config.hero_image_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: config.accent_color,
                minHeight: '140px'
              }}
            >
              <h3 className="text-base font-extrabold tracking-tight font-display leading-tight" style={{ fontFamily: config.font_heading }}>
                {config.hero_title || 'Welcome Title'}
              </h3>
              <p className="text-[10px] text-[#1e293b]/70 max-w-[200px] leading-relaxed">
                {config.hero_subtitle || 'Subtitle'}
              </p>
              <button
                className="px-3 py-1.5 text-[9px] font-extrabold transition-all"
                style={{
                  backgroundColor: config.primary_color,
                  color: config.accent_color === '#ffffff' ? '#000000' : '#ffffff',
                  borderRadius: '12px'
                }}
              >
                View Menu
              </button>
            </div>

            {/* Menu Sections Preview */}
            <div className="p-4 flex-1 space-y-4">
              <span className="text-[10px] font-extrabold text-[#1e293b]/40 uppercase tracking-widest block">
                Featured Categories
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0]/50 rounded-2xl flex flex-col gap-1 items-center">
                  <div className="w-6 h-6 rounded-full bg-[#d97706]/20 flex items-center justify-center">
                    <Sparkles size={12} className="text-[#d97706]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1e293b]/80 mt-1">Coffee</span>
                </div>
                <div className="p-3 bg-[#f1f5f9] border border-[#e2e8f0]/50 rounded-2xl flex flex-col gap-1 items-center">
                  <div className="w-6 h-6 rounded-full bg-[#d97706]/20 flex items-center justify-center">
                    <Sparkles size={12} className="text-[#d97706]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1e293b]/80 mt-1">Snacks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
