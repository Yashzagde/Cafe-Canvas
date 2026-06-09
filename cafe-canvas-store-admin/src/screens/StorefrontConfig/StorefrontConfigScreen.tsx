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
    description: 'Gold and dark blue premium theme with extreme glassmorphism overlays.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-02',
    name: 'Liquid Glass Basic',
    tier: 'Premium & Luxury',
    colors: ['#F8F9FA', '#FF6B35', '#1A1A2E'],
    description: 'Clean transparent design with bright orange accents.',
    fontHeading: 'Fraunces'
  },
  {
    id: 'theme-03',
    name: 'Onyx Luxury Dark',
    tier: 'Premium & Luxury',
    colors: ['#121212', '#C9A84C', '#1C1C1C'],
    description: 'Matte black background with rich gold foil accents for fine dining.',
    fontHeading: 'Playfair Display'
  },

  // 2. Cafe & Roastery (theme-04 to theme-07)
  {
    id: 'theme-04',
    name: 'Classic Cafe Brown',
    tier: 'Cafe & Roastery',
    colors: ['#FAF6F0', '#78350F', '#3E1F07'],
    description: 'Warm cream foundations and dark espresso brown tones.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-05',
    name: 'Artisan Roastery',
    tier: 'Cafe & Roastery',
    colors: ['#F5EBE0', '#4E3629', '#D5BDAF'],
    description: 'Artisan minimalist coffee culture palette with earthy brown hues.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-06',
    name: 'Chocolate Indulgence',
    tier: 'Cafe & Roastery',
    colors: ['#3D1E12', '#DDA15E', '#F4A261'],
    description: 'Rich dark chocolate tones and pink accents for dessert cafes.',
    fontHeading: 'Poppins'
  },
  {
    id: 'theme-07',
    name: 'Matcha Zen',
    tier: 'Cafe & Roastery',
    colors: ['#EDF4EC', '#15803D', '#A3B18A'],
    description: 'Organic sage greens and tranquil bamboo textures.',
    fontHeading: 'Nunito'
  },

  // 3. Indian Regional Heritage (theme-08 to theme-13, theme-26, theme-27, theme-29, theme-30)
  {
    id: 'theme-08',
    name: 'Rajasthani Royal',
    tier: 'Indian Regional',
    colors: ['#FDF3E7', '#C2410C', '#9A3412'],
    description: 'Saffron orange, deep marigold, and copper patterns.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-09',
    name: 'Maharashtrian Heritage',
    tier: 'Indian Regional',
    colors: ['#FDF2F4', '#BE123C', '#E11D48'],
    description: 'Rich saffron red background with royal maroon borders.',
    fontHeading: 'Poppins'
  },
  {
    id: 'theme-10',
    name: 'Mughal Garden',
    tier: 'Indian Regional',
    colors: ['#ECF8F4', '#047857', '#065F46'],
    description: 'Deep emerald greens and delicate white marble accents.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-11',
    name: 'Punjabi Dhaba Bold',
    tier: 'Indian Regional',
    colors: ['#FFFDF0', '#DC2626', '#FACC15'],
    description: 'Vibrant yellow and red accents for high-energy traditional dhabas.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-12',
    name: 'South Indian Temple',
    tier: 'Indian Regional',
    colors: ['#FCF8F2', '#B91C1C', '#D97706'],
    description: 'Sandalwood base with vermillion red highlights.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-13',
    name: 'Gujarat Mithai Gold',
    tier: 'Indian Regional',
    colors: ['#FFFDF5', '#E28743', '#F0A050'],
    description: 'Festive gold and sweet orange highlights.',
    fontHeading: 'Outfit'
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
    colors: ['#F0F9FF', '#0284C7', '#075985'],
    description: 'Cool ice blue and slate tones for a winter lounge feel.',
    fontHeading: 'Inter'
  },
  {
    id: 'theme-15',
    name: 'Italian Trattoria',
    tier: 'Global Cuisines',
    colors: ['#FDF2F2', '#15803D', '#B91C1C'],
    description: 'Tuscan olive green and sun-dried tomato red accents.',
    fontHeading: 'Playfair Display'
  },
  {
    id: 'theme-16',
    name: 'Chinese Dynasty Red',
    tier: 'Global Cuisines',
    colors: ['#FFF5F5', '#E11D48', '#991B1B'],
    description: 'Dynasty crimson red and imperial gold accents.',
    fontHeading: 'Cormorant Garamond'
  },
  {
    id: 'theme-17',
    name: 'Japanese Sakura',
    tier: 'Global Cuisines',
    colors: ['#FDF2F8', '#DB2777', '#9D174D'],
    description: 'Soft cherry blossom pink and dark slate stone accents.',
    fontHeading: 'Poppins'
  },
  {
    id: 'theme-18',
    name: 'Mediterranean Blue',
    tier: 'Global Cuisines',
    colors: ['#F0F7FF', '#2563EB', '#FBBF24'],
    description: 'Stunning azure blue and sunny yellow highlights.',
    fontHeading: 'Outfit'
  },
  {
    id: 'theme-19',
    name: 'Mexican Fiesta',
    tier: 'Global Cuisines',
    colors: ['#FFFBEB', '#16A34A', '#DC2626'],
    description: 'Cactus green and chili red for high-energy cafes.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-20',
    name: 'Thai Tropical',
    tier: 'Global Cuisines',
    colors: ['#ECFEFF', '#0891B2', '#EA580C'],
    description: 'Vibrant teal and sweet orange highlights.',
    fontHeading: 'Nunito'
  },
  {
    id: 'theme-21',
    name: 'American Diner Chrome',
    tier: 'Global Cuisines',
    colors: ['#FFF5F5', '#EF4444', '#3B82F6'],
    description: 'Checkerboard patterns, retro red, and chrome blue accents.',
    fontHeading: 'Space Grotesk'
  },
  {
    id: 'theme-22',
    name: 'Korean Bento',
    tier: 'Global Cuisines',
    colors: ['#FFFFFF', '#E8002D', '#003478'],
    description: 'Taegukgi-inspired palette of bold red and deep navy.',
    fontHeading: 'Inter'
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
]

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
