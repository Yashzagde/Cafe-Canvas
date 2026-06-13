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
    const { tableId, tenantId, tableNumber } = await req.json()

    // Check cooldown: no call from this table in last 2 minutes
    const twoMinsAgo = new Date(Date.now() - 120000).toISOString()
    const { data: recentCall } = await supabase
      .from('staff_calls')
      .select('id, created_at')
      .eq('table_id', tableId)
      .gte('created_at', twoMinsAgo)
      .limit(1)
      .maybeSingle()

    if (recentCall) {
      const remaining = 120000 - (Date.now() - new Date(recentCall.created_at).getTime())
      return Response.json(
        { cooldown: true, remainingSeconds: Math.ceil(remaining / 1000) },
        { headers: corsHeaders }
      )
    }

    // Look up table number if not provided
    let tblNum = tableNumber;
    if (!tblNum) {
      const { data: tableRecord } = await supabase
        .from('tables')
        .select('table_number')
        .eq('id', tableId)
        .maybeSingle()
      tblNum = tableRecord?.table_number
    }

    // Insert new call record
    const { data: call, error: insertError } = await supabase
      .from('staff_calls')
      .insert({ tenant_id: tenantId, table_id: tableId, status: 'pending' })
      .select()
      .single()

    if (insertError) throw insertError

    // Log to notification_log so store-admin and staff POS see it in real-time
    await supabase
      .from('notification_log')
      .insert({
        tenant_id: tenantId,
        type: 'call_staff',
        title: '🔔 Assistance Requested',
        body: `Table ${tblNum || 'Guest'} requested assistance.`,
        read: false
      })

    // Get FCM tokens for active staff in this tenant
    const { data: staff } = await supabase
      .from('staff_accounts')
      .select('fcm_token')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('role', ['owner', 'manager', 'staff', 'cashier'])
      .not('fcm_token', 'is', null)

    const fcmTokens = staff?.map(s => s.fcm_token).filter(Boolean) || []
    if (fcmTokens.length > 0) {
      // Send FCM notification via standard Google API
      const firebaseProjId = Deno.env.get('FIREBASE_PROJECT_ID')
      if (firebaseProjId) {
        await fetch(`https://fcm.googleapis.com/v1/projects/${firebaseProjId}/messages:send`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + Deno.env.get('FIREBASE_SERVICE_ACCOUNT_TOKEN'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              notification: {
                title: `🔔 Table ${tblNum || 'Guest'} needs assistance`,
                body: 'A customer is waiting for help',
              },
              data: { tableId, tenantId, callId: call.id, type: 'CALL_STAFF' },
              tokens: fcmTokens,
            }
          })
        })
      }
    }

    return Response.json({ success: true, callId: call.id }, { headers: corsHeaders })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})
