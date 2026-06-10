'use client';

import { useState, useEffect } from 'react';
import { getStorefrontConfigAction, updateStorefrontConfigAction } from '@/app/admin/actions/storefront.actions';
import { useStorefrontEditorStore } from '@/store/storefront-editor';
import { Layout, Palette, Phone, ShieldAlert, Monitor, Smartphone, Check, Sparkles } from 'lucide-react';

interface StoreTheme {
  id: string
  name: string
  tier: string
  colors: string[]
  description: string
  fontHeading: string
}

const PRESETS: StoreTheme[] = [
  // 1. Premium & Luxury (theme-01 to theme-03)
  {
    id: 'theme-01',
    name: 'Liquid Glass Premium',
    tier: 'Premium & Luxury',
    colors: ['#0A0A1A', '#D4AF37', '#FF6B35'],
    description: 'Frosted glassmorphism on deep navy with elegant gold and ember accents.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-02',
    name: 'Liquid Glass Basic',
    tier: 'Premium & Luxury',
    colors: ['#F8F9FA', '#FF6B35', '#1A1A2E'],
    description: 'Clean transparent design on light with warm orange energy.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-03',
    name: 'Onyx Luxury Dark',
    tier: 'Premium & Luxury',
    colors: ['#0D0D0D', '#C9A84C', '#1C1C1C'],
    description: 'Absolute black with champagne gold. Pure material darkness, chef table aesthetic.',
    fontHeading: 'Playfair Display'
  },

  // 2. Cafe & Roastery (theme-04 to theme-07)
  {
    id: 'theme-04',
    name: 'Classic Cafe Brown',
    tier: 'Cafe & Roastery',
    colors: ['#FFF3E0', '#D2691E', '#3D1C02'],
    description: 'Warm nostalgia. Kraft paper, espresso, and chocolate accents.',
    fontHeading: 'Abril Fatface'
  },
  {
    id: 'theme-05',
    name: 'Artisan Roastery',
    tier: 'Cafe & Roastery',
    colors: ['#1B1B1B', '#F97316', '#E8DCC8'],
    description: 'Dark industrial concrete walls and warm parchment coffee bags.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-06',
    name: 'Chocolate Indulgence',
    tier: 'Cafe & Roastery',
    colors: ['#3B1D0E', '#D2A679', '#E91E8C'],
    description: 'Deep chocolate luxury meets playful pink with drip details.',
    fontHeading: 'Bodoni Moda'
  },
  {
    id: 'theme-07',
    name: 'Matcha Zen',
    tier: 'Cafe & Roastery',
    colors: ['#F5F0E8', '#4A7C24', '#C8A882'],
    description: 'Wabi-sabi restraint, washi paper and matcha green accents.',
    fontHeading: 'Noto Serif JP'
  },

  // 3. Indian Regional Heritage (theme-08 to theme-13, theme-26, theme-27, theme-29, theme-30)
  {
    id: 'theme-08',
    name: 'Rajasthani Royal',
    tier: 'Indian Regional',
    colors: ['#FFF8DC', '#D4AF37', '#8B0000'],
    description: 'Rajputana palace vibes. Gold jali screens and deep maroon details.',
    fontHeading: 'Rozha One'
  },
  {
    id: 'theme-09',
    name: 'Maharashtrian Heritage',
    tier: 'Indian Regional',
    colors: ['#FFF5EE', '#FF8C00', '#006400'],
    description: 'Vibrant street energy of Maharashtra. Saffron marigold and green accents.',
    fontHeading: 'Tiro Devanagari Marathi'
  },
  {
    id: 'theme-10',
    name: 'Mughal Garden',
    tier: 'Indian Regional',
    colors: ['#F5F0E0', '#D4AF37', '#1B4332'],
    description: 'Emperor garden at dusk. Garden green, ivory, and gold arabesque.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-11',
    name: 'Punjabi Dhaba Bold',
    tier: 'Indian Regional',
    colors: ['#FFFACD', '#FF4500', '#FFD700'],
    description: 'Grand Trunk Road energy. Bold truck-art orange-red and yellow colors.',
    fontHeading: 'Baloo Paaji 2'
  },
  {
    id: 'theme-12',
    name: 'South Indian Temple',
    tier: 'Indian Regional',
    colors: ['#FFFDD0', '#8B0000', '#B8860B'],
    description: 'Sandalwood cream and temple vermillion red with gold highlights.',
    fontHeading: 'Noto Serif Tamil'
  },
  {
    id: 'theme-13',
    name: 'Gujarat Mithai Gold',
    tier: 'Indian Regional',
    colors: ['#FFFAF0', '#FF8C00', '#FFD700'],
    description: 'Navratri and Diwali celebration. Festive orange and sweet yellow colors.',
    fontHeading: 'Noto Serif Gujarati'
  },
  {
    id: 'theme-26',
    name: 'Bengali Fish Curry',
    tier: 'Indian Regional',
    colors: ['#FAF8F5', '#D97706', '#1E3A8A'],
    description: 'Deep mustard yellow and sea blue accents.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-27',
    name: 'Kerala Backwater',
    tier: 'Indian Regional',
    colors: ['#F0FDF4', '#166534', '#15803D'],
    description: 'Palm white background with tropical green accents.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-29',
    name: 'Chettinad Spice',
    tier: 'Indian Regional',
    colors: ['#FAF5F0', '#9A3412', '#451A03'],
    description: 'Terracotta and dark wood textures for traditional dining.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-30',
    name: 'Hyderabadi Nawabi',
    tier: 'Indian Regional',
    colors: ['#FAF8FF', '#7C3AED', '#5B21B6'],
    description: 'Royal purple and pearl white accents.',
    fontHeading: 'Outfit'
  },

  // 4. Global Cuisines (theme-14 to theme-25, theme-28)
  {
    id: 'theme-14',
    name: 'Kashmiri Winter',
    tier: 'Global Cuisines',
    colors: ['#F5F5F5', '#1E3A5F', '#DAA520'],
    description: 'Snow and saffron. Deep blue Kashmiri winter sky and silver details.',
    fontHeading: 'Noto Nastaliq Urdu'
  },
  {
    id: 'theme-15',
    name: 'Italian Trattoria',
    tier: 'Global Cuisines',
    colors: ['#F5F0DC', '#CE2B37', '#009246'],
    description: 'Napoli parchment and Italian tricolore. Olive and dried tomato colors.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-16',
    name: 'Chinese Dynasty Red',
    tier: 'Global Cuisines',
    colors: ['#FFF8DC', '#DC143C', '#FFD700'],
    description: 'Imperial palace dining. Crimson red, dragon clouds, and gold accents.',
    fontHeading: 'Noto Serif SC'
  },
  {
    id: 'theme-17',
    name: 'Japanese Sakura',
    tier: 'Global Cuisines',
    colors: ['#F5F0E0', '#FFB7C5', '#1C1C1C'],
    description: 'Cherry blossom season. Washi paper background and sakura pink accents.',
    fontHeading: 'Noto Serif JP'
  },
  {
    id: 'theme-18',
    name: 'Mediterranean Blue',
    tier: 'Global Cuisines',
    colors: ['#FFFFFF', '#1E90FF', '#F5DEB3'],
    description: 'Santorini whitewash and Aegean blue with sun-drenched meander patterns.',
    fontHeading: 'Philosopher'
  },
  {
    id: 'theme-19',
    name: 'Mexican Fiesta',
    tier: 'Global Cuisines',
    colors: ['#FFFACD', '#FF0000', '#FFD700'],
    description: 'Papel picado and street taco energy. Loud red and vibrant yellow.',
    fontHeading: 'Pacifico'
  },
  {
    id: 'theme-20',
    name: 'Thai Tropical',
    tier: 'Global Cuisines',
    colors: ['#FAFFFE', '#006400', '#FFD700'],
    description: 'Lemongrass and tropical leaves. Deep forest green and gold details.',
    fontHeading: 'Mitr'
  },
  {
    id: 'theme-21',
    name: 'American Diner Chrome',
    tier: 'Global Cuisines',
    colors: ['#1C1C1C', '#FF0000', '#C0C0C0'],
    description: 'Checkerboard tiles, retro red neon lights, and chrome metal accents.',
    fontHeading: 'Bebas Neue'
  },
  {
    id: 'theme-22',
    name: 'Korean Bento',
    tier: 'Global Cuisines',
    colors: ['#FFFFFF', '#E8002D', '#003478'],
    description: 'Taegukgi flag-inspired palette of bold red, navy, and hanji paper beige.',
    fontHeading: 'Noto Sans KR'
  },
  {
    id: 'theme-23',
    name: 'French Patisserie',
    tier: 'Global Cuisines',
    colors: ['#FAF5FF', '#8E44AD', '#34495E'],
    description: 'Lavender base and royal blue accents for elegant patisseries.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-24',
    name: 'Middle Eastern Souk',
    tier: 'Global Cuisines',
    colors: ['#FFFDF5', '#D97706', '#2D3748'],
    description: 'Rich amber gold and charcoal tones.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-25',
    name: 'Spanish Tapas',
    tier: 'Global Cuisines',
    colors: ['#FFF9F5', '#EA580C', '#7C2D12'],
    description: 'Warm ochre and rust red accents.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-28',
    name: 'Goan Beach Shack',
    tier: 'Global Cuisines',
    colors: ['#F0FDFD', '#0D9488', '#D97706'],
    description: 'Cool turquoise and beach sand colors.',
    fontHeading: 'Outfit'
  },

  // 5. Modern & Trendy (theme-31 to theme-35)
  {
    id: 'theme-31',
    name: 'Neon Street Food',
    tier: 'Modern & Trendy',
    colors: ['#0D0D1A', '#EC4899', '#06B6D4'],
    description: 'Cyberpunk dark mode with neon pink and cyan glows.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-32',
    name: 'Y2K Retro Pop',
    tier: 'Modern & Trendy',
    colors: ['#FFF1F2', '#F43F5E', '#0EA5E9'],
    description: 'High-energy Y2K aesthetic with pastel pink and neon blue.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-33',
    name: 'Botanical Garden',
    tier: 'Modern & Trendy',
    colors: ['#F0FDF4', '#15803D', '#14532D'],
    description: 'Lush forest greens and leaf textures for plant cafes.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-34',
    name: 'Industrial Craft',
    tier: 'Modern & Trendy',
    colors: ['#F1F5F9', '#64748B', '#EA580C'],
    description: 'Concrete grey and rust orange for modern loft cafes.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-35',
    name: 'Pastels Kawaii',
    tier: 'Modern & Trendy',
    colors: ['#FFF5F5', '#FF8787', '#A5F3FC'],
    description: 'Soft baby pink and mint green for bubble tea shops.',
    fontHeading: 'Poppins'
  },

  // 6. Seasonal & Festive (theme-37 to theme-43)
  {
    id: 'theme-37',
    name: 'Diwali Glow',
    tier: 'Seasonal & Festive',
    colors: ['#FFFDF0', '#D97706', '#7C2D12'],
    description: 'Golden clay lamp colors and festive lights.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-38',
    name: 'Holi Splash',
    tier: 'Seasonal & Festive',
    colors: ['#FCFAFF', '#EC4899', '#EAB308'],
    description: 'Energetic splash of magenta, yellow, and green.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-39',
    name: 'Christmas Cosy',
    tier: 'Seasonal & Festive',
    colors: ['#FFFDFD', '#15803D', '#DC2626'],
    description: 'Pine green background and berry red highlights.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-40',
    name: 'Eid Crescent',
    tier: 'Seasonal & Festive',
    colors: ['#F4FBF7', '#047857', '#B39034'],
    description: 'Emerald green and golden crescent moon accents.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-41',
    name: 'Monsoon Cafe',
    tier: 'Seasonal & Festive',
    colors: ['#F0F4F8', '#475569', '#3B82F6'],
    description: 'Earthy rain blue and slate grey tones.',
    fontHeading: 'Nunito'
  },
  {
    id: 'theme-42',
    name: 'Summer Burst',
    tier: 'Seasonal & Festive',
    colors: ['#FFFBEB', '#F97316', '#EAB308'],
    description: 'Bright citrus orange and sunny yellow.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-43',
    name: 'Valentine Blush',
    tier: 'Seasonal & Festive',
    colors: ['#FFF5F5', '#BE123C', '#FDA4AF'],
    description: 'Blush pink and deep red tones for dessert cafes.',
    fontHeading: 'Poppins'
  },

  // 7. Specialized Displays (theme-36, theme-44 to theme-52)
  {
    id: 'theme-36',
    name: 'Bakehouse Warm',
    tier: 'Specialized Displays',
    colors: ['#FAF8F6', '#D97706', '#BE185D'],
    description: 'Warm, cozy colors perfect for family bakery houses and pastry shops.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-44',
    name: 'New Year Noir',
    tier: 'Specialized Displays',
    colors: ['#0A0A0A', '#C9A84C', '#1A1A1A'],
    description: 'Celebration theme with dark noir background and champagne gold.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-45',
    name: 'Dark Mode Espresso',
    tier: 'Specialized Displays',
    colors: ['#121212', '#FAF5F0', '#3E1F07'],
    description: 'Standard optimized dark mode with warm espresso accents.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-46',
    name: 'High Contrast',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#000000', '#0000EE'],
    description: 'Pure black and white with high-contrast blue for accessibility.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-47',
    name: 'Print-Ready Menu',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#1A1A1A', '#7F7F7F'],
    description: 'Clean monochrome layout optimized for physical paper printing.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-48',
    name: 'Kiosk Display',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#0F172A', '#3B82F6'],
    description: 'Large tap targets and clear contrast for digital self-service kiosks.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-49',
    name: 'Delivery-First',
    tier: 'Specialized Displays',
    colors: ['#FFF8F5', '#EA580C', '#1E293B'],
    description: 'App-first layout optimized for fast mobile deliveries.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-50',
    name: 'Catering Corporate',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#1E3A8A', '#475569'],
    description: 'Professional executive corporate blue and slate.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-51',
    name: 'Wedding & Events',
    tier: 'Specialized Displays',
    colors: ['#FFFBFB', '#C29F6F', '#E8A598'],
    description: 'Elegant champagne gold and rose for marriage lawns and event caterers.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-52',
    name: 'Kids & Family',
    tier: 'Specialized Displays',
    colors: ['#FFFDF5', '#EC4899', '#3B82F6'],
    description: 'Bright bubblegum pink and sky blue colors for family restaurants.',
    fontHeading: 'Poppins'
  }
];

export default function StorefrontEditor() {
  const { config, setConfig, updateField, isDirty, clearDirty } = useStorefrontEditorStore();
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'social'>('branding');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [themeCategory, setThemeCategory] = useState<string>('All');
  const categories = [
    'All',
    'Premium & Luxury',
    'Cafe & Roastery',
    'Indian Regional',
    'Global Cuisines',
    'Modern & Trendy',
    'Seasonal & Festive',
    'Specialized Displays'
  ];

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
    updateField('theme_id', preset.id);
    updateField('primary_color', preset.colors[0]);
    updateField('accent_color', preset.colors[1] || preset.colors[0]);
    updateField('font_heading', preset.fontHeading);
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
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Quick Design Presets
                </label>
                
                {/* Category Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-[#e2e8f0]/40 scrollbar-none">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setThemeCategory(category)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                        themeCategory === category
                          ? 'bg-[#d97706] text-[#ffffff] border-[#d97706] shadow-sm'
                          : 'bg-[#f1f5f9] text-[#1e293b]/60 border-[#e2e8f0] hover:border-[#d97706]/40 hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {PRESETS.filter(
                    (p) => themeCategory === 'All' || p.tier === themeCategory
                  ).map((p) => {
                    const isSelected = config.theme_id === p.id || config.theme_preset === p.name;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`p-3 bg-[#f1f5f9] border rounded-2xl flex flex-col gap-2 items-start text-left cursor-pointer transition-all ${
                          isSelected ? 'border-[#d97706] bg-[#d97706]/5' : 'border-[#e2e8f0] hover:border-[#e2e8f0]/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: p.colors[0] }} title={p.colors[0]}></div>
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: p.colors[1] || p.colors[0] }} title={p.colors[1]}></div>
                          {isSelected && <Check size={10} className="text-[#d97706] ml-auto" />}
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wide uppercase text-[#1e293b]/70 truncate w-full">
                          {p.name}
                        </span>
                        <span className="text-[8px] font-bold text-[#1e293b]/40 uppercase tracking-wider block">
                          {p.id}
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
                    <option value="Outfit">Outfit</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Inter">Inter</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Fraunces">Fraunces</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Abril Fatface">Abril Fatface</option>
                    <option value="Bodoni Moda">Bodoni Moda</option>
                    <option value="Noto Serif JP">Noto Serif JP</option>
                    <option value="Rozha One">Rozha One</option>
                    <option value="Tiro Devanagari Marathi">Tiro Devanagari Marathi</option>
                    <option value="Amiri">Amiri</option>
                    <option value="Baloo Paaji 2">Baloo Paaji 2</option>
                    <option value="Noto Serif Tamil">Noto Serif Tamil</option>
                    <option value="Noto Serif Gujarati">Noto Serif Gujarati</option>
                    <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu</option>
                    <option value="Noto Serif SC">Noto Serif SC</option>
                    <option value="Philosopher">Philosopher</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Mitr">Mitr</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Noto Sans KR">Noto Sans KR</option>
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
