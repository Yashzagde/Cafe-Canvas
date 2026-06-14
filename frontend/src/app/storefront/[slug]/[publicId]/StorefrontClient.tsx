'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { HeroSection } from './sections/HeroSection'
import { MenuSection } from './sections/MenuSection'
import { ReviewsSection } from './sections/ReviewsSection'
import { BlogSection } from './sections/BlogSection'
import { AboutSection } from './sections/AboutSection'
import { FooterSection } from './sections/FooterSection'
import { StorefrontNav } from './components/StorefrontNav'
import { TableSessionModal } from './components/TableSessionModal'
import { CallStaffButton } from './components/CallStaffButton'

export interface CartItem {
  id: string
  name: string
  price_paise: number
  quantity: number
}

interface HeroSlide {
  image_url: string | null
  title?:    string | null
  subtitle?: string | null
}

interface StorefrontClientProps {
  tenant: {
    id: string; name: string; slug: string; publicId: string
    logoUrl: string | null; phone: string | null; address: string
  }
  config: {
    theme_id: string; hero_slides: HeroSlide[]
    footer_description: string | null; footer_hours: string | null
    footer_address: string | null; footer_phone: string | null; footer_email: string | null
    show_prices: boolean; allow_orders: boolean; show_blog: boolean
    show_reviews: boolean; show_instagram: boolean; show_story: boolean
    about_title: string | null; about_text: string | null; about_image_url: string | null
    primary_color: string; accent_color: string
  } | null
  settings: {
    currency: string; tax_cgst: number; tax_sgst: number; tax_inclusive: boolean
    payment_methods: string[]; upi_id: string | null; upi_name: string | null
    open_time: string | null; close_time: string | null
  } | null
  initialTab: string
  initialTable: string | null
}

export function StorefrontClient({
  tenant, config, settings, initialTab, initialTable
}: StorefrontClientProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [showTableModal, setShowTableModal] = useState(false)

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // ── On mount: restore or create table session ──────────────────────────────
  useEffect(() => {
    const storageKey = `cc_session_${tenant.slug}`
    const storedToken = localStorage.getItem(storageKey)
    const storedTable = localStorage.getItem(`cc_table_${tenant.slug}`)

    if (storedToken && storedTable) {
      setSessionToken(storedToken)
      setTableNumber(storedTable)
    } else {
      // Show table modal
      // If table was pre-filled from QR ?table=4 param
      if (initialTable) {
        // Auto-create session with pre-filled table
        createTableSession(initialTable)
      } else {
        setShowTableModal(true)
      }
    }
  }, [])

  const createTableSession = async (tNum: string) => {
    const { data, error } = await supabase
      .from('table_sessions')
      .insert({
        tenant_id:    tenant.id,
        table_number: tNum,
        is_active:    true,
      })
      .select('id, session_token')
      .single()

    if (!error && data) {
      const storageKey = `cc_session_${tenant.slug}`
      localStorage.setItem(storageKey, data.session_token)
      localStorage.setItem(`cc_table_${tenant.slug}`, tNum)
      setSessionToken(data.session_token)
      setTableNumber(tNum)
      setShowTableModal(false)
    }
  }

  // CSS custom properties from tenant theme
  const themeStyle = {
    '--primary':   config?.primary_color || '#C4714A',
    '--accent':    config?.accent_color  || '#D4A843',
  } as React.CSSProperties

  return (
    <div style={themeStyle} className="min-h-screen bg-white">
      {/* Fixed navigation */}
      <StorefrontNav
        tenant={tenant}
        tableNumber={tableNumber}
        cartCount={cartItems.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showBlog={config?.show_blog ?? false}
        onTableClick={() => setShowTableModal(true)}
      />

      {/* Call Staff — always visible when session exists */}
      {sessionToken && tableNumber && (
        <CallStaffButton
          tenantId={tenant.id}
          tableNumber={tableNumber}
          sessionToken={sessionToken}
        />
      )}

      {/* Table session modal */}
      {showTableModal && (
        <TableSessionModal
          storeName={tenant.name}
          prefilledTable={initialTable}
          onConfirm={createTableSession}
        />
      )}

      {/* Content sections */}
      <main className="pb-24">
        {activeTab === 'home' && (
          <>
            <HeroSection slides={config?.hero_slides ?? []} storeName={tenant.name} />
            {config?.show_story && config.about_title && (
              <AboutSection
                title={config.about_title}
                text={config.about_text}
                imageUrl={config.about_image_url}
              />
            )}
            {/* Preview of menu (featured items) */}
            <MenuSection
              tenantId={tenant.id}
              showPrices={config?.show_prices ?? true}
              featuredOnly={true}
              currency={settings?.currency || 'INR'}
              cartItems={cartItems}
              onCartUpdate={setCartItems}
            />
          </>
        )}

        {activeTab === 'menu' && (
          <MenuSection
            tenantId={tenant.id}
            showPrices={config?.show_prices ?? true}
            featuredOnly={false}
            currency={settings?.currency || 'INR'}
            cartItems={cartItems}
            onCartUpdate={setCartItems}
          />
        )}

        {activeTab === 'blogs' && config?.show_blog && (
          <BlogSection tenantId={tenant.id} />
        )}

        {(activeTab === 'home' || activeTab === 'reviews') && config?.show_reviews && (
          <ReviewsSection
            tenantId={tenant.id}
            allowNew={true}
            sessionToken={sessionToken}
          />
        )}
      </main>

      <FooterSection config={config} tenant={tenant} />
    </div>
  )
}
