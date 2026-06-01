import '../models/models.dart';
import '../supabase/supabase_service.dart';

class OrderRepository {
  final _client = SupabaseService.instance.client;

  /// Fetch active orders for a branch, optionally filtered by status
  Future<List<OrderModel>> fetchOrders(String branchId, {String? status}) async {
    var query = _client.from('orders').select().eq('branch_id', branchId);
    
    if (status != null) {
      query = query.eq('status', status);
    }
    
    final response = await query.order('created_at', ascending: false);
    final List<OrderModel> orders = [];
    
    for (final o in response as List) {
      final List<dynamic> itemsRes = await _client
          .from('order_items')
          .select()
          .eq('order_id', o['id']);
      
      final items = itemsRes.map((i) => OrderItemModel.fromJson(i)).toList();
      orders.add(OrderModel.fromJson(o, items));
    }
    
    return orders;
  }

  /// Create order along with nested order items inside a transaction
  Future<OrderModel> createOrder({
    required String tenantId,
    required String branchId,
    String? tableId,
    String? customerId,
    required int subtotal,
    required int discountAmount,
    required int total,
    String? notes,
    required List<Map<String, dynamic>> itemsData,
  }) async {
    // 1. Create order
    final orderRes = await _client.from('orders').insert({
      'tenant_id': tenantId,
      'branch_id': branchId,
      'table_id': tableId,
      'customer_id': customerId,
      'status': 'pending',
      'subtotal': subtotal,
      'discount_amount': discountAmount,
      'total': total,
      'notes': notes,
    }).select().single();

    final orderId = orderRes['id'] as String;

    // 2. Insert items
    final List<Map<String, dynamic>> itemsToInsert = [];
    for (final item in itemsData) {
      itemsToInsert.add({
        'order_id': orderId,
        'menu_item_id': item['menuItemId'],
        'item_name': item['itemName'],
        'unit_price': item['unitPrice'],
        'quantity': item['quantity'],
        'modifier_selections': item['modifierSelections'] ?? [],
        'item_notes': item['itemNotes'],
      });
    }

    final itemsRes = await _client.from('order_items').insert(itemsToInsert).select();
    final items = (itemsRes as List).map((i) => OrderItemModel.fromJson(i)).toList();

    // 3. Update table status if dine-in
    if (tableId != null) {
      await _client.from('tables').update({'status': 'occupied'}).eq('id', tableId);
    }

    return OrderModel.fromJson(orderRes, items);
  }

  /// Update the high-level order state (pending -> preparing -> ready -> served)
  Future<void> updateOrderStatus(String orderId, String status) async {
    await _client.from('orders').update({'status': status}).eq('id', orderId);
  }

  /// Update KDS-specific food item statuses
  Future<void> updateOrderItemKdsStatus(String orderItemId, String status) async {
    await _client.from('order_items').update({'kds_status': status}).eq('id', orderItemId);
  }

  /// Fetch order items meant for kitchen displays
  Future<List<OrderItemModel>> fetchOrderItemsForKds(String branchId) async {
    final response = await _client
        .from('order_items')
        .select('*, orders(branch_id)')
        .eq('orders.branch_id', branchId)
        .order('created_at', ascending: true);

    return (response as List).map((i) => OrderItemModel.fromJson(i)).toList();
  }
}
