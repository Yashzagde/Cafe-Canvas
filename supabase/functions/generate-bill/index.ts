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

    // Fetch table info to get table number
    const { data: tableRecord } = await supabase
      .from('tables')
      .select('table_number')
      .eq('id', tableId)
      .maybeSingle()

    // Fetch active table session or orders to get customer details
    const { data: tableSession } = await supabase
      .from('table_sessions')
      .select('customer_name, customer_phone')
      .eq('table_id', tableId)
      .is('ended_at', null)
      .maybeSingle()

    const customerName = tableSession?.customer_name || activeOrders[0]?.customer_name || 'Storefront Guest'
    const customerPhone = tableSession?.customer_phone || activeOrders[0]?.customer_phone || null

    const subtotal = activeOrders.reduce((sum, o) => sum + o.subtotal, 0)
    const discountAmount = activeOrders.reduce((sum, o) => sum + o.discount_amount, 0)
    
    // Tax calculation in paise. Settings has tax_cgst / tax_sgst in base points (2.5% = 250)
    const cgstRate = settings?.tax_cgst !== undefined ? settings.tax_cgst : 250;
    const sgstRate = settings?.tax_sgst !== undefined ? settings.tax_sgst : 250;
    
    const cgst = Math.round(subtotal * cgstRate / 10000)
    const sgst = Math.round(subtotal * sgstRate / 10000)
    const total = subtotal - discountAmount + cgst + sgst

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        tenant_id: tenantId,
        location_id: branchId,
        order_ids: activeOrders.map(o => o.id),
        table_number: tableRecord?.table_number || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        subtotal,
        cgst,
        sgst,
        discount_amount: discountAmount,
        total,
        status: 'unpaid',
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
