import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0]
  
  // If the tenant slug is a main platform reserved keyword, proceed normally
  const reservedSubdomains = ['app', 'www', 'localhost', '127']
  const isReserved = reservedSubdomains.some(domain => subdomain.startsWith(domain))

  let supabaseResponse = NextResponse.next()

  // Inject dynamic tenant slug header for storefront lookup
  if (!isReserved) {
    supabaseResponse.headers.set('x-tenant-slug', subdomain)
  }

  // Set up Supabase SSR client for Middleware session refreshing
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Inject dynamic tenant slug header back into the new response
          if (!isReserved) {
            supabaseResponse.headers.set('x-tenant-slug', subdomain)
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh user session safely
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, logos)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
