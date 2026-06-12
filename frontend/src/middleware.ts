import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // 1. Skip static assets, public files, and payment webhook routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|css|js|exe|apk|mp4|blockmap)$/)
  ) {
    return NextResponse.next()
  }

  // 2. Tenant Subdomain Resolution
  let tenantSlug = ''
  let tenantId = ''

  // Parse subdomain (e.g. brewhouse.cafecanvas.bar -> brewhouse)
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const parts = host.split('.')
    const isPlatformDomain = host.includes('run.app') || host.includes('vercel.app') || host.includes('supabase.co')
    if (parts.length > 2 && !isPlatformDomain) {
      tenantSlug = parts[0]
    }
  }

  // 3. Initialize Supabase Response & Client
  let supabaseResponse = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Set tenant headers for Downstream consumption (Server Actions/Components)
  supabaseResponse.headers.set('x-tenant-slug', tenantSlug)
  supabaseResponse.headers.set('x-tenant-id', tenantId)

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: new Headers(request.headers),
            },
          })
          // Propagate tenant headers to redirect response as well
          supabaseResponse.headers.set('x-tenant-slug', tenantSlug)
          supabaseResponse.headers.set('x-tenant-id', tenantId)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh user session
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Session & Route Protection for /admin
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  if (isAdminRoute) {
    if (!user && !isLoginRoute) {
      // Redirect unauthenticated user to login screen
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (user && isLoginRoute) {
      // Redirect already logged-in staff to admin dashboard
      const dashboardUrl = new URL('/admin', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Role-based routing validation (if sub-routes are hit in the future)
    if (user) {
      const userRole = user.app_metadata?.role as string || 'staff'
      
      if (pathname.startsWith('/admin/settings') && userRole !== 'owner') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (pathname.startsWith('/admin/staff') && !['owner', 'manager'].includes(userRole)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (pathname.startsWith('/admin/pos') && !['owner', 'manager', 'cashier'].includes(userRole)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (pathname.startsWith('/admin/kds') && !['owner', 'manager', 'kitchen'].includes(userRole)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  const isGlobalRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/kos') ||
    pathname.startsWith('/download') ||
    pathname.startsWith('/comingsoon')

  // 4b. Table QR / Deep Link Path Resolution (/[store_slug]/[table_slug] or /[store_slug]/table/[table_slug])
  if (!isGlobalRoute) {
    const subdirectoryMatch = pathname.match(/^\/([^\/]+)\/(?:table\/)?([a-zA-Z0-9_-]+)$/)
    if (subdirectoryMatch) {
      const storeSlug = subdirectoryMatch[1]
      const tableIdent = subdirectoryMatch[2]
      const knownTabs = ['home', 'menu', 'dine-in', 'delivery', 'products', 'blogs', 'account', 'offers', 'about', 'contact', 'gallery', 'careers']
      
      const url = request.nextUrl.clone()
      url.pathname = `/${storeSlug}`
      
      if (knownTabs.includes(tableIdent.toLowerCase())) {
        url.searchParams.set('tab', tableIdent)
      } else {
        url.searchParams.set('table', tableIdent)
      }
      
      const rewriteResponse = NextResponse.rewrite(url)
      supabaseResponse.headers.forEach((value, key) => {
        rewriteResponse.headers.set(key, value)
      })
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value)
      })
      return rewriteResponse
    }
  }

  // 5. Rewrite tenant subdomain requests to the dynamic tenant route /[store_slug]
  if (
    !isGlobalRoute &&
    tenantSlug &&
    tenantSlug !== 'app' &&
    tenantSlug !== 'www' &&
    host &&
    !host.includes('localhost') &&
    !host.includes('127.0.0.1')
  ) {
    const url = request.nextUrl.clone()
    
    // Check if the path points to a table slug or UUID: /[table_slug]
    const match = pathname.match(/^\/(?:table\/)?([a-zA-Z0-9_-]+)$/)
    
    if (match) {
      const tableIdent = match[1]
      const knownTabs = ['home', 'menu', 'dine-in', 'delivery', 'products', 'blogs', 'account', 'offers', 'about', 'contact', 'gallery', 'careers']
      
      url.pathname = `/${tenantSlug}`
      if (knownTabs.includes(tableIdent.toLowerCase())) {
        url.searchParams.set('tab', tableIdent)
      } else {
        url.searchParams.set('table', tableIdent)
      }
    } else {
      url.pathname = `/${tenantSlug}${pathname}`
    }
    
    const rewriteResponse = NextResponse.rewrite(url)
    
    // Propagate headers (including tenant claims and refresh tokens)
    supabaseResponse.headers.forEach((value, key) => {
      rewriteResponse.headers.set(key, value)
    })
    
    // Propagate cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return rewriteResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
