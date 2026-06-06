import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendCustomerOtpWhatsApp } from '@/lib/msg91';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, phone, otp, tenantId } = body;

  if (!phone) {
    return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Supabase admin client not available' }, { status: 500 });
  }

  if (action === 'send') {
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required to send OTP' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Save in database
    const { error: dbError } = await admin
      .from('customer_otp_sessions')
      .insert({
        phone,
        otp: generatedOtp,
        expires_at: expiresAt,
        verified: false
      });

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Get tenant business name
    const { data: tenant } = await admin
      .from('tenants')
      .select('name')
      .eq('id', tenantId)
      .single();

    const businessName = tenant?.name || 'CafeCanvas';

    // Send WhatsApp OTP (non-blocking)
    sendCustomerOtpWhatsApp({
      phone,
      otp: generatedOtp,
      businessName
    }).catch(err => {
      console.error('Failed to send Customer WhatsApp OTP:', err);
    });

    return NextResponse.json({ success: true });
  } 
  
  if (action === 'verify') {
    if (!otp) {
      return NextResponse.json({ success: false, error: 'OTP is required' }, { status: 400 });
    }

    // Query active unverified matching OTP session
    const { data: session, error: findError } = await admin
      .from('customer_otp_sessions')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Mark as verified
    await admin
      .from('customer_otp_sessions')
      .update({ verified: true })
      .eq('id', session.id);

    // Set temporary 30-minute cookies
    const cookieStore = await cookies();
    cookieStore.set('customer_phone', phone, {
      maxAge: 1800, // 30 minutes in seconds
      path: '/',
      httpOnly: false, // Accessible to storefront client
      sameSite: 'strict'
    });

    if (tenantId) {
      cookieStore.set('customer_tenant_id', tenantId, {
        maxAge: 1800,
        path: '/',
        httpOnly: false,
        sameSite: 'strict'
      });
    }

    // Check if customer exists in the system under this tenant; if not, create them
    if (tenantId) {
      const { data: existingCustomer } = await admin
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('phone', phone)
        .maybeSingle();

      let isNew = false;
      if (!existingCustomer) {
        isNew = true;
        // Create new customer profile
        await admin
          .from('customers')
          .insert({
            tenant_id: tenantId,
            phone,
            name: 'Storefront Guest',
            visit_count: 1,
            total_spend: 0
          });
      } else {
        // Increment visit count
        await admin
          .from('customers')
          .update({ visit_count: (existingCustomer.visit_count || 0) + 1 })
          .eq('id', existingCustomer.id);
      }

      // Log notification for Store Admin and Staff POS
      await admin
        .from('notification_log')
        .insert({
          tenant_id: tenantId,
          type: 'customer_checkin',
          title: isNew ? 'New Customer Registered' : 'Customer Checked In',
          body: `Customer with phone number ${phone} checked in on the digital menu.`,
          read: false
        });
    }

    return NextResponse.json({ success: true, phone });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
