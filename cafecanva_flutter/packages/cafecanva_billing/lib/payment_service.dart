import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cafecanva_core/cafecanva_core.dart';

class PaymentService {
  static final PaymentService instance = PaymentService._internal();
  PaymentService._internal();

  late Razorpay _razorpay;
  void Function(PaymentSuccessResponse)? _onSuccess;
  void Function(PaymentFailureResponse)? _onFailure;

  void initialize({
    required void Function(PaymentSuccessResponse) onSuccess,
    required void Function(PaymentFailureResponse) onFailure,
  }) {
    // Only instantiate the native SDK on physical mobile targets
    if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
      _razorpay = Razorpay();
      _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse res) {
        _onSuccess?.call(res);
      });
      _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse res) {
        _onFailure?.call(res);
      });
    }
    _onSuccess = onSuccess;
    _onFailure = onFailure;
  }

  /// Launch Razorpay payments flow
  Future<void> payWithRazorpay({
    required String razorpayOrderId,
    required String keyId,
    required int amountInPaise,
    required String storeName,
    required String customerName,
    required String customerPhone,
    required String themeColor,
  }) async {
    // If not mobile, use web checkouts fallback URL
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
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
      return;
    }

    // Native Mobile Integration
    final options = {
      'key': keyId,
      'amount': amountInPaise, // Paise
      'currency': 'INR',
      'order_id': razorpayOrderId,
      'name': storeName,
      'description': 'CafeCanva Table Order Invoice',
      'prefill': {
        'contact': customerPhone,
        'name': customerName,
      },
      'theme': {
        'color': themeColor,
      }
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      throw Exception('Failed to initialize Razorpay native interface: $e');
    }
  }

  void dispose() {
    if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
      _razorpay.clear();
    }
  }
}
