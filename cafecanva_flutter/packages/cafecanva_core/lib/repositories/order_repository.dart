import '../models/order.dart';
import '../models/order_item.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';
import '../services/offline_sync_service.dart';

/// Repository for creating/managing orders.
class OrderRepository {
  OrderRepository._();
  OrderRepository();

  Future<List<Order>> fetchOrders(String branchId) {
    final tId = AuthService.tenantId ?? 'demo-tenant-5555';
    return getAllOrders(tId, branchId);
  }

  Future<void> updateOrderItemKdsStatus(String itemId, String kdsStatus) {
    return OrderRepository.updateItemKdsStatus(itemId, kdsStatus);
  }

  Future<Order> createOrder({
    required String tenantId,
    required String branchId,
    String? tableId,
    String? customerId,
    int? subtotal,
    int? discountAmount,
    int? total,
    String? notes,
    required List<Map<String, dynamic>> itemsData,
  }) {
    return OrderRepository.staticCreateOrder(
      tenantId: tenantId,
      branchId: branchId,
      tableId: tableId,
      createdBy: 'customer',
      items: itemsData,
      notes: notes,
      subtotal: subtotal ?? 0,
      total: total ?? 0,
    );
  }

  /// Create a new order with items. Returns the created order.
  static Future<Order> staticCreateOrder({
    required String tenantId,
    required String branchId,
    String? tableId,
    String? createdBy,
    required List<Map<String, dynamic>> items,
    String? notes,
    int subtotal = 0,
    int total = 0,
  }) async {
    try {
      // 1. Insert the order
      final orderData = await SupabaseService.from('orders')
          .insert({
            'tenant_id': tenantId,
            'location_id': branchId,
            'table_id': tableId,
            'staff_id': createdBy,
            'status': 'pending',
            'subtotal': subtotal,
            'discount_amount': 0,
            'total': total,
            'notes': notes,
          })
          .select()
          .single();

      final order = Order.fromJson(orderData);

      // 2. Insert order items
      final itemsPayload = items.map((item) => {
            ...item,
            'order_id': order.id,
            'tenant_id': tenantId,
          }).toList();

      await SupabaseService.from('order_items').insert(itemsPayload);

      // 3. Set table status to occupied
      if (tableId != null) {
        await SupabaseService.from('tables')
            .update({'status': 'occupied'})
            .eq('id', tableId);
      }

      return order;
    } catch (e) {
      // If we are already running inside the sync routine (keys start with "offline_"), rethrow to let the sync queue retry later.
      final isOfflineSync = createdBy != null && createdBy.startsWith('offline_');
      if (!isOfflineSync) {
        await OfflineSyncService.instance.queueOrder(
          tenantId: tenantId,
          branchId: branchId,
          tableId: tableId,
          createdBy: createdBy,
          items: items,
          notes: notes,
          subtotal: subtotal,
          total: total,
        );

        return Order(
          id: 'offline_temp_${DateTime.now().millisecondsSinceEpoch}',
          tenantId: tenantId,
          branchId: branchId,
          tableId: tableId,
          status: 'pending',
          subtotal: subtotal,
          total: total,
          notes: notes,
          createdBy: createdBy,
          createdAt: DateTime.now(),
        );
      }
      rethrow;
    }
  }

  /// Get active orders for a branch.
  static Future<List<Order>> getActiveOrders(String tenantId, String branchId) async {
    final data = await SupabaseService.from('orders')
        .select()
        .eq('tenant_id', tenantId)
        .eq('location_id', branchId)
        .inFilter('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'])
        .order('created_at', ascending: false);

    return (data as List).map((e) => Order.fromJson(e)).toList();
  }

  /// Get order items for a specific order.
  static Future<List<OrderItem>> getOrderItems(String orderId) async {
    final data = await SupabaseService.from('order_items')
        .select()
        .eq('order_id', orderId);
    return (data as List).map((e) => OrderItem.fromJson(e)).toList();
  }

  /// Get order items for multiple orders.
  static Future<List<OrderItem>> getOrderItemsBatch(List<String> orderIds) async {
    if (orderIds.isEmpty) return [];
    final data = await SupabaseService.from('order_items')
        .select()
        .inFilter('order_id', orderIds);
    return (data as List).map((e) => OrderItem.fromJson(e)).toList();
  }

  /// Update order status.
  static Future<void> updateOrderStatus(String orderId, String status) async {
    await SupabaseService.from('orders')
        .update({
          'status': status,
          'updated_at': DateTime.now().toUtc().toIso8601String(),
        })
        .eq('id', orderId);
  }

  /// Update an order item's KDS status.
  static Future<void> updateItemKdsStatus(String itemId, String kdsStatus) async {
    await SupabaseService.from('order_items')
        .update({'kds_status': kdsStatus})
        .eq('id', itemId);
  }

  /// Get orders for a specific table.
  static Future<List<Order>> getTableOrders(String tableId) async {
    final data = await SupabaseService.from('orders')
        .select()
        .eq('table_id', tableId)
        .not('status', 'in', '("cancelled","paid")')
        .order('created_at', ascending: false);
    return (data as List).map((e) => Order.fromJson(e)).toList();
  }

  /// Get all orders (with date filter for admin).
  static Future<List<Order>> getAllOrders(
    String tenantId, String branchId, {
    String? fromDate,
    String? toDate,
    String? status,
  }) async {
    var query = SupabaseService.from('orders')
        .select()
        .eq('tenant_id', tenantId)
        .eq('location_id', branchId);
    if (status != null) query = query.eq('status', status);
    if (fromDate != null) query = query.gte('created_at', fromDate);
    if (toDate != null) query = query.lte('created_at', toDate);
    final data = await query.order('created_at', ascending: false);
    return (data as List).map((e) => Order.fromJson(e)).toList();
  }
}
