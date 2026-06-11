import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

/// Manages Supabase Realtime subscriptions for live data updates.
class RealtimeService {
  static final RealtimeService instance = RealtimeService._internal();
  RealtimeService._internal();

  final Map<String, RealtimeChannel> _channels = {};

  /// Subscribe POS to real-time table status changes within a branch
  RealtimeChannel subscribeToTableChanges({
    required String branchId,
    required void Function(PostgresChangePayload payload) onTableUpdated,
  }) {
    final key = 'tables:branch:$branchId';
    _channels[key]?.unsubscribe();

    final channel = SupabaseService.client
        .channel(key)
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'tables',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'location_id',
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

    var channel = SupabaseService.client.channel(key);

    // Apply branch isolation filter on Order insertions
    channel = channel.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'orders',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'location_id',
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

  /// Subscribe staff to active "Call Waiter" requests in a branch and private broadcasts
  RealtimeChannel subscribeToStaffCalls({
    required String branchId,
    required String tenantId,
    required void Function(Map<String, dynamic> record) onCallReceived,
  }) {
    final key = 'private-calls:$tenantId:$branchId';
    _channels[key]?.unsubscribe();

    final channel = SupabaseService.client
        .channel(key)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'staff_calls',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'location_id',
            value: branchId,
          ),
          callback: (payload) {
            onCallReceived(payload.newRecord);
          },
        )
        .onBroadcast(
          event: 'staff_call_relay',
          callback: (payload) {
            onCallReceived(payload);
          },
        )
        .onBroadcast(
          event: 'forward_call',
          callback: (payload) {
            final Map<String, dynamic> forwarded = Map<String, dynamic>.from(payload);
            forwarded['is_forwarded'] = true;
            onCallReceived(forwarded);
          },
        )
        .subscribe();

    _channels[key] = channel;
    return channel;
  }

  /// Subscribe staff to active notification logs for a tenant
  RealtimeChannel subscribeToNotifications({
    required String tenantId,
    required void Function(PostgresChangePayload payload) onNotificationReceived,
  }) {
    final key = 'notifications:tenant:$tenantId';
    _channels[key]?.unsubscribe();

    final channel = SupabaseService.client
        .channel(key)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notification_log',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'tenant_id',
            value: tenantId,
          ),
          callback: onNotificationReceived,
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
