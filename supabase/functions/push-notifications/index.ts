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
    const payload = await req.json()
    debugLog('Webhook received payload:', JSON.stringify(payload, null, 2))

    // Database Webhook payloads have 'record' field containing the new row
    const record = payload.record || payload.new
    if (!record) {
      return Response.json({ success: false, error: 'No record found in payload' }, { status: 400, headers: corsHeaders })
    }

    const tenantId = record.tenant_id
    const type = record.type || 'SYSTEM'
    const title = record.title || 'CafeCanvas Alert'
    const body = record.body || 'New operational update'

    if (!tenantId) {
      return Response.json({ success: false, error: 'No tenant_id in record' }, { status: 400, headers: corsHeaders })
    }

    // 1. Fetch active staff FCM tokens for this tenant
    const { data: staff, error: staffError } = await supabase
      .from('users')
      .select('fcm_token, role')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .not('fcm_token', 'is', null)

    if (staffError) throw staffError

    const fcmTokens = staff?.map(s => s.fcm_token).filter(Boolean) || []
    if (fcmTokens.length === 0) {
      return Response.json({ success: true, message: 'No registered active staff FCM tokens' }, { headers: corsHeaders })
    }

    // 2. Dispatch FCM notifications using Firebase HTTP v1 API
    const firebaseProjId = Deno.env.get('FIREBASE_PROJECT_ID')
    const serviceAccountToken = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_TOKEN')

    if (!firebaseProjId || !serviceAccountToken) {
      return Response.json({
        success: false,
        error: 'Firebase project configuration not set in Edge environment vars'
      }, { status: 500, headers: corsHeaders })
    }

    console.log(`Sending KOT/operational FCM notification to ${fcmTokens.length} staff devices...`)
    
    // We send to all tokens. If there are many tokens, we run them in chunks.
    const results = [];
    for (const token of fcmTokens) {
      try {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${firebaseProjId}/messages:send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceAccountToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              notification: { title, body },
              data: {
                tenantId,
                type,
                notificationId: record.id || '',
              },
              token: token,
            }
          })
        })
        results.push({ token: token.substring(0, 8) + '...', status: response.status })
      } catch (err) {
        results.push({ token: token.substring(0, 8) + '...', error: err.message })
      }
    }

    return Response.json({ success: true, results }, { headers: corsHeaders })
  } catch (error) {
    console.error('FCM trigger function failed:', error)
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
})

function debugLog(...args: any[]) {
  console.log('[PushNotifications]', ...args)
}
