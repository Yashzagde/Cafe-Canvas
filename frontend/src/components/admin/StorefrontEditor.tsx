'use client';

import { useState, useEffect } from 'react';
import { 
  getStorefrontConfigAction, 
  updateStorefrontConfigAction,
  publishStorefrontAction,
  updateTenantNameAction
} from '@/app/admin/actions/storefront.actions';
import { useStorefrontEditorStore } from '@/store/storefront-editor';
import { Layout, Palette, Phone, ShieldAlert, Monitor, Smartphone, Check, Sparkles, Link, Upload, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
    colors: ['#F9F5F0', '#8E3A7D', '#D4A873'],
    description: 'Parisian macaron display. Dusty mauve, gold leaf, and crème patissière elegance.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-24',
    name: 'Middle Eastern Souk',
    tier: 'Global Cuisines',
    colors: ['#F5EDE0', '#B8860B', '#1A3C34'],
    description: 'Spice market at golden hour. Saffron amber, deep cedar green, and hammered brass.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-25',
    name: 'Spanish Tapas',
    tier: 'Global Cuisines',
    colors: ['#FFF8F0', '#C0392B', '#F4A460'],
    description: 'Terracotta warmth and sangria red. Flamenco energy meets Andalusian sunsets.',
    fontHeading: 'Bodoni Moda'
  },
  {
    id: 'theme-26',
    name: 'Bengali Fish Curry',
    tier: 'Indian Regional',
    colors: ['#FFF9F0', '#D4930A', '#1A4B8C'],
    description: 'Mustard yellow and monsoon-blue clay. Kolkata lane-food energy on terracotta plates.',
    fontHeading: 'Tiro Devanagari Marathi'
  },
  {
    id: 'theme-27',
    name: 'Kerala Backwater',
    tier: 'Indian Regional',
    colors: ['#F0FDF4', '#0D6B3A', '#8B5E3C'],
    description: 'Houseboat at dawn. Coconut palm green, teakwood brown, and backwater mist.',
    fontHeading: 'Noto Serif Malayalam'
  },
  {
    id: 'theme-28',
    name: 'Goan Beach Shack',
    tier: 'Global Cuisines',
    colors: ['#F0FFFE', '#0E8A7D', '#E8A317'],
    description: 'Sun-bleached shoreline vibes. Teal sea, amber sunlight, and barefoot dining.',
    fontHeading: 'Pacifico'
  },
  {
    id: 'theme-29',
    name: 'Chettinad Spice',
    tier: 'Indian Regional',
    colors: ['#FAF0E6', '#8B2500', '#3E1607'],
    description: 'Athangudi tiles and pepper vine darkness. Deep terracotta and Karaikudi heritage.',
    fontHeading: 'Noto Serif Tamil'
  },
  {
    id: 'theme-30',
    name: 'Hyderabadi Nawabi',
    tier: 'Indian Regional',
    colors: ['#FAF5FF', '#6B21A8', '#C9A84C'],
    description: 'Charminar dusk. Royal purple, champagne gold, and Nizami pearl accents.',
    fontHeading: 'Amiri'
  },

  // 5. Modern & Trendy (theme-31 to theme-35)
  {
    id: 'theme-31',
    name: 'Neon Street Food',
    tier: 'Modern & Trendy',
    colors: ['#0A0A14', '#EC4899', '#06D6A0'],
    description: 'Cyberpunk midnight bazaar. Hot neon pink, electric mint, and holographic overlays.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-32',
    name: 'Y2K Retro Pop',
    tier: 'Modern & Trendy',
    colors: ['#FFF0F5', '#F43F5E', '#00B4D8'],
    description: 'Bubblegum millennium nostalgia. Chrome accents, glossy rose, and electric ocean.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-33',
    name: 'Botanical Garden',
    tier: 'Modern & Trendy',
    colors: ['#F0FDF4', '#166534', '#2D5016'],
    description: 'Living wall conservatory. Deep emerald, moss shadow, and pressed-fern textures.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-34',
    name: 'Industrial Craft',
    tier: 'Modern & Trendy',
    colors: ['#F0F2F5', '#64748B', '#E85D04'],
    description: 'Exposed brick and steel girders. Concrete grey, ember orange, and craft typography.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-35',
    name: 'Pastels Kawaii',
    tier: 'Modern & Trendy',
    colors: ['#FFF5F7', '#FF6B9D', '#7DD3FC'],
    description: 'Soft-serve dreamscape. Cotton candy rose, baby blue, and marshmallow rounded forms.',
    fontHeading: 'Poppins'
  },

  // 6. Seasonal & Festive (theme-37 to theme-43)
  {
    id: 'theme-37',
    name: 'Diwali Glow',
    tier: 'Seasonal & Festive',
    colors: ['#FFFCEB', '#D4930A', '#8B2500'],
    description: 'Festival of lights. Deep diya amber, rangoli vermillion, and sparkler gold halos.',
    fontHeading: 'Rozha One'
  },
  {
    id: 'theme-38',
    name: 'Holi Splash',
    tier: 'Seasonal & Festive',
    colors: ['#FEFAFF', '#D946EF', '#F59E0B'],
    description: 'Gulal explosion. Magenta, turmeric yellow, and peacock teal color-burst energy.',
    fontHeading: 'Baloo Paaji 2'
  },
  {
    id: 'theme-39',
    name: 'Christmas Cosy',
    tier: 'Seasonal & Festive',
    colors: ['#FDFBFB', '#166534', '#B91C1C'],
    description: 'Fireside warmth. Pine needle green, cranberry red, and cinnamon stick accents.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-40',
    name: 'Eid Crescent',
    tier: 'Seasonal & Festive',
    colors: ['#F5FBF7', '#047857', '#C9A84C'],
    description: 'Moonlit feast. Emerald green, crescent gold, and arabesque lantern patterns.',
    fontHeading: 'Amiri'
  },
  {
    id: 'theme-41',
    name: 'Monsoon Cafe',
    tier: 'Seasonal & Festive',
    colors: ['#EFF3F8', '#475569', '#2563EB'],
    description: 'Petrichor season. Raincloud slate, electric puddle-splash blue, and misted glass.',
    fontHeading: 'Nunito'
  },
  {
    id: 'theme-42',
    name: 'Summer Burst',
    tier: 'Seasonal & Festive',
    colors: ['#FFFBEB', '#EA580C', '#F59E0B'],
    description: 'Mango-season energy. Citrus orange, lemonade yellow, and sugarcane green details.',
    fontHeading: 'Bebas Neue'
  },
  {
    id: 'theme-43',
    name: 'Valentine Blush',
    tier: 'Seasonal & Festive',
    colors: ['#FFF5F5', '#9F1239', '#FDA4AF'],
    description: 'Rose-petal romance. Deep burgundy, blush pink, and champagne-fizz sparkle.',
    fontHeading: 'Cormorant Garamond'
  },

  // 7. Specialized Displays (theme-36, theme-44 to theme-52)
  {
    id: 'theme-36',
    name: 'Bakehouse Warm',
    tier: 'Specialized Displays',
    colors: ['#FBF7F4', '#C4714A', '#A13670'],
    description: 'Fresh-from-the-oven glow. Sourdough crust brown, berry jam, and floury surfaces.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-44',
    name: 'New Year Noir',
    tier: 'Specialized Displays',
    colors: ['#080808', '#D4AF37', '#1C1C1C'],
    description: 'Midnight countdown. Jet black, champagne gold confetti, and obsidian glass surfaces.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-45',
    name: 'Dark Mode Espresso',
    tier: 'Specialized Displays',
    colors: ['#121212', '#EADCC8', '#5C3310'],
    description: 'Late-night caffeine. Pure OLED black, parchment cream, and fresh-pull espresso brown.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-46',
    name: 'High Contrast',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#000000', '#0000EE'],
    description: 'WCAG AAA accessibility mode. Maximum black-on-white contrast with blue action links.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-47',
    name: 'Print-Ready Menu',
    tier: 'Specialized Displays',
    colors: ['#FFFFFF', '#1A1A1A', '#6B7280'],
    description: 'Paper-optimized monochrome. Ink-black text, subtle grey dividers, zero color waste.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-48',
    name: 'Kiosk Display',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#0F172A', '#2563EB'],
    description: 'Touch-screen first. Large 48px tap targets, high contrast navy, and action blue CTAs.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-49',
    name: 'Delivery-First',
    tier: 'Specialized Displays',
    colors: ['#FFF7F3', '#EA580C', '#1E293B'],
    description: 'Swiggy/Zomato energy. Urgent orange, rapid-scroll layout, and one-tap basket flow.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-50',
    name: 'Catering Corporate',
    tier: 'Specialized Displays',
    colors: ['#F8FAFC', '#1E3A8A', '#64748B'],
    description: 'Board-room professional. Executive navy, polished slate, and quarterly-report precision.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-51',
    name: 'Wedding & Events',
    tier: 'Specialized Displays',
    colors: ['#FFFBFA', '#C29F6F', '#D4A0A0'],
    description: 'Mandap & marquee. Champagne gold, blush rose, and heirloom lace textures.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-52',
    name: 'Kids & Family',
    tier: 'Specialized Displays',
    colors: ['#FFFEF5', '#EC4899', '#3B82F6'],
    description: 'Crayon-bright playground. Bubblegum pink, sky blue, and hand-drawn doodle borders.',
    fontHeading: 'Poppins'
  }
];

export default function StorefrontEditor({ 
  tenantPublicId, 
  tenantPrivateId,
  tenantName,
  setTenantName
}: { 
  tenantPublicId: string; 
  tenantPrivateId: string;
  tenantName: string;
  setTenantName: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { config, setConfig, updateField, isDirty, clearDirty } = useStorefrontEditorStore();
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'social' | 'connection'>('branding');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [storeName, setStoreName] = useState(tenantName);
  const [isNameDirty, setIsNameDirty] = useState(false);

  const supabase = createClient();
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleUploadImageForField = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'hero_image_url' | 'hero_image_url_2' | 'hero_image_url_3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${fieldName}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      updateField(fieldName, publicUrl);
      alert('🎉 Image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImageForField = (fieldName: 'hero_image_url' | 'hero_image_url_2' | 'hero_image_url_3') => {
    updateField(fieldName, '');
  };

  useEffect(() => {
    setStoreName(tenantName);
  }, [tenantName]);

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
      if (isNameDirty) {
        const tenantUpdated = await updateTenantNameAction(storeName);
        if (tenantUpdated) {
          setTenantName(storeName);
          setIsNameDirty(false);
        }
      }
      const updated = await updateStorefrontConfigAction(config.id, config);
      if (updated) {
        setConfig(updated);
        clearDirty();
      }
    } catch (err: any) {
      console.error('Failed to save storefront configuration:', err);
      alert(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!config) return;
    setPublishing(true);
    try {
      // Save any pending changes first
      if (isDirty || isNameDirty) {
        if (isNameDirty) {
          const tenantUpdated = await updateTenantNameAction(storeName);
          if (tenantUpdated) {
            setTenantName(storeName);
            setIsNameDirty(false);
          }
        }
        const updated = await updateStorefrontConfigAction(config.id, config);
        if (updated) {
          setConfig(updated);
          clearDirty();
        }
      }
      const publishRes = await publishStorefrontAction('Published via Storefront Experience Editor');
      if (publishRes) {
        alert('🚀 Storefront changes published and live!');
      }
    } catch (err: any) {
      console.error('Failed to publish changes:', err);
      alert(err.message || 'Failed to publish changes');
    } finally {
      setPublishing(false);
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={(!isDirty && !isNameDirty) || saving || publishing}
              className="px-4 py-2 bg-[#f1f5f9] text-[#1e293b]/70 hover:text-[#1e293b] hover:bg-[#e2e8f0] font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none border border-[#e2e8f0]"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              className="px-4 py-2 bg-gradient-to-r from-[#16a34a] to-[#10b981] hover:opacity-95 text-white font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              {publishing ? 'Publishing...' : 'Publish Changes'}
            </button>
          </div>
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
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'connection' ? 'bg-[#f1f5f9] text-[#d97706]' : 'text-[#1e293b]/50 hover:text-[#1e293b]'
            }`}
          >
            <Link size={14} />
            <span>Storefront Link</span>
          </button>
        </div>

        {/* Edit fields based on active tab */}
        <div className="space-y-5">
          {activeTab === 'branding' && (
            <>
              {/* Storefront Business Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Storefront Business Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chai Point"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    setIsNameDirty(true);
                  }}
                  className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none focus:border-[#d97706]"
                />
              </div>

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
                    <option value="Noto Serif Malayalam">Noto Serif Malayalam</option>
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

              {/* Hero Background Image Slide 1 */}
              <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/40">
                <label className="text-xs font-black text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Background (Slide 1 - Welcome)
                </label>
                
                {config.hero_image_url ? (
                  <div className="p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                      <img src={config.hero_image_url} alt="Hero Slide 1 Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                        {config.hero_image_url.split('/').pop()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageForField('hero_image_url')}
                        className="text-[10px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-6 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImageForField(e, 'hero_image_url')}
                      disabled={uploadingField !== null}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      {uploadingField === 'hero_image_url' ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
                          <p className="text-xs font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#1e293b]/30" />
                          <div>
                            <p className="text-xs font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            <p className="text-[10px] text-[#1e293b]/40 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Hero Background Image Slide 2 */}
              <div className="space-y-2 pt-4 border-t border-[#e2e8f0]/40">
                <label className="text-xs font-black text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Background (Slide 2 - Specialities)
                </label>
                
                {config.hero_image_url_2 ? (
                  <div className="p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                      <img src={config.hero_image_url_2} alt="Hero Slide 2 Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                        {config.hero_image_url_2.split('/').pop()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageForField('hero_image_url_2')}
                        className="text-[10px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-6 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImageForField(e, 'hero_image_url_2')}
                      disabled={uploadingField !== null}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      {uploadingField === 'hero_image_url_2' ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
                          <p className="text-xs font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#1e293b]/30" />
                          <div>
                            <p className="text-xs font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            <p className="text-[10px] text-[#1e293b]/40 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Hero Background Image Slide 3 */}
              <div className="space-y-2 pt-4 border-t border-[#e2e8f0]/40">
                <label className="text-xs font-black text-[#1e293b]/70 tracking-wider uppercase block">
                  Hero Background (Slide 3 - Boutique)
                </label>
                
                {config.hero_image_url_3 ? (
                  <div className="p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e2e8f0] shrink-0 bg-stone-100 flex items-center justify-center">
                      <img src={config.hero_image_url_3} alt="Hero Slide 3 Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-[#1e293b]/80 truncate max-w-[200px]">
                        {config.hero_image_url_3.split('/').pop()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageForField('hero_image_url_3')}
                        className="text-[10px] font-extrabold text-red-650 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-[#e2e8f0] hover:border-[#d97706]/40 rounded-xl p-6 text-center transition-all bg-[#fdfcf7] hover:bg-[#FAF6F0]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImageForField(e, 'hero_image_url_3')}
                      disabled={uploadingField !== null}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      {uploadingField === 'hero_image_url_3' ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
                          <p className="text-xs font-bold text-[#1e293b]/70">Uploading to Supabase...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#1e293b]/30" />
                          <div>
                            <p className="text-xs font-bold text-[#1e293b]/70">Click or drag image to upload</p>
                            <p className="text-[10px] text-[#1e293b]/40 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
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

          {activeTab === 'connection' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#d97706] text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5">📲 Your Digital Storefront Link</p>
                <p className="opacity-90">This link is used by your customers to access your storefront menu, place table orders, view visit history, and contact your staff. Click "Copy Link" to copy it or "Open Link" to view the live menu.</p>
              </div>

              {/* Storefront Subdomain URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b]/70 tracking-wider uppercase block">
                  Storefront URL Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`http://${tenantPublicId || 'store'}.cafecanvas.bar`}
                    className="flex-1 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-xs font-mono select-all focus:outline-none text-slate-600"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://${tenantPublicId || 'store'}.cafecanvas.bar`);
                      alert('Storefront URL Link copied!');
                    }}
                    className="px-4 py-2.5 bg-[#1e293b] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              <div className="flex justify-end pr-1">
                <a
                  href={`http://${tenantPublicId || 'store'}.cafecanvas.bar`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-extrabold text-[#d97706] hover:underline flex items-center gap-1"
                >
                  Open Live Storefront ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Live Preview Frame */}
      <div className="flex flex-col gap-4 bg-[#fdfcf7] border border-[#e2e8f0]/50 rounded-3xl p-6 shadow-2xl relative min-h-[500px] justify-center items-center">
        {/* Mockup Top Header */}
        <div className="w-full flex items-center justify-between border-b border-[#e2e8f0]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#1e293b]/50">
            Live Mobile Storefront Preview
          </span>
        </div>

        {/* Live rendering container */}
        <div className="flex-1 w-full flex justify-center items-center py-4">
          <div
            className="bg-[#ffffff] border-8 border-stone-900 rounded-[38px] overflow-hidden transition-all shadow-2xl relative flex flex-col w-[300px] h-[520px] max-w-full select-none"
            style={{
              fontFamily: config.font_body
            }}
          >
            {/* Phone notch/camera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-stone-800 border border-stone-700/50"></div>
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 flex flex-col pt-4 overflow-y-auto scrollbar-none relative">
              {/* Nav Header */}
              <div
                className="px-4 py-3 flex items-center justify-between border-b border-[#e2e8f0]/30"
                style={{ backgroundColor: config.accent_color }}
              >
                <span className="font-extrabold text-xs font-display" style={{ color: config.primary_color }}>
                  {storeName || 'CafeCanvas'}
                </span>
                <div className="flex gap-1">
                  <span className="w-4 h-0.5 rounded bg-[#1e293b]/20"></span>
                  <span className="w-4 h-0.5 rounded bg-[#1e293b]/20"></span>
                </div>
              </div>

              {/* Hero Render */}
              <div
                className="p-6 text-center flex flex-col justify-center items-center gap-3 relative overflow-hidden"
                style={{
                  backgroundImage: config.hero_image_url ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${config.hero_image_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: config.accent_color,
                  minHeight: '140px'
                }}
              >
                <h3 className="text-base font-extrabold tracking-tight font-display leading-tight" style={{ fontFamily: config.font_heading, color: config.hero_image_url ? '#ffffff' : config.primary_color }}>
                  {config.hero_title || 'Welcome Title'}
                </h3>
                <p className="text-[10px] max-w-[200px] leading-relaxed" style={{ color: config.hero_image_url ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>
                  {config.hero_subtitle || 'Subtitle'}
                </p>
                <button
                  className="px-3 py-1.5 text-[9px] font-extrabold transition-all cursor-default"
                  style={{
                    backgroundColor: config.primary_color,
                    color: '#ffffff',
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
    </div>
  );
}
