import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import crypto from 'crypto'

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
    const {
      businessName,
      ownerName,
      phone,
      email,
      password, // Password for owner account
      gstin,
      fssaiNumber,
      address,
      city,
      state,
      country,
      businessType,
      expectedStaffCount,
      expectedBranchCount,
      planKey,
    } = body

    // Validate required fields
    if (!businessName || !ownerName || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner name, phone, email, and password are required.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      )
    }

    // GSTIN format validation (optional, 15 characters if provided)
    if (gstin && gstin.trim().length !== 15) {
      return NextResponse.json(
        { success: false, error: 'GSTIN must be exactly 15 characters if provided.' },
        { status: 400 }
      )
    }

    // Check if email already registered in auth.users
    const { data: existingUser } = await admin
      .from('users') // View mapping to staff_accounts
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered.' },
        { status: 400 }
      )
    }

    // 1. Generate unique slug for the tenant
    let slug = slugify(businessName)
    const { data: existingTenants } = await admin
      .from('tenants')
      .select('id')
      .eq('slug', slug)
    if (existingTenants && existingTenants.length > 0) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`
    }

    // 2. Map plan key to check constraints
    let mappedPlan = 'Free'
    if (planKey === 'growth') mappedPlan = 'Growth'
    else if (planKey === 'professional') mappedPlan = 'Pro'
    else if (planKey === 'enterprise') mappedPlan = 'Enterprise'

    const tenantId = crypto.randomUUID()
    const locationId = crypto.randomUUID()

    // 3. Create Tenant
    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({
        id: tenantId,
        name: businessName,
        slug,
        email,
        phone,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: body.pincode || null,
        subscription_tier: mappedPlan,
        is_active: true,
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: tenantError?.message || 'Failed to create tenant.' },
        { status: 500 }
      )
    }

    // Keep track of resources to roll back in case of later errors
    let createdAuthUserId: string | null = null

    try {
      // 4. Create Location (Main Branch)
      const { error: locationError } = await admin
        .from('locations')
        .insert({
          id: locationId,
          tenant_id: tenantId,
          name: `${businessName} Main Branch`,
          address: address || null,
          city: city || null,
          state: state || null,
          phone,
          is_active: true,
        })

      if (locationError) throw new Error(locationError.message)

      // 5. Create Owner Auth User
      const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: {
          tenant_id: tenantId,
          location_id: locationId,
          role: 'owner',
        },
      })

      if (authError || !authUser.user) {
        throw new Error(authError?.message || 'Failed to create auth user.')
      }

      createdAuthUserId = authUser.user.id

      // 6. Create Owner Staff Profile via users view
      const { error: profileError } = await admin
        .from('users')
        .insert({
          id: authUser.user.id,
          tenant_id: tenantId,
          branch_id: locationId,
          name: ownerName,
          email,
          role: 'owner',
          active: true,
          pin_hash: '1234', // Default PIN for POS access
        })

      if (profileError) throw new Error(profileError.message)

      // 7. Store Settings
      const { error: settingsError } = await admin
        .from('store_settings')
        .insert({
          tenant_id: tenantId,
          currency: 'INR',
          tax_cgst: 250, // 2.5%
          tax_sgst: 250, // 2.5%
          tax_inclusive: false,
          receipt_header: businessName,
          receipt_footer: 'Thank you! Visit again.',
        })

      if (settingsError) throw new Error(settingsError.message)

      // 8. Storefront Config
      const { error: storefrontError } = await admin
        .from('storefront_config')
        .insert({
          tenant_id: tenantId,
          theme_id: 'theme-01',
          primary_color: '#e67e22',
          accent_color: '#27ae60',
          show_prices: true,
          allow_orders: true,
        })

      if (storefrontError) throw new Error(storefrontError.message)

      // 9. Seed 4 Tables
      const tablesToInsert = [1, 2, 3, 4].map(num => ({
        tenant_id: tenantId,
        location_id: locationId,
        branch_id: locationId,
        table_number: num,
        name: `Table ${num}`,
        capacity: num % 2 === 0 ? 4 : 2,
        section: 'Indoor',
        status: 'vacant',
        is_active: true,
      }))
      const { error: tablesError } = await admin.from('tables').insert(tablesToInsert)
      if (tablesError) throw new Error(tablesError.message)

      // 10. Seed Default Menu Category
      const categoryId = crypto.randomUUID()
      const { error: categoryError } = await admin
        .from('menu_categories')
        .insert({
          id: categoryId,
          tenant_id: tenantId,
          name: 'Hot Beverages',
          name_hi: 'गर्म पेय',
          sort_order: 1,
          is_visible: true,
        })

      if (categoryError) throw new Error(categoryError.message)

      // 11. Seed Default Menu Items
      const menuItemsToInsert = [
        {
          tenant_id: tenantId,
          category_id: categoryId,
          name: 'Classic Espresso',
          name_hi: 'क्लासिक एस्प्रेसो',
          description: 'Rich, full-bodied espresso shot.',
          price: 9900, // 99.00 INR
          is_available: true,
          is_featured: true,
        },
        {
          tenant_id: tenantId,
          category_id: categoryId,
          name: 'Masala Chai',
          name_hi: 'मसाला चाय',
          description: 'Traditional spiced milk tea.',
          price: 4900, // 49.00 INR
          is_available: true,
          is_featured: true,
        }
      ]
      const { error: itemsError } = await admin.from('menu_items').insert(menuItemsToInsert)
      if (itemsError) throw new Error(itemsError.message)

      // 12. Record Request in Onboarding Log
      await admin
        .from('tenant_registration_requests')
        .insert({
          business_name: businessName,
          owner_name: ownerName,
          phone,
          email,
          gstin: gstin || null,
          fssai_number: fssaiNumber || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          business_type: businessType || 'cafe',
          expected_staff_count: expectedStaffCount ? parseInt(expectedStaffCount) : 1,
          expected_branch_count: expectedBranchCount ? parseInt(expectedBranchCount) : 1,
          plan_key: planKey || 'free',
          status: 'approved', // Automatically approved
        })

      return NextResponse.json({
        success: true,
        slug,
        email,
      })

    } catch (txError: any) {
      // Roll back created resources
      if (createdAuthUserId) {
        await admin.auth.admin.deleteUser(createdAuthUserId)
      }
      await admin.from('tenants').delete().eq('id', tenantId)

      return NextResponse.json(
        { success: false, error: txError.message || 'Onboarding transaction failed.' },
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
