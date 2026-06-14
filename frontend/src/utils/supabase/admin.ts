import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabase/env'

/** Service-role client for platform admin API routes (bypasses RLS). */
export function createAdminClient() {
  const serviceKey = getSupabaseServiceRoleKey()
  if (!serviceKey) {
    return null
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
