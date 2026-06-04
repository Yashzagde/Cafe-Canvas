import { useState } from 'react'
import { Palette, Globe, Image, Type, ExternalLink, Save, Eye } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Tabs } from '../../components/ui/Tabs'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'

type ConfigTab = 'branding' | 'homepage' | 'seo' | 'social'

export function StorefrontConfigScreen() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('branding')

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

  const tabs = [
    { id: 'branding', label: 'Branding', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'homepage', label: 'Homepage', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'seo', label: 'SEO', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'social', label: 'Social Links', icon: <ExternalLink className="w-3.5 h-3.5" /> },
  ]

  const PRESET_COLORS = ['#C4714A', '#D4A843', '#4ECDC4', '#E74C3C', '#8E44AD', '#2C3E50', '#27AE60', '#F39C12']

  const handleSave = () => {
    toast.success('Settings saved', 'Storefront configuration updated')
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
    </div>
  )
}
