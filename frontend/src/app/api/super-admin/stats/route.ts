import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const [tenants, branches, users] = await Promise.all([
    admin.from('tenants').select('id', { count: 'exact', head: true }),
    admin.from('branches').select('id', { count: 'exact', head: true }),
    admin.from('users').select('id', { count: 'exact', head: true }),
  ])

  if (tenants.error || branches.error || users.error) {
    return NextResponse.json(
      { success: false, error: tenants.error?.message ?? branches.error?.message ?? users.error?.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    stats: {
      totalTenants: tenants.count ?? 0,
      totalBranches: branches.count ?? 0,
      totalUsers: users.count ?? 0,
      systemHealth: '99.99%',
    },
  })
}
