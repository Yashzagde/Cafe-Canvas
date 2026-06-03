import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { mapTenant, mapBranch, mapStaff } from '@/lib/superadmin/mappers'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { requestId, ownerPassword, subdomain: customSubdomain } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required.' },
        { status: 400 }
      )
    }

    // 1. Fetch the registration request
    const { data: request, error: requestError } = await admin
      .from('tenant_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return NextResponse.json(
        { success: false, error: requestError?.message || 'Registration request not found.' },
        { status: 404 }
      )
    }

    if (request.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'This registration request has already been approved.' },
        { status: 400 }
      )
    }

    // Determine subdomain: custom, or slugify business name
    const finalSubdomain = (customSubdomain || slugify(request.business_name)).toLowerCase()
    const finalPassword = ownerPassword || 'TempPass@' + Math.random().toString(36).substring(2, 10) + '1!'

    // 2. Insert tenant
    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({
        name: request.business_name,
        subdomain: finalSubdomain,
        plan: request.plan_key || 'free',
        active: true,
      })
      .select('*')
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: tenantError?.message || 'Failed to create tenant.' },
        { status: 500 }
      )
    }

    // Keep track of created resources for cleanup in case of failure
    let createdBranchId: string | null = null
    let createdAuthUserId: string | null = null

    try {
      // 3. Insert main branch
      const { data: branch, error: branchError } = await admin
        .from('branches')
        .insert({
          tenant_id: tenant.id,
          name: `${request.business_name} Main Branch`,
          active: true,
        })
        .select('*')
        .single()

      if (branchError || !branch) {
        throw new Error(branchError?.message || 'Failed to create main branch.')
      }

      createdBranchId = branch.id

      // 4. Create owner auth user
      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email: request.email,
        password: finalPassword,
        email_confirm: true,
        app_metadata: {
          tenant_id: tenant.id,
          branch_id: branch.id,
          role: 'owner',
        },
      })

      if (authError || !authUser.user) {
        throw new Error(authError?.message || 'Failed to create owner auth user.')
      }

      createdAuthUserId = authUser.user.id

      // 5. Insert owner profile into public.users
      const { error: profileError } = await admin
        .from('users')
        .insert({
          id: authUser.user.id,
          tenant_id: tenant.id,
          branch_id: branch.id,
          name: request.owner_name,
          email: request.email,
          role: 'owner',
          active: true,
        })

      if (profileError) {
        throw new Error(profileError.message)
      }

      // 6. Create storefront config
      const { error: storefrontError } = await admin
        .from('storefront_config')
        .insert({
          tenant_id: tenant.id,
          theme_id: 'theme-01',
          primary_color: '#D4854A',
          accent_color: '#C9A84C',
          font_heading: 'Outfit',
          font_body: 'Inter',
          allow_orders: true,
          show_blog: true,
        })

      if (storefrontError) {
        throw new Error(storefrontError.message)
      }

      // 7. Create store settings with CGST/SGST split default values (2.5% each, i.e., 5% total tax)
      const { error: settingsError } = await admin
        .from('store_settings')
        .insert({
          tenant_id: tenant.id,
          branch_id: branch.id,
          gstin: request.gstin || null,
          receipt_header: request.business_name,
          receipt_footer: 'Thank you! Visit again.',
          cgst_percent: 2.50,
          sgst_percent: 2.50,
          service_charge_type: 'percent',
          service_charge_value: 5.00,
        })

      if (settingsError) {
        throw new Error(settingsError.message)
      }

      // 8. Update request status to 'approved'
      const { error: updateError } = await admin
        .from('tenant_registration_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return NextResponse.json({
        success: true,
        tenant: mapTenant(tenant),
        branch: mapBranch(branch),
        owner: mapStaff({
          id: authUser.user.id,
          tenant_id: tenant.id,
          branch_id: branch.id,
          name: request.owner_name,
          email: request.email,
          role: 'owner',
          active: true,
        }),
        password: finalPassword, // Expose password only on initial approval response
      })

    } catch (txError: any) {
      // Rollback logic
      if (createdAuthUserId) {
        await admin.auth.admin.deleteUser(createdAuthUserId)
      }
      if (createdBranchId) {
        await admin.from('branches').delete().eq('id', createdBranchId)
      }
      await admin.from('tenants').delete().eq('id', tenant.id)

      return NextResponse.json(
        { success: false, error: txError.message || 'Transaction failed.' },
        { status: 500 }
      )
    }

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
