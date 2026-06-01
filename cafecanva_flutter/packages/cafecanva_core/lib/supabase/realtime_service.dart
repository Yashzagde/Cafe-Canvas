import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class RealtimeService {
  static final RealtimeService instance = RealtimeService._internal();
  RealtimeService._internal();

  final _client = SupabaseService.instance.client;
  RealtimeChannel? _tablesChannel;
  RealtimeChannel? _kdsChannel;
  RealtimeChannel? _callsChannel;

  /// Subscribe POS to real-time table status changes within a branch
  void subscribeToTableChanges({
    required String branchId,
    required void Function(PostgresChangePayload payload) onTableUpdated,
  }) {
    _tablesChannel?.unsubscribe();
    _tablesChannel = _client
        .channel('tables-$branchId')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'tables',
          filter: PostgresChangeFilter(
            type: FilterType.eq,
            column: 'branch_id',
            value: branchId,
          ),
          callback: onTableUpdated,
        )
        .subscribe();
  }

  /// Subscribe KDS to new orders and kitchen-order-item status changes
  void subscribeToKitchenOrders({
    required String branchId,
    required void Function(PostgresChangePayload payload) onOrderCreated,
    required void Function(PostgresChangePayload payload) onOrderItemUpdated,
  }) {
    _kdsChannel?.unsubscribe();
    _kdsChannel = _client.channel('kds-$branchId');

    // Subscribe to new orders
    _kdsChannel = _kdsChannel!.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'orders',
      filter: PostgresChangeFilter(
        type: FilterType.eq,
        column: 'branch_id',
        value: branchId,
      ),
      callback: onOrderCreated,
    );

    // Subscribe to item-status updates
    _kdsChannel = _kdsChannel!.onPostgresChanges(
      event: PostgresChangeEvent.update,
      schema: 'public',
      table: 'order_items',
      callback: onOrderItemUpdated,
    );

    _kdsChannel!.subscribe();
  }

  /// Subscribe staff to active "Call Waiter" requests in a branch
  void subscribeToStaffCalls({
    required String branchId,
    required void Function(PostgresChangePayload payload) onCallReceived,
  }) {
    _callsChannel?.unsubscribe();
    _callsChannel = _client
        .channel('calls-$branchId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'staff_calls',
          filter: PostgresChangeFilter(
            type: FilterType.eq,
            column: 'tenant_id', // Note: we can filter by tenant or branch scope depending on hook claims
            value: branchId,
          ),
          callback: onCallReceived,
        )
        .subscribe();
  }

  /// Tear down all subscription streams during sign-out/disposal
  void unsubscribeAll() {
    _tablesChannel?.unsubscribe();
    _kdsChannel?.unsubscribe();
    _callsChannel?.unsubscribe();
    _tablesChannel = null;
    _kdsChannel = null;
    _callsChannel = null;
  }
}
