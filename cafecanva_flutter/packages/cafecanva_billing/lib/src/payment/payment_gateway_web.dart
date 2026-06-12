import 'package:url_launcher/url_launcher.dart';
import 'payment_gateway.dart';

class WebPaymentGateway implements PaymentGateway {
  @override
  Future<void> payWithRazorpay({
    required String razorpayOrderId,
    required String keyId,
    required int amountInPaise,
    required String storeName,
    required String customerName,
    required String customerPhone,
    required String themeColor,
  }) async {
    final checkoutUrl = 'https://order.cafecanva.com/payment/checkout'
        '?order_id=$razorpayOrderId'
        '&key=$keyId'
        '&amount=$amountInPaise'
        '&name=${Uri.encodeComponent(storeName)}'
        '&phone=$customerPhone';

    final uri = Uri.parse(checkoutUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw Exception('Could not launch Razorpay Web Checkout URL');
    }
  }

  @override
  Future<void> payWithTerminal({
    required String gateway,
    required String merchantId,
    required String terminalId,
    required int amountInPaise,
  }) async {
    // Web mock connection to terminal
    await Future.delayed(const Duration(seconds: 2));
    print('Web payment machine mock: Settle INR ${amountInPaise / 100} on $gateway terminal (MID: $merchantId, TID: $terminalId)');
  }
}
