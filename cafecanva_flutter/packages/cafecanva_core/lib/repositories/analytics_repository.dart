import '../services/supabase_service.dart';
import '../utils/date_formatter.dart';

/// Repository for dashboard analytics and reporting.
class AnalyticsRepository {
  AnalyticsRepository._();

  /// Get dashboard summary: today's revenue, order count, table occupancy.
  static Future<Map<String, dynamic>> getDashboardSummary(String tenantId, String branchId) async {
    final today = DateFormatter.startOfTodayIso();

    // Today's orders
    final ordersData = await SupabaseService.from('orders')
        .select('id, total, status')
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .gte('created_at', today);

    final orders = ordersData as List;
    final totalRevenue = orders
        .where((o) => o['status'] == 'paid')
        .fold<int>(0, (sum, o) => sum + (o['total'] as int));
    final orderCount = orders.length;
    final paidCount = orders.where((o) => o['status'] == 'paid').length;

    // Table occupancy
    final tablesData = await SupabaseService.from('tables')
        .select('id, status')
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .is_('deleted_at', null);

    final tables = tablesData as List;
    final occupiedCount = tables.where((t) => t['status'] == 'occupied').length;
    final totalTables = tables.length;

    return {
      'total_revenue': totalRevenue,
      'order_count': orderCount,
      'paid_count': paidCount,
      'occupied_tables': occupiedCount,
      'total_tables': totalTables,
      'occupancy_percent': totalTables > 0 ? (occupiedCount * 100 / totalTables).round() : 0,
    };
  }

  /// Get top-selling items.
  static Future<List<Map<String, dynamic>>> getTopItems(
    String tenantId, String branchId, {int limit = 10}
  ) async {
    // This would ideally be a DB function/view, but we can aggregate client-side
    final today = DateFormatter.startOfWeekIso();
    final ordersData = await SupabaseService.from('orders')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .eq('status', 'paid')
        .gte('created_at', today);

    final orderIds = (ordersData as List).map((o) => o['id'] as String).toList();
    if (orderIds.isEmpty) return [];

    final itemsData = await SupabaseService.from('order_items')
        .select('item_name, quantity, unit_price')
        .inFilter('order_id', orderIds);

    // Aggregate by item name
    final Map<String, Map<String, dynamic>> aggregated = {};
    for (final item in itemsData as List) {
      final name = item['item_name'] as String;
      if (!aggregated.containsKey(name)) {
        aggregated[name] = {'name': name, 'total_qty': 0, 'total_revenue': 0};
      }
      aggregated[name]!['total_qty'] = (aggregated[name]!['total_qty'] as int) + (item['quantity'] as int);
      aggregated[name]!['total_revenue'] = (aggregated[name]!['total_revenue'] as int) +
          (item['unit_price'] as int) * (item['quantity'] as int);
    }

    final sorted = aggregated.values.toList()
      ..sort((a, b) => (b['total_qty'] as int).compareTo(a['total_qty'] as int));

    return sorted.take(limit).toList();
  }

  /// Get revenue chart data (daily for the last 7 days).
  static Future<List<Map<String, dynamic>>> getRevenueChart(
    String tenantId, String branchId,
  ) async {
    final weekAgo = DateFormatter.startOfWeekIso();
    final data = await SupabaseService.from('bills')
        .select('total, created_at')
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .eq('status', 'paid')
        .gte('created_at', weekAgo)
        .order('created_at');

    // Group by date
    final Map<String, int> daily = {};
    for (final bill in data as List) {
      final date = DateTime.parse(bill['created_at'] as String).toLocal();
      final key = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      daily[key] = (daily[key] ?? 0) + (bill['total'] as int);
    }

    return daily.entries.map((e) => {'date': e.key, 'revenue': e.value}).toList();
  }
}
