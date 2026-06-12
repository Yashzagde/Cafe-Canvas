import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId, tenantId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !billId || !tenantId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Get the supabase client
    const supabase = await createClient()

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay configuration missing' }, { status: 400 })
    }

    // 3. Verify Razorpay signature using standard Node.js crypto
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id)
    const expectedSig = hmac.digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ valid: false, error: 'Invalid signature' }, { status: 400 })
    }

    // 4. Update the bill status in the database to paid
    const { data: bill, error: billErr } = await supabase
      .from('bills')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        paid_at: new Date().toISOString()
      })
      .eq('id', billId)
      .select()
      .maybeSingle()

    if (billErr) {
      return NextResponse.json({ error: `Failed to update bill: ${billErr.message}` }, { status: 500 })
    }

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    // 5. Settle associated orders
    if (bill.order_ids && bill.order_ids.length > 0) {
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .in('id', bill.order_ids)
    }

    // 6. Free the table & close table session if applicable
    if (bill.table_id) {
      await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', bill.table_id)

      await supabase
        .from('table_sessions')
        .update({
          check_out_at: new Date().toISOString(),
          total_revenue: bill.total,
          bill_id: bill.id
        })
        .eq('table_id', bill.table_id)
        .is('check_out_at', null)
    }

    return NextResponse.json({ valid: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
