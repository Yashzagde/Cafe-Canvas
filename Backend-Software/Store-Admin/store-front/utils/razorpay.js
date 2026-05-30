/**
 * Razorpay Integration Utilities
 * Lazy-loads Razorpay SDK from CDN, creates orders, and verifies payments.
 */

let razorpayLoaded = false;

/** Lazy-load Razorpay SDK from CDN */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (razorpayLoaded && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { razorpayLoaded = true; resolve(true); };
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error("Razorpay SDK load timeout")), 10000);
  });
}

/** Create order via backend API */
export async function createOrder(cartData, customerData) {
  // In production, this calls the backend to create a Razorpay order
  // For now, return mock data
  const amount = cartData.total || 0;
  return {
    orderId: `ORD-${Date.now()}`,
    razorpayOrderId: `order_mock_${Date.now()}`,
    amount: amount * 100, // Razorpay uses paise
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo",
  };
}

/** Open Razorpay checkout modal */
export function openCheckout(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }
    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || "INR",
      order_id: options.razorpayOrderId,
      name: options.storeName || "Cafe Canvas",
      description: `Order #${options.orderId}`,
      image: options.logo || "",
      prefill: {
        name: options.customerName || "",
        contact: options.customerPhone || "",
      },
      theme: { color: "#F59E0B" },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) },
    });
    rzp.on("payment.failed", (response) => reject(response.error));
    rzp.open();
  });
}

/** Verify payment with backend */
export async function verifyPayment(paymentData) {
  // In production, POST to /api/orders/verify
  // Mock success for now
  return {
    success: true,
    orderId: paymentData.orderId,
    billData: {
      orderId: paymentData.orderId,
      paymentId: paymentData.razorpay_payment_id || `pay_mock_${Date.now()}`,
      items: paymentData.items || [],
      subtotal: paymentData.subtotal || 0,
      tax: paymentData.tax || 0,
      serviceCharge: paymentData.serviceCharge || 0,
      discount: paymentData.discount || 0,
      total: paymentData.total || 0,
      customerName: paymentData.customerName || "",
      orderType: paymentData.orderType || "dine_in",
      tableNumber: paymentData.tableNumber || "",
      timestamp: new Date().toISOString(),
      paymentMethod: "razorpay",
    },
  };
}
