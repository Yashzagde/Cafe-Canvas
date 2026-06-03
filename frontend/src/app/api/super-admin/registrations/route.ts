import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
        { status: 503 }
      )
    }

    const { data, error } = await admin
      .from('tenant_registration_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registrations: data || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { requestId, status, rejectionReason } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: 'Request ID and status are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await admin
      .from('tenant_registration_requests')
      .update({
        status,
        rejection_reason: rejectionReason || null,
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      registration: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
