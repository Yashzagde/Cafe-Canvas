import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final SupabaseService instance = SupabaseService._internal();

  SupabaseService._internal();

  late final SupabaseClient client;

  Future<void> initialize({required String url, required String anonKey}) async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
    client = Supabase.instance.client;
  }

  // --- Supabase Edge Functions ---

  /// Triggers waiters for support and enforces 2-minute cooldown
  Future<Map<String, dynamic>> callStaff({
    required String tableId,
    required String tenantId,
    required String tableNumber,
  }) async {
    try {
      final response = await client.functions.invoke(
        'call-staff',
        body: {
          'tableId': tableId,
          'tenantId': tenantId,
          'tableNumber': tableNumber,
        },
      );
      
      if (response.status == 200) {
        return {'success': true, 'data': response.data};
      } else {
        return {'success': false, 'error': response.data};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Aggregates all orders for a table, applies CGST + SGST + service charge and generates bill row
  Future<Map<String, dynamic>> generateBill({
    required String tableId,
    required String tenantId,
    required String branchId,
    required String createdBy,
  }) async {
    try {
      final response = await client.functions.invoke(
        'generate-bill',
        body: {
          'tableId': tableId,
          'tenantId': tenantId,
          'branchId': branchId,
          'createdBy': createdBy,
        },
      );

      if (response.status == 200) {
        return {'success': true, 'bill': response.data['bill']};
      } else {
        return {'success': false, 'error': response.data};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  /// Verifies Razorpay payments on the backend, updates bill + orders to paid, closes session
  Future<Map<String, dynamic>> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    required String billId,
    required String tenantId,
  }) async {
    try {
      final response = await client.functions.invoke(
        'verify-payment',
        body: {
          'razorpay_order_id': razorpayOrderId,
          'razorpay_payment_id': razorpayPaymentId,
          'razorpay_signature': razorpaySignature,
          'billId': billId,
          'tenantId': tenantId,
        },
      );

      if (response.status == 200 && response.data['valid'] == true) {
        return {'success': true};
      } else {
        return {'success': false, 'error': response.data['error'] ?? 'Invalid payment verification'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }
}
