import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { mapBranch, mapStaff, mapTenant } from '@/lib/superadmin/mappers'

export async function GET() {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const { data, error } = await admin
    .from('tenants')
    .select('id, name, subdomain, plan, active, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    tenants: (data ?? []).map(mapTenant),
  })
}

export async function POST(req: NextRequest) {
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const body = await req.json() as {
    tenantName?: string
    subdomain?: string
    plan?: string
    ownerName?: string
    ownerEmail?: string
    ownerPassword?: string
  }

  const { tenantName, subdomain, plan, ownerName, ownerEmail, ownerPassword } = body
  if (!tenantName || !subdomain || !ownerEmail || !ownerPassword) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({
      name: tenantName,
      subdomain: subdomain.toLowerCase(),
      plan: plan ?? 'free',
      active: true,
    })
    .select('id, name, subdomain, plan, active, created_at')
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json(
      { success: false, error: tenantError?.message ?? 'Failed to create tenant' },
      { status: 500 }
    )
  }

  const { data: branch, error: branchError } = await admin
    .from('branches')
    .insert({
      tenant_id: tenant.id,
      name: `${tenantName} Main Branch`,
      active: true,
    })
    .select('id, tenant_id, name, active, created_at')
    .single()

  if (branchError || !branch) {
    await admin.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json(
      { success: false, error: branchError?.message ?? 'Failed to create branch' },
      { status: 500 }
    )
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    app_metadata: {
      tenant_id: tenant.id,
      branch_id: branch.id,
      role: 'owner',
    },
  })

  if (authError || !authUser.user) {
    await admin.from('branches').delete().eq('id', branch.id)
    await admin.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json(
      { success: false, error: authError?.message ?? 'Failed to create owner auth user' },
      { status: 500 }
    )
  }

  const { error: profileError } = await admin.from('users').insert({
    id: authUser.user.id,
    tenant_id: tenant.id,
    branch_id: branch.id,
    name: ownerName || tenantName,
    email: ownerEmail,
    role: 'owner',
    active: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id)
    await admin.from('branches').delete().eq('id', branch.id)
    await admin.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json(
      { success: false, error: profileError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    tenant: mapTenant(tenant),
    branch: mapBranch(branch),
    owner: mapStaff({
      id: authUser.user.id,
      tenant_id: tenant.id,
      branch_id: branch.id,
      name: ownerName || tenantName,
      email: ownerEmail,
      role: 'owner',
      active: true,
    }),
  })
}
