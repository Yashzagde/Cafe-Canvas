import 'dart:convert';
import '../models/bill.dart';
import '../services/supabase_service.dart';
import '../utils/constants.dart';

/// Repository for billing operations (edge functions + DB queries).
class BillingRepository {
  BillingRepository._();
  BillingRepository();

  Future<void> settleBillDirect({
    required String billId,
    required String paymentMethod,
  }) => recordPayment(billId: billId, paymentMethod: paymentMethod);


  /// Generate a bill via the generate-bill edge function.
  static Future<Bill> generateBill({
    required String tableId,
    required String tenantId,
    required String branchId,
    required String createdBy,
  }) async {
    final response = await SupabaseService.invokeFunction(
      CafeCanvaConstants.edgeFnGenerateBill,
      body: {
        'tableId': tableId,
        'tenantId': tenantId,
        'branchId': branchId,
        'createdBy': createdBy,
      },
    );

    final json = jsonDecode(response.data as String) as Map<String, dynamic>;
    if (json.containsKey('error')) {
      throw Exception(json['error']);
    }
    return Bill.fromJson(json['bill'] as Map<String, dynamic>);
  }

  /// Record a payment (cash/card/UPI).
  static Future<void> recordPayment({

  /// Save a draft of bill items for a table (locally).
  static Future<void> saveDraftBillItems(String tableId, List<Map<String, dynamic>> items) async {
    // Store draft cart in Hive under 'drafts' box keyed by tableId.
    final box = await Hive.openBox('drafts');
    await box.put(tableId, items);
  }

  /// Load draft bill items for a table.
  static Future<List<Map<String, dynamic>>?> loadDraftBillItems(String tableId) async {
    final box = await Hive.openBox('drafts');
    return box.get(tableId) as List<Map<String, dynamic>>?;
  }

  static Future<void> recordPayment({
    required String billId,
    required String paymentMethod,
  }) async {
    await SupabaseService.from('bills').update({
      'status': 'paid',
      'payment_method': paymentMethod,
      'paid_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', billId);
  }

  /// Verify a Razorpay payment via edge function.
  static Future<bool> verifyRazorpayPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    required String billId,
    required String tenantId,
  }) async {
    final response = await SupabaseService.invokeFunction(
      CafeCanvaConstants.edgeFnVerifyPayment,
      body: {
        'razorpay_order_id': razorpayOrderId,
        'razorpay_payment_id': razorpayPaymentId,
        'razorpay_signature': razorpaySignature,
        'billId': billId,
        'tenantId': tenantId,
      },
    );

    final json = jsonDecode(response.data as String) as Map<String, dynamic>;
    return json['valid'] == true;
  }

  /// Get bill history for a branch.
  static Future<List<Bill>> getBillHistory(
    String tenantId, String branchId, {
    String? fromDate,
    String? toDate,
    String? paymentMethod,
  }) async {
    var query = SupabaseService.from('bills')
        .select()
        .eq('tenant_id', tenantId)
        .eq('location_id', branchId)
        .eq('status', 'paid');
    if (fromDate != null) query = query.gte('created_at', fromDate);
    if (toDate != null) query = query.lte('created_at', toDate);
    if (paymentMethod != null) query = query.eq('payment_method', paymentMethod);
    final data = await query.order('created_at', ascending: false);
    return (data as List).map((e) => Bill.fromJson(e)).toList();
  }

  /// Get a single bill by ID.
  static Future<Bill?> getBill(String billId) async {
    final data = await SupabaseService.from('bills')
        .select()
        .eq('id', billId)
        .maybeSingle();
    if (data == null) return null;
    return Bill.fromJson(data);
  }

  /// Get open bill for a table.
  static Future<Bill?> getOpenBillForTable(String tableId) async {
    final data = await SupabaseService.from('bills')
        .select()
        .eq('table_id', tableId)
        .eq('status', 'open')
        .maybeSingle();
    if (data == null) return null;
    return Bill.fromJson(data);
  }
}
