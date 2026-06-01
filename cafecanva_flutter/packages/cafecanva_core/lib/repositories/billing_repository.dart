import '../models/models.dart';
import '../supabase/supabase_service.dart';

class BillingRepository {
  final _client = SupabaseService.instance.client;
  final _supabaseService = SupabaseService.instance;

  Future<List<BillModel>> fetchBills(String branchId, {String? status}) async {
    var query = _client.from('bills').select().eq('branch_id', branchId);

    if (status != null) {
      query = query.eq('status', status);
    }

    final response = await query.order('created_at', ascending: false);
    return (response as List).map((b) => BillModel.fromJson(b)).toList();
  }

  Future<BillModel?> fetchBillById(String id) async {
    final response = await _client
        .from('bills')
        .select()
        .eq('id', id)
        .maybeSingle();

    if (response != null) {
      return BillModel.fromJson(response);
    }
    return null;
  }

  /// Triggers the backend Edge Function to aggregate active orders for a table
  /// and generate a consolidated bill.
  Future<BillModel> generateBill({
    required String tableId,
    required String tenantId,
    required String branchId,
    required String createdBy,
  }) async {
    final result = await _supabaseService.generateBill(
      tableId: tableId,
      tenantId: tenantId,
      branchId: branchId,
      createdBy: createdBy,
    );

    if (result['success'] == true && result['bill'] != null) {
      return BillModel.fromJson(result['bill'] as Map<String, dynamic>);
    } else {
      throw Exception(result['error'] ?? 'Failed to generate table bill');
    }
  }

  /// Verifies a Razorpay payment transaction signature via secure backend validation.
  Future<bool> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    required String billId,
    required String tenantId,
  }) async {
    final result = await _supabaseService.verifyPayment(
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      billId: billId,
      tenantId: tenantId,
    );

    return result['success'] == true;
  }

  /// Settles a bill directly with Cash/Card at the counter
  Future<BillModel> settleBillDirect({
    required String billId,
    required String paymentMethod,
  }) async {
    final response = await _client
        .from('bills')
        .update({
          'status': 'paid',
          'payment_method': paymentMethod,
          'paid_at': DateTime.now().toIso8601String(),
        })
        .eq('id', billId)
        .select()
        .single();

    final bill = BillModel.fromJson(response);

    // Free the table as well on full direct settlement
    if (bill.tableId != null) {
      await _client.from('tables').update({'status': 'available'}).eq('id', bill.tableId!);
    }

    return bill;
  }
}
