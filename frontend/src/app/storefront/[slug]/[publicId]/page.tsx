import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { StorefrontClient } from './StorefrontClient'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string; publicId: string }>
  searchParams: Promise<{ table?: string; tab?: string }>
}

// ── Server-side tenant + config fetch ─────────────────────────────────────────
async function getTenantData(slug: string, publicId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select(`
      id,
      name,
      slug,
      public_id,
      logo_url,
      phone,
      address,
      city,
      state,
      is_active,
      storefront_config (
        theme_id,
        hero_slides,
        footer_description,
        footer_hours,
        footer_address,
        footer_phone,
        footer_email,
        show_prices,
        allow_orders,
        show_blog,
        show_reviews,
        show_instagram,
        show_story,
        about_title,
        about_text,
        about_image_url,
        primary_color,
        accent_color,
        font_heading,
        font_body
      ),
      store_settings (
        currency,
        tax_cgst,
        tax_sgst,
        tax_inclusive,
        payment_methods,
        upi_id,
        upi_name,
        open_time,
        close_time
      )
    `)
    // ── SECURITY GATE: BOTH slug AND publicId must match ──────────────────────
    .eq('slug', slug)
    .eq('public_id', publicId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data
}

// ── Generate metadata server-side (SEO) ───────────────────────────────────────
export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolvedParams = await props.params
  const data = await getTenantData(resolvedParams.slug, resolvedParams.publicId)
  if (!data) return { title: 'Not Found' }

  const config = Array.isArray(data.storefront_config)
    ? data.storefront_config[0]
    : data.storefront_config

  const heroSlides = config?.hero_slides as any[] | null

  return {
    title: `${data.name} — Menu & Order`,
    description: config?.footer_description || `Welcome to ${data.name}`,
    openGraph: {
      title: data.name,
      description: config?.footer_description || '',
      images: heroSlides?.[0]?.image_url
        ? [{ url: heroSlides[0].image_url }]
        : [],
    },
  }
}

// ── Page (Server Component — no loading state, no useEffect, instant render) ──
export default async function StorefrontPage(props: Props) {
  const resolvedParams = await props.params
  const resolvedSearchParams = await props.searchParams
  const data = await getTenantData(resolvedParams.slug, resolvedParams.publicId)

  // Invalid slug+publicId combination → generic 404 (no hint which part is wrong)
  if (!data) notFound()

  const config = Array.isArray(data.storefront_config)
    ? data.storefront_config[0]
    : data.storefront_config

  const settings = Array.isArray(data.store_settings)
    ? data.store_settings[0]
    : data.store_settings

  // Pass resolved tenant data to client component for interactivity
  return (
    <StorefrontClient
      tenant={{
        id:         data.id,
        name:       data.name,
        slug:       data.slug,
        publicId:   data.public_id,
        logoUrl:    data.logo_url,
        phone:      data.phone,
        address:    `${data.address || ''}, ${data.city || ''}, ${data.state || ''}`.trim().replace(/^,\s*/, ''),
      }}
      config={config as any}
      settings={settings as any}
      initialTab={resolvedSearchParams.tab || 'home'}
      initialTable={resolvedSearchParams.table || null}
    />
  )
}

// ISR: revalidate every 60 seconds
// Config changes in admin appear on storefront within 1 minute
export const revalidate = 60
