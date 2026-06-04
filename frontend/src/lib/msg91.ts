// @ts-nocheck
/**
 * MSG91 Flow and Messaging Integration Helper
 */

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_FLOW_URL = 'https://control.msg91.com/api/v5/flow/';

interface SendFlowParams {
  templateId: string;
  phone: string; // E.g., "919876543210" or "9876543210"
  variables: Record<string, string>;
}

/**
 * Low-level utility to send a message via MSG91 Flow API.
 */
export async function sendMsg91Flow({ templateId, phone, variables }: SendFlowParams): Promise<boolean> {
  // Ensure phone has country code prefix if not already present (defaulting to 91 for India)
  let formattedPhone = phone.trim().replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  console.log(`[MSG91 Send Request] Template: ${templateId}, Phone: ${formattedPhone}, Vars:`, variables);

  if (!MSG91_AUTH_KEY) {
    console.warn('⚠️ MSG91_AUTH_KEY is not set. Simulating message dispatch in development/test mode.');
    return true;
  }

  try {
    const response = await fetch(MSG91_FLOW_URL, {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        recipients: [
          {
            mobiles: formattedPhone,
            ...variables,
          },
        ],
      }),
    });

    const result = await response.json();
    if (response.ok && result.type === 'success') {
      console.log(`[MSG91 Success] Message sent successfully to ${formattedPhone}`);
      return true;
    } else {
      console.error(`[MSG91 Error Response]`, result);
      return false;
    }
  } catch (error) {
    console.error(`[MSG91 Connection Exception] Failed to reach API:`, error);
    return false;
  }
}

/**
 * Send WhatsApp welcome notification to a newly approved Tenant Owner.
 */
export async function sendTenantWelcomeWhatsApp(params: {
  phone: string;
  ownerName: string;
  businessName: string;
  subdomain: string;
  passwordText: string;
  email: string;
}): Promise<boolean> {
  const templateId = process.env.MSG91_TENANT_WELCOME_TEMPLATE_ID || 'tenant_welcome_flow';
  return sendMsg91Flow({
    templateId,
    phone: params.phone,
    variables: {
      owner_name: params.ownerName,
      business_name: params.businessName,
      login_url: `https://app.cafecanvas.bar/admin/login`,
      store_url: `https://${params.subdomain}.cafecanvas.bar`,
      email: params.email,
      password: params.passwordText,
    },
  });
}

/**
 * Send WhatsApp welcome notification to a newly created Staff Member.
 */
export async function sendStaffWelcomeWhatsApp(params: {
  phone: string;
  staffName: string;
  businessName: string;
  pinCode: string;
}): Promise<boolean> {
  const templateId = process.env.MSG91_STAFF_WELCOME_TEMPLATE_ID || 'staff_welcome_flow';
  return sendMsg91Flow({
    templateId,
    phone: params.phone,
    variables: {
      staff_name: params.staffName,
      business_name: params.businessName,
      download_url: 'https://link.cafecanvas.bar',
      username: params.phone,
      pin_code: params.pinCode,
    },
  });
}

/**
 * Send 6-digit verification OTP to customer for Storefront login.
 */
export async function sendCustomerOtpWhatsApp(params: {
  phone: string;
  otp: string;
  businessName: string;
}): Promise<boolean> {
  const templateId = process.env.MSG91_CUSTOMER_OTP_TEMPLATE_ID || 'customer_otp_flow';
  return sendMsg91Flow({
    templateId,
    phone: params.phone,
    variables: {
      otp_code: params.otp,
      business_name: params.businessName,
    },
  });
}

/**
 * Broadcast dynamic offer text to customer.
 */
export async function sendCustomerOfferWhatsApp(params: {
  phone: string;
  customerName: string;
  businessName: string;
  offerText: string;
}): Promise<boolean> {
  const templateId = process.env.MSG91_CUSTOMER_OFFER_TEMPLATE_ID || 'customer_offer_flow';
  return sendMsg91Flow({
    templateId,
    phone: params.phone,
    variables: {
      customer_name: params.customerName,
      business_name: params.businessName,
      offer_text: params.offerText,
    },
  });
}
