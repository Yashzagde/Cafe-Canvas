import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { mapStaff } from '@/lib/superadmin/mappers'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: tenantId } = await context.params
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const body = await req.json() as {
    name?: string
    email?: string
    password?: string
    role?: string
    branchId?: string
  }

  const { name, email, password, role, branchId } = body
  if (!name || !email || !password || !branchId) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const allowedRoles = ['owner', 'manager', 'cashier', 'staff', 'kitchen'] as const
  const staffRole = allowedRoles.includes(role as (typeof allowedRoles)[number])
    ? (role as (typeof allowedRoles)[number])
    : 'staff'

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      tenant_id: tenantId,
      branch_id: branchId,
      role: staffRole,
    },
  })

  if (authError || !authUser.user) {
    return NextResponse.json(
      { success: false, error: authError?.message ?? 'Failed to create auth user' },
      { status: 500 }
    )
  }

  const { error: profileError } = await admin.from('users').insert({
    id: authUser.user.id,
    tenant_id: tenantId,
    branch_id: branchId,
    name,
    email,
    role: staffRole,
    active: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    staff: mapStaff({
      id: authUser.user.id,
      tenant_id: tenantId,
      branch_id: branchId,
      name,
      email,
      role: staffRole,
      active: true,
    }),
  })
}
