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
}

const STORE_THEMES: StoreTheme[] = [
  {
    id: 'theme-01',
    name: 'Boutique Cream',
    tier: 'Premium Boutique',
    colors: ['#F7EEE2', '#E2C9A3', '#FFC9CD'],
    description: 'Warm cream backgrounds with soft beige secondary tones and rose quartz accents.'
  },
  {
    id: 'theme-02',
    name: 'Midnight Brew',
    tier: 'Premium Dark',
    colors: ['#121212', '#1E1E1E', '#D4A843'],
    description: 'Sleek dark theme with rich charcoal layers and vibrant gold highlights.'
  },
  {
    id: 'theme-03',
    name: 'Forest Mint',
    tier: 'Cafe Fresh',
    colors: ['#F0F7F4', '#D9EAD9', '#B4F8C8'],
    description: 'Clean mint green and sage styling for health-focused and organic cafés.'
  },
  {
    id: 'theme-04',
    name: 'Royal Velvet',
    tier: 'Premium Luxury',
    colors: ['#FAFAFC', '#F3E8FF', '#8E44AD'],
    description: 'Rich lavender base and royal purple accent colors for upscale dining.'
  },
  {
    id: 'theme-05',
    name: 'Coastal Teal',
    tier: 'Cafe Breezy',
    colors: ['#F5FBFB', '#E6F7F6', '#4ECDC4'],
    description: 'Breezy teal and cool turquoise colors for modern beachside cafés.'
  },
  {
    id: 'theme-06',
    name: 'Masala Chai',
    tier: 'Indian Regional',
    colors: ['#FAF5F0', '#F5EBE0', '#C4714A'],
    description: 'Rich cardamom and warm terracotta tones for traditional Indian dining.'
  },
  {
    id: 'theme-07',
    name: 'Sunset Rose',
    tier: 'Boutique Special',
    colors: ['#FFF5F5', '#FFE3E3', '#FF8787'],
    description: 'Romantic blush pink hues perfect for bakeries and dessert parlors.'
  },
  {
    id: 'theme-08',
    name: 'Lemon Zest',
    tier: 'Cafe Seasonal',
    colors: ['#FFFDF5', '#FFF9DB', '#FAB005'],
    description: 'Cheerful lemon yellow and honey-gold highlights to energize your store.'
  }
]

export function StorefrontConfigScreen() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('branding')
  const { tenant, storefrontConfig, updateTenant, updateStorefrontConfig } = useTenantStore()

  // Local theme state
  const [selectedTheme, setSelectedTheme] = useState('theme-01')

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
                  { value: 'Nunito', label: 'Nunito (Default)' },
                  { value: 'Inter', label: 'Inter' },
                  { value: 'Poppins', label: 'Poppins' },
                  { value: 'Playfair Display', label: 'Playfair Display' },
                  { value: 'Outfit', label: 'Outfit' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {STORE_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id
                return (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
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
