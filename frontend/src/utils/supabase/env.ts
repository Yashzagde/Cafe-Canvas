/** Supabase anon/publishable key — supports both env var names used in CI and Vercel. */
export function getSupabaseAnonKey(): string {
  const keys = [
    process.env.NEXT_PUBLIC_cafecanvas_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_cafecanvas_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ]
  for (const k of keys) {
    if (k && k.trim() !== '') return k
  }
  return ''
}

export function getSupabaseUrl(): string {
  const urls = [
    process.env.NEXT_PUBLIC_cafecanvas_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ]
  for (const u of urls) {
    if (u && u.trim() !== '') return u
  }
  return 'https://placeholder.supabase.co'
}

export function getSupabaseServiceRoleKey(): string {
  const keys = [
    process.env.cafecanvas_SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ]
  for (const k of keys) {
    if (k && k.trim() !== '') return k
  }
  return ''
}

