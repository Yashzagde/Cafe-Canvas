import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '@/utils/supabase/env'

/** Service-role client for platform admin API routes (bypasses RLS). */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return null
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
