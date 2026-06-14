import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'supabase_service.dart';
import '../models/order.dart';
import '../repositories/order_repository.dart';

/// Service to handle offline order queuing and synchronization.
class OfflineSyncService {
  static final OfflineSyncService instance = OfflineSyncService._internal();
  OfflineSyncService._internal();

  Box? _offlineBox;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _isSyncing = false;

  /// Initialize the service, open Hive box, and start connectivity listener.
  Future<void> initialize() async {
    _offlineBox = await Hive.openBox('offline_orders');
    
    // Listen for connectivity changes
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final hasConnection = results.any((r) => r != ConnectivityResult.none);
      if (hasConnection) {
        debugPrint('[OfflineSyncService] Network restored. Triggering sync...');
        syncPendingOrders();
      }
    });

    // Run initial sync check in case we start online
    syncPendingOrders();
  }

  /// Queue an order locally when offline.
  Future<void> queueOrder({
    required String tenantId,
    required String locationId,
    String? tableId,
    String? createdBy,
    required List<Map<String, dynamic>> items,
    String? notes,
    int subtotal = 0,
    int total = 0,
  }) async {
    if (_offlineBox == null) {
      _offlineBox = await Hive.openBox('offline_orders');
    }

    final String tempOrderId = 'offline_${DateTime.now().millisecondsSinceEpoch}_${tableId ?? "walkin"}';
    final payload = {
      'id': tempOrderId,
      'tenant_id': tenantId,
      'location_id': locationId,
      'table_id': tableId,
      'staff_id': createdBy,
      'items': items,
      'notes': notes,
      'subtotal': subtotal,
      'total': total,
      'queued_at': DateTime.now().toUtc().toIso8601String(),
    };

    await _offlineBox!.put(tempOrderId, payload);
    debugPrint('[OfflineSyncService] Order queued locally: $tempOrderId');
  }

  /// Sync all pending orders from local box to Supabase.
  Future<void> syncPendingOrders() async {
    if (_isSyncing) return;
    if (_offlineBox == null || _offlineBox!.isEmpty) return;

    // Check if actually online
    final connectivityResults = await Connectivity().checkConnectivity();
    final isOnline = connectivityResults.any((r) => r != ConnectivityResult.none);
    if (!isOnline) {
      debugPrint('[OfflineSyncService] Skip sync: Device is offline.');
      return;
    }

    _isSyncing = true;
    debugPrint('[OfflineSyncService] Starting sync of ${_offlineBox!.length} pending orders...');

    final keys = List.from(_offlineBox!.keys);
    final List<Future<void>> syncTasks = [];

    for (final key in keys) {
      final orderData = Map<String, dynamic>.from(_offlineBox!.get(key));
      syncTasks.add(() async {
        try {
          debugPrint('[OfflineSyncService] Syncing order ${orderData['id']}...');
          
          // 1. Create order on Supabase using OrderRepository static method
          final List<Map<String, dynamic>> items = (orderData['items'] as List)
              .map((item) => Map<String, dynamic>.from(item))
              .toList();

           await OrderRepository.staticCreateOrder(
            tenantId: orderData['tenant_id'] as String,
            locationId: orderData['location_id'] as String,
            tableId: orderData['table_id'] as String?,
            createdBy: orderData['staff_id'] as String?,
            items: items,
            notes: orderData['notes'] as String?,
            subtotal: orderData['subtotal'] as int? ?? 0,
            total: orderData['total'] as int? ?? 0,
            isOfflineSync: true,
          );

          // 2. Remove from local queue upon successful DB save
          await _offlineBox!.delete(key);
          debugPrint('[OfflineSyncService] Order $key successfully synced and removed from queue.');
        } catch (e) {
          debugPrint('[OfflineSyncService] Failed to sync order $key: $e');
        }
      }());
    }

    await Future.wait(syncTasks);

    _isSyncing = false;
    debugPrint('[OfflineSyncService] Sync cycle complete. Remaining: ${_offlineBox!.length}');
  }

  /// Get list of locally queued orders (for UI display/badge count).
  List<Map<String, dynamic>> getQueuedOrders() {
    if (_offlineBox == null) return [];
    return _offlineBox!.values.map((v) => Map<String, dynamic>.from(v)).toList();
  }

  /// Clean up listeners
  void dispose() {
    _connectivitySubscription?.cancel();
  }
}
