import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env'

export function createClient() {
  const anonKey = getSupabaseAnonKey()
  return createBrowserClient(
    getSupabaseUrl(),
    anonKey || 'placeholder'
  )
}
