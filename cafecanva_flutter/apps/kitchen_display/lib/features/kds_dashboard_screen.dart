import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'kds/kds_audio_controller.dart';

class KdsDashboardScreen extends StatefulWidget {
  final String branchId;

  const KdsDashboardScreen({
    Key? key,
    required this.branchId,
  }) : super(key: key);

  @override
  State<KdsDashboardScreen> createState() => _KdsDashboardScreenState();
}

class _KdsDashboardScreenState extends State<KdsDashboardScreen> {
  final OrderRepository _orderRepo = OrderRepository();
  final TableRepository _tableRepo = TableRepository();
  final RealtimeService _realtimeService = RealtimeService.instance;
  final KdsAudioController _audioController = KdsAudioController();

  List<OrderModel> _orders = [];
  Map<String, String> _tableNames = {};
  bool _isLoading = true;
  String? _errorMessage;
  late Timer _tickerTimer;
  Timer? _autoUnmuteTimer;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _setupRealtime();
    
    // Refresh card elapsed timers periodically
    _tickerTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (mounted) setState(() {});
    });
  }

  Future<void> _loadInitialData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final tables = await _tableRepo.fetchTables(widget.branchId);
      final Map<String, String> tableMap = {};
      for (final t in tables) {
        tableMap[t.id] = t.name;
      }

      final activeOrders = await _orderRepo.fetchOrders(widget.branchId);

      if (mounted) {
        setState(() {
          _tableNames = tableMap;
          _orders = activeOrders;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = CcError.friendly(e);
          _isLoading = false;
        });
      }
    }
  }

  void _setupRealtime() {
    // Blocker 3: Realtime subscriptions strictly bounded inside Postgres branch/tenant filters
    final tenantId = AuthService.tenantId ?? '';
    _realtimeService.subscribeToKitchenOrders(
      branchId: widget.branchId,
      tenantId: tenantId,
      onOrderCreated: (payload) {
        final orderId = payload.newRecord['id'] as String;
        _audioController.chimeForOrder(orderId);
        _loadInitialData();
      },
      onOrderItemUpdated: (payload) {
        _loadInitialData();
      },
    );
  }

  Future<void> _updateItemStatus(String itemId, String orderId, String newStatus) async {
    try {
      await _orderRepo.updateOrderItemKdsStatus(itemId, newStatus);
      
      // Stop loop chimes once prep work has started
      if (newStatus == 'preparing') {
        await _audioController.stopChimeForOrder(orderId);
      }
      
      await _loadInitialData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(CcError.friendly(e)),
          backgroundColor: CafeCanvaColors.error,
        ),
      );
    }
  }

  void _toggleMute() {
    setState(() {
      _audioController.toggleMute();
    });

    // Blocker 9: Safety auto-unmute chimes trigger after 30 minutes
    _autoUnmuteTimer?.cancel();
    if (_audioController.isMuted) {
      _autoUnmuteTimer = Timer(const Duration(minutes: 30), () {
        if (mounted && _audioController.isMuted) {
          setState(() {
            _audioController.toggleMute();
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _tickerTimer.cancel();
    _autoUnmuteTimer?.cancel();
    _audioController.dispose();
    _realtimeService.unsubscribeAll();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        body: CcErrorState(
          error: _errorMessage!,
          onRetry: _loadInitialData,
        ),
      );
    }

    final pendingItems = _filterItemsByStatus('pending');
    final preparingItems = _filterItemsByStatus('preparing');
    final readyItems = _filterItemsByStatus('ready');

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F11),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1C1917),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.restaurant, color: CafeCanvaColors.primary),
            const SizedBox(width: 8.0),
            Text(
              'KITCHEN DISPLAY SYSTEM',
              style: GoogleFonts.dmSans(
                fontWeight: FontWeight.w900,
                fontSize: 20.0,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ),
        actions: [
          // Blocker 9: Audio loop chimes mute controller chimes toggle
          IconButton(
            onPressed: _toggleMute,
            icon: Icon(
              _audioController.isMuted ? Icons.volume_off : Icons.volume_up,
              color: _audioController.isMuted ? CafeCanvaColors.error : Colors.white,
            ),
          ),
          IconButton(
            onPressed: _loadInitialData,
            icon: const Icon(Icons.refresh, color: Colors.white),
          ),
        ],
      ),
      body: Row(
        children: [
          Expanded(
            child: _buildKdsColumn(
              title: 'PENDING',
              color: CafeCanvaColors.error,
              items: pendingItems,
              actionLabel: 'START PREPARING',
              nextStatus: 'preparing',
            ),
          ),
          Container(width: 1, color: Colors.white10),
          Expanded(
            child: _buildKdsColumn(
              title: 'PREPARING',
              color: CafeCanvaColors.warning,
              items: preparingItems,
              actionLabel: 'MARK READY',
              nextStatus: 'ready',
            ),
          ),
          Container(width: 1, color: Colors.white10),
          Expanded(
            child: _buildKdsColumn(
              title: 'READY TO SERVE',
              color: CafeCanvaColors.success,
              items: readyItems,
              actionLabel: 'SERVE OUT',
              nextStatus: 'served',
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _filterItemsByStatus(String status) {
    final List<Map<String, dynamic>> result = [];
    for (final order in _orders) {
      for (final item in order.items) {
        final itemStatus = item.toJson()['kds_status'] ?? 'pending';
        if (itemStatus == status) {
          result.add({
            'order': order,
            'item': item,
          });
        }
      }
    }
    return result;
  }

  Widget _buildKdsColumn({
    required String title,
    required Color color,
    required List<Map<String, dynamic>> items,
    required String actionLabel,
    required String nextStatus,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(vertical: 14.0),
          color: color.withOpacity(0.1),
          child: Center(
            child: Text(
              '$title (${items.length})',
              style: TextStyle(
                color: color,
                fontSize: 16.0,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
              ),
            ),
          ),
        ),
        Expanded(
          child: items.isEmpty
              ? const Center(
                  child: Text(
                    'No items in queue',
                    style: TextStyle(color: Colors.white30, fontSize: 13.0),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final itemNode = items[index];
                    final OrderModel order = itemNode['order'];
                    final OrderItemModel item = itemNode['item'];
                    
                    final String tableName = _tableNames[order.tableId] ?? 'Takeaway';
                    final elapsedMin = DateTime.now().difference(item.createdAt).inMinutes;

                    return Card(
                      color: const Color(0xFF1C1917),
                      margin: const EdgeInsets.only(bottom: CafeCanvaSpacing.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                        side: const BorderSide(color: Colors.white10),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  tableName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16.0,
                                    color: Colors.white,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.05),
                                    borderRadius: BorderRadius.circular(4.0),
                                  ),
                                  child: Text(
                                    '${elapsedMin}m ago',
                                    style: TextStyle(
                                      color: elapsedMin > 15 ? CafeCanvaColors.error : Colors.white60,
                                      fontSize: 11.0,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10.0),
                            const Divider(color: Colors.white10, height: 1),
                            const SizedBox(height: 10.0),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6.0),
                                  decoration: BoxDecoration(
                                    color: color.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6.0),
                                  ),
                                  child: Text(
                                    'x${item.quantity}',
                                    style: TextStyle(
                                      color: color,
                                      fontSize: 16.0,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12.0),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.itemName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15.0,
                                          color: Colors.white,
                                        ),
                                      ),
                                      if (item.modifierSelections.isNotEmpty) ...[
                                        const SizedBox(height: 4.0),
                                        Text(
                                          'Modifiers: ${item.modifierSelections.map((m) => m['name']).join(', ')}',
                                          style: const TextStyle(
                                            fontSize: 12.0,
                                            color: Colors.white54,
                                            fontStyle: FontStyle.italic,
                                          ),
                                        ),
                                      ],
                                      if (item.itemNotes != null && item.itemNotes!.isNotEmpty) ...[
                                        const SizedBox(height: 6.0),
                                        Row(
                                          children: [
                                            const Icon(Icons.note, size: 12.0, color: CafeCanvaColors.primary),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                item.itemNotes!,
                                                style: const TextStyle(
                                                  fontSize: 12.0,
                                                  color: CafeCanvaColors.primaryLight,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14.0),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: color,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                                ),
                                onPressed: () => _updateItemStatus(item.id, order.id, nextStatus),
                                child: Text(
                                  actionLabel,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.0, letterSpacing: 0.5),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
