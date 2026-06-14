import { type NextRequest, NextResponse } from 'next/server'

// Public ID format: exactly 12 alphanumeric chars (our v3 format)
const PUBLIC_ID_REGEX = /^[a-zA-Z0-9]{12}$/

// Reserved subdomains that are never tenant slugs
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'super', 'admin', 'mail', 'cdn'])

// Known storefront tab names
const KNOWN_TABS = new Set(['home', 'menu', 'dine-in', 'delivery', 'blogs', 'offers', 'about'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // ── Skip static assets and API routes ──────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2|map)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ── Protected platform routes (handled by their own auth) ──────────────────
  const isPlatformRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/kds') ||
    pathname.startsWith('/download') ||
    pathname.startsWith('/comingsoon')

  if (isPlatformRoute) {
    return NextResponse.next()
  }

  // ── Subdomain detection ────────────────────────────────────────────────────
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  const isDeploy    = host.includes('vercel.app') || host.includes('run.app')
  const parts       = host.split('.')

  let tenantSlug = ''
  if (!isLocalhost && !isDeploy && parts.length >= 3) {
    const candidate = parts[0].toLowerCase()
    if (!RESERVED_SUBDOMAINS.has(candidate)) {
      tenantSlug = candidate
    }
  }

  // ── CASE 1: Subdomain storefront ───────────────────────────────────────────
  // aether-cafe.cafecanvas.bar/9xK2mPqRjL4s
  // aether-cafe.cafecanvas.bar/9xK2mPqRjL4s?table=4
  // aether-cafe.cafecanvas.bar/9xK2mPqRjL4s/menu
  if (tenantSlug) {
    const segments = pathname.split('/').filter(Boolean)  // ['9xK2mPqQjL4s'] or ['9xK2mPqQjL4s', 'menu']

    const url = request.nextUrl.clone()

    if (segments.length === 0) {
      // aether-cafe.cafecanvas.bar/ → need publicId, show landing
      // Let the dynamic page handle missing publicId → redirect to error
      url.pathname = `/storefront/${tenantSlug}`
    } else if (segments.length >= 1) {
      const firstSeg = segments[0]

      if (PUBLIC_ID_REGEX.test(firstSeg)) {
        // aether-cafe.cafecanvas.bar/9xK2mPqRjL4s → pass publicId to page
        url.pathname = `/storefront/${tenantSlug}/${firstSeg}`

        // Sub-tab: /9xK2mPqRjL4s/menu → pass tab param
        if (segments[1]) {
          const tabOrTable = segments[1].toLowerCase()
          if (KNOWN_TABS.has(tabOrTable)) {
            url.searchParams.set('tab', tabOrTable)
          }
        }
      } else if (KNOWN_TABS.has(firstSeg.toLowerCase())) {
        // aether-cafe.cafecanvas.bar/menu → missing publicId, tab shortcut
        // Won't pass security gate, but route gracefully
        url.pathname = `/storefront/${tenantSlug}`
        url.searchParams.set('tab', firstSeg)
      } else {
        // Unknown path → 404
        url.pathname = '/404'
      }
    }

    return NextResponse.rewrite(url)
  }

  // ── CASE 2: Path-based storefront (fallback / localhost dev) ───────────────
  // order.cafecanvas.bar/aether-cafe/9xK2mPqRjL4s
  // localhost:3000/aether-cafe/9xK2mPqRjL4s
  const pathMatch = pathname.match(/^\/([a-z0-9-]+)\/([a-zA-Z0-9]{12})(?:\/([a-z-]+))?$/)
  if (pathMatch) {
    const [, slug, publicId, tabOrUndefined] = pathMatch
    const url = request.nextUrl.clone()
    url.pathname = `/storefront/${slug}/${publicId}`
    if (tabOrUndefined && KNOWN_TABS.has(tabOrUndefined)) {
      url.searchParams.set('tab', tabOrUndefined)
    }
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
