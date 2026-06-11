const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase config is missing in environment!");
  process.exit(1);
}

// Create separate client connections to simulate different apps/devices
const storefrontClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
const adminClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
const staffClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

// Seed data IDs
const tenantId = 'c1000000-0000-0000-0000-000000000001';
const publicId = 'c1000000-0000-0000-0000-000000000001'; 
const privateId = tenantId;
const locationId = 'd1000000-0000-0000-0000-000000000001'; // Main Branch
const tableId = 'f1000000-0000-0000-0000-000000000001'; // Table 1

async function testPipeline() {
  console.log("Starting Staff Call pipeline real-time verification (with pre-established channels)...");

  // 1. Simulate Staff POS subscription
  const staffChannel = staffClient.channel(`private-calls:${privateId}:${locationId}`);
  let staffReceivedRelay = false;
  let staffReceivedForward = false;

  staffChannel
    .on('broadcast', { event: 'staff_call_relay' }, ({ payload }) => {
      console.log("🛎️ [Staff POS] Received relay broadcast:", payload);
      staffReceivedRelay = true;
    })
    .on('broadcast', { event: 'forward_call' }, ({ payload }) => {
      console.log("🚨 [Staff POS] Received direct forward call:", payload);
      staffReceivedForward = true;
    })
    .subscribe((status) => {
      console.log(`[Staff POS] Channel status: ${status}`);
    });

  // 2. Pre-establish the admin private channel for sending relays/forwards
  const adminPrivateChannel = adminClient.channel(`private-calls:${privateId}:${locationId}`);
  adminPrivateChannel.subscribe((status) => {
    console.log(`[Store Admin] Private channel status: ${status}`);
  });

  // 3. Simulate Store Admin subscription to public channel
  const adminPublicChannel = adminClient.channel(`public-calls:${publicId}`);
  let adminReceivedPublicCall = false;

  adminPublicChannel
    .on('broadcast', { event: 'staff_call' }, async ({ payload }) => {
      console.log("💻 [Store Admin] Received public staff call broadcast:", payload);
      adminReceivedPublicCall = true;

      // Register call in DB (we simulate the write)
      console.log("💻 [Store Admin] Writing staff call to DB...");
      try {
        const { data: newCall, error } = await adminClient
          .from('staff_calls')
          .insert({
            tenant_id: tenantId,
            table_id: payload.tableId,
            table_number: 1,
            location_id: payload.locationId,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        console.log("💻 [Store Admin] Call registered in DB:", newCall.id);

        // Relay to Staff POS via the pre-established private channel
        console.log("💻 [Store Admin] Relaying call on private channel...");
        const res = await adminPrivateChannel.send({
          type: 'broadcast',
          event: 'staff_call_relay',
          payload: {
            id: newCall.id,
            tableId: payload.tableId,
            tableName: payload.tableName,
            locationId: payload.locationId,
            calledAt: payload.calledAt
          }
        });
        console.log(`💻 [Store Admin] Relay broadcast send result: ${res}`);

        // Simulate 2 seconds pass then forward the call
        setTimeout(async () => {
          console.log("💻 [Store Admin Timer] Simulating escalation: Forwarding call...");
          const staffId = 'c9a479e2-c5fa-41ec-970a-1cc43842d901'; // Waiter One
          
          const { error: updateErr } = await adminClient
            .from('staff_calls')
            .update({ attended_by: staffId })
            .eq('id', newCall.id);

          if (updateErr) console.error("Update error:", updateErr);

          // Send forward call on the pre-established private channel
          const fwdRes = await adminPrivateChannel.send({
            type: 'broadcast',
            event: 'forward_call',
            payload: {
              callId: newCall.id,
              staffId: staffId,
              tableName: payload.tableName
            }
          });
          console.log(`💻 [Store Admin] Forward broadcast send result: ${fwdRes}`);
        }, 2000);

      } catch (dbErr) {
        console.error("💻 [Store Admin] DB registration failed:", dbErr);
      }
    })
    .subscribe((status) => {
      console.log(`[Store Admin] Public channel status: ${status}`);
    });

  // Wait 2 seconds for all subscriptions to establish fully
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. Simulate Storefront sending the call
  console.log("📱 [Customer Storefront] Sending staff call broadcast...");
  const storefrontChannel = storefrontClient.channel(`public-calls:${publicId}`);
  storefrontChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const res = await storefrontChannel.send({
        type: 'broadcast',
        event: 'staff_call',
        payload: {
          tableId: tableId,
          tableName: 'Table 1',
          publicId: publicId,
          locationId: locationId,
          calledAt: new Date().toISOString()
        }
      });
      console.log(`📱 [Customer Storefront] Send broadcast result: ${res}`);
    }
  });

  // Wait 6 seconds to let the entire flow complete
  await new Promise(resolve => setTimeout(resolve, 6000));

  console.log("\n================ VERIFICATION SUMMARY ================");
  console.log(`Store Admin received public storefront call: ${adminReceivedPublicCall ? '✅ YES' : '❌ NO'}`);
  console.log(`Staff POS received relayed call broadcast:    ${staffReceivedRelay ? '✅ YES' : '❌ NO'}`);
  console.log(`Staff POS received forwarded call alert:     ${staffReceivedForward ? '✅ YES' : '❌ NO'}`);
  console.log("======================================================");

  // Clean up DB: delete created calls
  console.log("Cleaning up test staff calls...");
  await adminClient.from('staff_calls').delete().eq('tenant_id', tenantId);

  // Unsubscribe channels
  storefrontClient.removeAllChannels();
  adminClient.removeAllChannels();
  staffClient.removeAllChannels();

  process.exit((adminReceivedPublicCall && staffReceivedRelay && staffReceivedForward) ? 0 : 1);
}

testPipeline();
