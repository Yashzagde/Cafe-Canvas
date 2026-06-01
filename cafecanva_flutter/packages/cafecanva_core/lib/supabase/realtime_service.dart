import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class RealtimeService {
  static final RealtimeService instance = RealtimeService._internal();
  RealtimeService._internal();

  final _client = SupabaseService.instance.client;
  final Map<String, RealtimeChannel> _channels = {};

  /// Subscribe POS to real-time table status changes within a branch
  RealtimeChannel subscribeToTableChanges({
    required String branchId,
    required void Function(PostgresChangePayload payload) onTableUpdated,
  }) {
    final key = 'tables:branch:$branchId';
    _channels[key]?.unsubscribe();

    final channel = _client
        .channel(key)
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

    _channels[key] = channel;
    return channel;
  }

  /// Subscribe KDS to new orders and kitchen-order-item status changes
  RealtimeChannel subscribeToKitchenOrders({
    required String branchId,
    required void Function(PostgresChangePayload payload) onOrderCreated,
    required void Function(PostgresChangePayload payload) onOrderItemUpdated,
  }) {
    final key = 'kds:branch:$branchId';
    _channels[key]?.unsubscribe();

    var channel = _client.channel(key);

    // Blocker 3: Apply strict branch isolation filter on Order insertions
    channel = channel.onPostgresChanges(
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

    // Apply branch isolation filter on Order Item modifications
    channel = channel.onPostgresChanges(
      event: PostgresChangeEvent.update,
      schema: 'public',
      table: 'order_items',
      callback: onOrderItemUpdated,
    );

    channel.subscribe();
    _channels[key] = channel;
    return channel;
  }

  /// Subscribe staff to active "Call Waiter" requests in a branch
  RealtimeChannel subscribeToStaffCalls({
    required String branchId,
    required void Function(PostgresChangePayload payload) onCallReceived,
  }) {
    final key = 'calls:branch:$branchId';
    _channels[key]?.unsubscribe();

    final channel = _client
        .channel(key)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'staff_calls',
          filter: PostgresChangeFilter(
            type: FilterType.eq,
            column: 'branch_id', // Blocker 3: Enforce branch filter rather than tenant
            value: branchId,
          ),
          callback: onCallReceived,
        )
        .subscribe();

    _channels[key] = channel;
    return channel;
  }

  /// Tear down all active channels to clean memory
  void dispose() {
    for (final channel in _channels.values) {
      channel.unsubscribe();
    }
    _channels.clear();
  }

  void unsubscribeAll() {
    dispose();
  }
}
