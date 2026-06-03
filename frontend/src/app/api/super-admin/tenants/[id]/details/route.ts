import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { mapBranch, mapStaff } from '@/lib/superadmin/mappers'

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const [branchesRes, staffRes] = await Promise.all([
    admin
      .from('branches')
      .select('id, tenant_id, name, active, created_at')
      .eq('tenant_id', id)
      .order('created_at', { ascending: true }),
    admin
      .from('users')
      .select('id, tenant_id, branch_id, name, email, role, active')
      .eq('tenant_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (branchesRes.error || staffRes.error) {
    return NextResponse.json(
      { success: false, error: branchesRes.error?.message ?? staffRes.error?.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    branches: (branchesRes.data ?? []).map(mapBranch),
    staff: (staffRes.data ?? []).map(mapStaff),
  })
}
