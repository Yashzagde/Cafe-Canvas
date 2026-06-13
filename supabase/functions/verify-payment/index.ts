// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = await req.json()

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keySecret) {
      throw new Error('Razorpay configuration missing')
    }

    // Verify signature using Web Crypto API
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', encoder.encode(keySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSig = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')

    if (expectedSig !== razorpay_signature) {
      return Response.json({ valid: false, error: 'Invalid signature' }, { status: 400, headers: corsHeaders })
    }

    // Fetch the bill
    const { data: bill } = await supabase
      .from('bills')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        paid_at: new Date().toISOString()
      })
      .eq('id', billId)
      .select()
      .single()

    // Settle associated orders
    if (bill && bill.order_ids && bill.order_ids.length > 0) {
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .in('id', bill.order_ids)
    }

    // Free the table
    if (bill && bill.table_id) {
      await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', bill.table_id)

      // Close the table session
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

    return Response.json({ valid: true }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})
