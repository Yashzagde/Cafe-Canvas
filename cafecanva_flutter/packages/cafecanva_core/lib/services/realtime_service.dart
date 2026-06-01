import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

/// Manages Supabase Realtime subscriptions for live data updates.
class RealtimeService {
  RealtimeService._();

  static final Map<String, RealtimeChannel> _channels = {};

  /// Subscribe to table status changes for a branch.
  static RealtimeChannel watchTables({
    required String branchId,
    required void Function(Map<String, dynamic> payload) onUpdate,
  }) {
    final channelName = 'tables-$branchId';
    _removeIfExists(channelName);

    final channel = SupabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'tables',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'branch_id',
            value: branchId,
          ),
          callback: (PostgresChangePayload payload) {
            onUpdate(payload.newRecord);
          },
        )
        .subscribe();

    _channels[channelName] = channel;
    return channel;
  }

  /// Subscribe to new orders and order item status changes for a branch.
  static RealtimeChannel watchOrders({
    required String branchId,
    required void Function(Map<String, dynamic> payload, String event) onChange,
  }) {
    final channelName = 'orders-$branchId';
    _removeIfExists(channelName);

    final channel = SupabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'orders',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'branch_id',
            value: branchId,
          ),
          callback: (PostgresChangePayload payload) {
            onChange(payload.newRecord, 'INSERT');
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'orders',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'branch_id',
            value: branchId,
          ),
          callback: (PostgresChangePayload payload) {
            onChange(payload.newRecord, 'UPDATE');
          },
        )
        .subscribe();

    _channels[channelName] = channel;
    return channel;
  }

  /// Subscribe to order item KDS status changes.
  static RealtimeChannel watchOrderItems({
    required void Function(Map<String, dynamic> payload, String event) onItemChange,
  }) {
    const channelName = 'order-items-kds';
    _removeIfExists(channelName);

    final channel = SupabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'order_items',
          callback: (PostgresChangePayload payload) {
            onItemChange(payload.newRecord, 'INSERT');
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'order_items',
          callback: (PostgresChangePayload payload) {
            onItemChange(payload.newRecord, 'UPDATE');
          },
        )
        .subscribe();

    _channels[channelName] = channel;
    return channel;
  }

  /// Subscribe to new staff calls for a branch.
  static RealtimeChannel watchStaffCalls({
    required String branchId,
    required void Function(Map<String, dynamic> payload) onNewCall,
  }) {
    final channelName = 'staff-calls-$branchId';
    _removeIfExists(channelName);

    final channel = SupabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'staff_calls',
          callback: (PostgresChangePayload payload) {
            onNewCall(payload.newRecord);
          },
        )
        .subscribe();

    _channels[channelName] = channel;
    return channel;
  }

  /// Subscribe to bill changes for a branch.
  static RealtimeChannel watchBills({
    required String branchId,
    required void Function(Map<String, dynamic> payload, String event) onBillChange,
  }) {
    final channelName = 'bills-$branchId';
    _removeIfExists(channelName);

    final channel = SupabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'bills',
          callback: (PostgresChangePayload payload) {
            onBillChange(payload.newRecord, 'INSERT');
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'bills',
          callback: (PostgresChangePayload payload) {
            onBillChange(payload.newRecord, 'UPDATE');
          },
        )
        .subscribe();

    _channels[channelName] = channel;
    return channel;
  }

  /// Unsubscribe from a specific channel.
  static Future<void> unsubscribe(String channelName) async {
    final channel = _channels.remove(channelName);
    if (channel != null) {
      await SupabaseService.removeChannel(channel);
    }
  }

  /// Unsubscribe from all channels.
  static Future<void> unsubscribeAll() async {
    for (final channel in _channels.values) {
      await SupabaseService.removeChannel(channel);
    }
    _channels.clear();
  }

  static void _removeIfExists(String channelName) {
    final existing = _channels.remove(channelName);
    if (existing != null) {
      SupabaseService.removeChannel(existing);
    }
  }
}
