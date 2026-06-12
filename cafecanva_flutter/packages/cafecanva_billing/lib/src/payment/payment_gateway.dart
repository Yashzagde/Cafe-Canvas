abstract class PaymentGateway {
  Future<void> payWithRazorpay({
    required String razorpayOrderId,
    required String keyId,
    required int amountInPaise,
    required String storeName,
    required String customerName,
    required String customerPhone,
    required String themeColor,
  });

  Future<void> payWithTerminal({
    required String gateway,
    required String merchantId,
    required String terminalId,
    required int amountInPaise,
  });
}
