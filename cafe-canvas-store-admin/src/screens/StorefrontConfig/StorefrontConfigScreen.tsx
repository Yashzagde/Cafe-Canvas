import { useState, useEffect } from 'react'
import { Palette, Paintbrush, Globe, Image, Type, ExternalLink, Save, Eye, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Tabs } from '../../components/ui/Tabs'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import { useTenantStore } from '../../store/tenant.store'

type ConfigTab = 'branding' | 'themes' | 'homepage' | 'seo' | 'social'

interface StoreTheme {
  id: string
  name: string
  tier: string
  colors: string[]
  description: string
  fontHeading: string
}

const STORE_THEMES: StoreTheme[] = [
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

export function StorefrontConfigScreen() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('branding')
  const { tenant, storefrontConfig, updateTenant, updateStorefrontConfig } = useTenantStore()

  // Local theme state
  const [selectedTheme, setSelectedTheme] = useState('theme-01')
  const [themeCategory, setThemeCategory] = useState<string>('All')

  // Branding state
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#C4714A')
  const [fontFamily, setFontFamily] = useState('Nunito')
  const [tagline, setTagline] = useState('')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Sync state from store
  useEffect(() => {
    if (tenant) {
      setLogoUrl(tenant.logo_url || '')
    }
  }, [tenant])

  useEffect(() => {
    if (storefrontConfig) {
      setSelectedTheme(storefrontConfig.theme_id || 'theme-01')
      setAccentColor(storefrontConfig.accent_color || '#C4714A')
      setFontFamily(storefrontConfig.font_heading || 'Nunito')
      setTagline(storefrontConfig.banner_text || '')
    }
  }, [storefrontConfig])

  const tabs = [
    { id: 'branding', label: 'Branding', icon: <Paintbrush className="w-3.5 h-3.5" /> },
    { id: 'themes', label: 'Store Themes', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'homepage', label: 'Homepage', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'seo', label: 'SEO', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'social', label: 'Social Links', icon: <ExternalLink className="w-3.5 h-3.5" /> },
  ]

  const PRESET_COLORS = ['#C4714A', '#D4A843', '#4ECDC4', '#E74C3C', '#8E44AD', '#2C3E50', '#27AE60', '#F39C12']

  const handleSave = async () => {
    let hasError = false

    // Save Tenant Logo
    if (tenant && logoUrl !== (tenant.logo_url || '')) {
      const { error } = await updateTenant({ logo_url: logoUrl })
      if (error) {
        toast.error('Failed to save logo', error)
        hasError = true
      }
    }

    // Save Storefront Config
    const configUpdates = {
      theme_id: selectedTheme,
      accent_color: accentColor,
      font_heading: fontFamily,
      banner_text: tagline,
    }

    const { error } = await updateStorefrontConfig(configUpdates)
    if (error) {
      toast.error('Failed to save storefront configuration', error)
      hasError = true
    }

    if (!hasError) {
      toast.success('Settings saved', 'Storefront configuration updated successfully')
    }
  }

  return (
    <div className="space-y-6 select-none max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Storefront Configuration</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">Customize your public-facing storefront</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>Preview</Button>
          <Button size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as ConfigTab)} />

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Logo & Brand Colors" subtitle="Customize your visual identity" />
            <div className="space-y-4">
              <Input label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." icon={<Image className="w-4 h-4" />} />

              <div>
                <p className="text-xs font-bold text-canvas-brown uppercase tracking-wider mb-2">Accent Color</p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          'w-8 h-8 rounded-lg border-2 transition-all',
                          accentColor === color ? 'border-canvas-brown scale-110 shadow-md' : 'border-transparent hover:border-canvas-champagne'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono font-bold text-canvas-brown_mid">{accentColor}</span>
                </div>
              </div>

              <Select
                label="Font Family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                options={[
                  { value: 'Nunito', label: 'Nunito' },
                  { value: 'Inter', label: 'Inter' },
                  { value: 'Poppins', label: 'Poppins' },
                  { value: 'Playfair Display', label: 'Playfair Display' },
                  { value: 'Outfit', label: 'Outfit' },
                  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
                  { value: 'Fraunces', label: 'Fraunces' },
                  { value: 'Space Grotesk', label: 'Space Grotesk' },
                  { value: 'Abril Fatface', label: 'Abril Fatface' },
                  { value: 'Bodoni Moda', label: 'Bodoni Moda' },
                  { value: 'Noto Serif JP', label: 'Noto Serif JP' },
                  { value: 'Rozha One', label: 'Rozha One' },
                  { value: 'Tiro Devanagari Marathi', label: 'Tiro Devanagari Marathi' },
                  { value: 'Amiri', label: 'Amiri' },
                  { value: 'Baloo Paaji 2', label: 'Baloo Paaji 2' },
                  { value: 'Noto Serif Tamil', label: 'Noto Serif Tamil' },
                  { value: 'Noto Serif Malayalam', label: 'Noto Serif Malayalam' },
                  { value: 'Noto Serif Gujarati', label: 'Noto Serif Gujarati' },
                  { value: 'Noto Nastaliq Urdu', label: 'Noto Nastaliq Urdu' },
                  { value: 'Noto Serif SC', label: 'Noto Serif SC' },
                  { value: 'Philosopher', label: 'Philosopher' },
                  { value: 'Pacifico', label: 'Pacifico' },
                  { value: 'Mitr', label: 'Mitr' },
                  { value: 'Bebas Neue', label: 'Bebas Neue' },
                  { value: 'Noto Sans KR', label: 'Noto Sans KR' },
                ]}
              />
              <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Crafted with love, served with passion" />
            </div>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader title="Live Preview" />
            <div className="rounded-lg overflow-hidden border border-canvas-border" style={{ fontFamily }}>
              <div className="h-32 flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold">{tagline || 'Your Restaurant Name'}</h3>
                  <p className="text-sm opacity-80">{tagline || 'Your tagline here'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'homepage' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Hero Section" />
            <div className="space-y-4">
              <Input label="Hero Title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Welcome to our café" />
              <Input label="Hero Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Fresh food, warm ambiance" />
            </div>
          </Card>
          <Card>
            <CardHeader title="About Section" />
            <Textarea label="About Us" value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="Tell your story..." rows={5} />
          </Card>
        </div>
      )}

      {activeTab === 'seo' && (
        <Card>
          <CardHeader title="Search Engine Optimization" subtitle="How your storefront appears in search results" />
          <div className="space-y-4">
            <Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Your Café | Best Coffee in Town" hint={`${metaTitle.length}/60 characters`} />
            <Textarea label="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A cozy café serving..." rows={3} />
            <div className="p-4 rounded-lg bg-canvas-cream border border-canvas-border">
              <p className="text-xs font-bold text-canvas-teal mb-1">{metaTitle || 'Your Café Name'}</p>
              <p className="text-[10px] text-canvas-sage">https://your-cafe.cafecanvas.bar</p>
              <p className="text-[11px] text-canvas-brown_mid mt-1">{metaDescription || 'Your meta description will appear here...'}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'social' && (
        <Card>
          <CardHeader title="Social Media Links" subtitle="Connect your social profiles" />
          <div className="space-y-4">
            <Input label="Instagram" placeholder="@your_handle" />
            <Input label="Facebook" placeholder="https://facebook.com/..." />
            <Input label="Google Maps" placeholder="https://maps.google.com/..." />
            <Input label="WhatsApp" placeholder="+91 98765 43210" />
          </div>
        </Card>
      )}

      {activeTab === 'themes' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Choose Store Theme" subtitle="Select a curated theme style for your customer-facing digital menu and storefront" />
            
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-canvas-border scrollbar-thin scrollbar-thumb-canvas-tan">
              {[
                'All',
                'Premium & Luxury',
                'Cafe & Roastery',
                'Indian Regional',
                'Global Cuisines',
                'Modern & Trendy',
                'Seasonal & Festive',
                'Specialized Displays'
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setThemeCategory(category)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border duration-200',
                    themeCategory === category
                      ? 'bg-canvas-rose text-white border-canvas-rose shadow-md'
                      : 'bg-canvas-cream/50 text-canvas-brown_mid border-canvas-border hover:border-canvas-rose/40 hover:bg-canvas-champagne/20'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STORE_THEMES.filter(
                (theme) => themeCategory === 'All' || theme.tier === themeCategory
              ).map((theme) => {
                const isSelected = selectedTheme === theme.id
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id)
                      if (theme.colors[1]) {
                        setAccentColor(theme.colors[1])
                      }
                      if (theme.fontHeading) {
                        setFontFamily(theme.fontHeading)
                      }
                    }}
                    className={cn(
                      'relative p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden',
                      isSelected
                        ? 'bg-canvas-highlight border-canvas-rose shadow-boutique ring-1 ring-canvas-rose/20'
                        : 'bg-canvas-highlight/50 border-canvas-border/40 hover:border-canvas-rose/20 hover:bg-canvas-highlight'
                    )}
                  >
                    {/* Liquid Glass Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-display font-bold text-canvas-brown text-base flex items-center gap-1.5">
                            {theme.name}
                            {isSelected && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-canvas-rose text-white text-[10px]">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </h4>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-canvas-tan/30 text-canvas-brown_mid">
                            {theme.tier}
                          </span>
                        </div>

                        {/* Colors Preview */}
                        <div className="flex gap-1 bg-white/40 p-1.5 rounded-lg border border-white/60 shadow-inner">
                          {theme.colors.map((color, index) => (
                            <span
                              key={index}
                              className="w-3.5 h-3.5 rounded-full border border-black/5"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-canvas-brown_mid/90 font-medium mt-3 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
                      <span className={cn(
                        'transition-colors',
                        isSelected ? 'text-canvas-rose_deep' : 'text-canvas-brown_mid group-hover:text-canvas-brown'
                      )}>
                        {isSelected ? 'Currently Selected' : 'Click to select'}
                      </span>
                      <span className="text-canvas-brown_mid/60 font-mono text-[10px]">
                        {theme.id}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
