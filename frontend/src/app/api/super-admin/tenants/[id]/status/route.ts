import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { mapTenant } from '@/lib/superadmin/mappers'

export async function PATCH(
  req: NextRequest,
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

  const { status } = await req.json() as { status?: string }
  const active = status === 'ACTIVE'

  const { data, error } = await admin
    .from('tenants')
    .update({ active })
    .eq('id', id)
    .select('id, name, subdomain, plan, active, created_at')
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tenant: mapTenant(data) })
}
