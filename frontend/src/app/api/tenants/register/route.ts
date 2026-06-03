import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

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
    if (!businessName || !ownerName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner name, phone, and email are required.' },
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

    // Insert request into database
    const { data, error } = await admin
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
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      request: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
