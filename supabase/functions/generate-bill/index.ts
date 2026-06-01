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
    const { tableId, tenantId, branchId, createdBy } = await req.json()

    // Fetch active orders for table
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('table_id', tableId)
      .not('status', 'in', '("cancelled","paid")')

    if (!activeOrders || activeOrders.length === 0) {
      return Response.json({ error: 'No active orders found for this table' }, { status: 400, headers: corsHeaders })
    }

    // Fetch store settings for tax rates
    const { data: settings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle()

    const subtotal = activeOrders.reduce((sum, o) => sum + o.subtotal, 0)
    const discountAmount = activeOrders.reduce((sum, o) => sum + o.discount_amount, 0)
    
    // Tax calculation in paise
    const cgstPercent = parseFloat(settings?.cgst_percent || '2.5')
    const sgstPercent = parseFloat(settings?.sgst_percent || '2.5')
    const cgst = Math.round(subtotal * cgstPercent / 100)
    const sgst = Math.round(subtotal * sgstPercent / 100)
    
    // Service charge calculation
    let serviceCharge = 0
    if (settings?.service_charge_type === 'percent') {
      const rate = parseFloat(settings?.service_charge_value || '5.0')
      serviceCharge = Math.round(subtotal * rate / 100)
    } else if (settings?.service_charge_type === 'flat') {
      serviceCharge = Math.round(parseFloat(settings?.service_charge_value || '0.0') * 100) // stored in rupees, convert to paise
    }

    const tax = cgst + sgst
    const total = subtotal - discountAmount + tax + serviceCharge

    const extraCharges = [
      { label: `CGST (${cgstPercent}%)`, amount: cgst },
      { label: `SGST (${sgstPercent}%)`, amount: sgst },
      ...(serviceCharge > 0 ? [{ label: `Service Charge`, amount: serviceCharge }] : []),
    ]

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        tenant_id: tenantId,
        branch_id: branchId,
        table_id: tableId,
        order_ids: activeOrders.map(o => o.id),
        subtotal,
        tax,
        discount_amount: discountAmount,
        extra_charges: extraCharges,
        total,
        status: 'open',
        created_by: createdBy
      })
      .select()
      .single()

    if (billError) throw billError

    // Update orders to 'billed' status
    await supabase
      .from('orders')
      .update({ status: 'billed' })
      .in('id', activeOrders.map(o => o.id))

    // Update table status to cleaning/cleaning or leave as occupied (wait for payment)
    await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', tableId)

    return Response.json({ bill }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})
