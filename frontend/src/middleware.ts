import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Skip static assets and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  // 2. Demo Mode Bypass
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (isDemoMode && pathname.startsWith('/demo')) {
    return NextResponse.next()
  }

  // 3. Skip session refresh for public webhooks or specific payment endpoints
  const isPublicApi = pathname.startsWith('/api/payment/verify')
  if (isPublicApi) {
    return NextResponse.next()
  }

  // 4. Perform session management for protected dashboard routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
