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
  
  if (action === 'quick_checkin') {
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required for check-in' }, { status: 400 });
    }

    // Set temporary cookies
    const cookieStore = await cookies();
    cookieStore.set('customer_phone', phone, {
      maxAge: 86400, // 24 hours
      path: '/',
      httpOnly: false,
      sameSite: 'strict'
    });
    cookieStore.set('customer_tenant_id', tenantId, {
      maxAge: 86400, // 24 hours
      path: '/',
      httpOnly: false,
      sameSite: 'strict'
    });

    // Check if customer exists in the system under this tenant; if not, create them
    const { data: existingCustomer, error: queryErr } = await admin
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .maybeSingle();

    if (queryErr) {
      return NextResponse.json({ success: false, error: queryErr.message }, { status: 500 });
    }

    let visits = 1;
    let isNew = false;

    if (!existingCustomer) {
      isNew = true;
      const { error: insErr } = await admin
        .from('customers')
        .insert({
          tenant_id: tenantId,
          phone,
          name: 'Storefront Guest',
          total_visits: 1,
          total_spent: 0,
          last_visit_at: new Date().toISOString()
        });
      if (insErr) {
        return NextResponse.json({ success: false, error: insErr.message }, { status: 500 });
      }
    } else {
      visits = (existingCustomer.total_visits || 0) + 1;
      const { error: updErr } = await admin
        .from('customers')
        .update({
          total_visits: visits,
          last_visit_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id);
      if (updErr) {
        return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
      }
    }

    // Log notification for Store Admin and Staff POS
    const { error: notifErr } = await admin
      .from('notification_log')
      .insert({
        tenant_id: tenantId,
        type: 'customer_checkin',
        title: isNew ? 'New Customer Registered' : 'Customer Checked In',
        body: `Customer with phone number ${phone} checked in on the digital menu (Visit #${visits}).`,
        read: false
      });

    if (notifErr) {
      console.error('Failed to insert notification log:', notifErr.message);
    }

    // Fetch tenant's public_id
    const { data: tenantObj } = await admin
      .from('tenants')
      .select('public_id')
      .eq('id', tenantId)
      .maybeSingle();

    return NextResponse.json({ success: true, phone, visits, publicId: tenantObj?.public_id || null });
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
      maxAge: 86400, // 24 hours in seconds
      path: '/',
      httpOnly: false, // Accessible to storefront client
      sameSite: 'strict'
    });

    if (tenantId) {
      cookieStore.set('customer_tenant_id', tenantId, {
        maxAge: 86400, // 24 hours in seconds
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
      let visits = 1;
      if (!existingCustomer) {
        isNew = true;
        // Create new customer profile
        await admin
          .from('customers')
          .insert({
            tenant_id: tenantId,
            phone,
            name: 'Storefront Guest',
            total_visits: 1,
            total_spent: 0,
            last_visit_at: new Date().toISOString()
          });
      } else {
        visits = (existingCustomer.total_visits || 0) + 1;
        // Increment visit count
        await admin
          .from('customers')
          .update({
            total_visits: visits,
            last_visit_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id);
      }

      // Log notification for Store Admin and Staff POS
      await admin
        .from('notification_log')
        .insert({
          tenant_id: tenantId,
          type: 'customer_checkin',
          title: isNew ? 'New Customer Registered' : 'Customer Checked In',
          body: `Customer with phone number ${phone} checked in on the digital menu (Visit #${visits}).`,
          read: false
        });
    }

    return NextResponse.json({ success: true, phone });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
