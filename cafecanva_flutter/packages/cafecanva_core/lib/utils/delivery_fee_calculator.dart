int calculateDeliveryFeePaise(int subtotalPaise) {
  if (subtotalPaise >= 49900) return 0;       // ₹499+ → Free Delivery
  if (subtotalPaise >= 30000) return 4900;    // ₹300–₹498 → ₹49
  return 6900;                                // Below ₹300 → ₹69
}
