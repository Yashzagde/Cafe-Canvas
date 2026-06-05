import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';

class ActivityFeedScreen extends ConsumerStatefulWidget {
  const ActivityFeedScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ActivityFeedScreen> createState() => _ActivityFeedScreenState();
}

class _ActivityFeedScreenState extends ConsumerState<ActivityFeedScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _activities = [];
  Map<String, String> _staffNames = {};
  String _selectedFilter = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities() async {
    setState(() => _loading = true);

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final tenantId = user.appMetadata['tenant_id'] as String? ?? '';

          // Query feed
      final feedResult = await Supabase.instance.client
          .from('staff_activity_feed')
          .select('id, activity_type, entity_type, entity_id, display_text, metadata, created_at, staff_id, branch_id')
          .eq('tenant_id', tenantId)
          .order('created_at', ascending: false)
          .limit(50);

      final feed = List<Map<String, dynamic>>.from(feedResult as List);

      // Resolve unique staff IDs
      final staffIds = feed
          .map((a) => a['staff_id'] as String?)
          .where((id) => id != null)
          .toSet()
          .cast<String>()
          .toList();

      final staffMap = <String, String>{};
      if (staffIds.isNotEmpty) {
        final staffResult = await Supabase.instance.client
            .from('profiles')
            .select('id, full_name')
            .inFilter('id', staffIds);

        for (final s in staffResult as List) {
          staffMap[s['id'] as String] = s['full_name'] as String? ?? 'Staff';
        }
      }

      setState(() {
        _activities = feed;
        _staffNames = staffMap;
      });
    } catch (e) {
      debugPrint('Error loading activities: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load activity feed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  IconData _getActivityIcon(String type) {
    switch (type) {
      case 'clock_in':
        return Icons.login;
      case 'clock_out':
        return Icons.logout;
      case 'order_created':
      case 'order_dispatched':
      case 'order_completed':
        return Icons.restaurant;
      case 'table_opened':
        return Icons.table_bar_outlined;
      case 'table_closed':
        return Icons.lock_outline;
      case 'table_billed':
      case 'bill_generated':
      case 'bill_voided':
        return Icons.receipt_long_outlined;
      case 'menu_toggled':
        return Icons.restaurant_menu;
      case 'shift_opened':
      case 'shift_closed':
        return Icons.schedule;
      default:
        return Icons.notifications_none_outlined;
    }
  }

  Color _getActivityColor(String type) {
    switch (type) {
      case 'clock_in':
      case 'table_opened':
      case 'order_completed':
        return const Color(0xFF10B981);
      case 'clock_out':
      case 'table_closed':
      case 'bill_voided':
        return Colors.redAccent;
      case 'menu_toggled':
      case 'order_created':
        return const Color(0xFFE28743);
      case 'bill_generated':
        return Colors.blueAccent;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Apply Filter & Search
    final filtered = _activities.where((act) {
      final type = act['activity_type'] as String? ?? '';
      final text = act['display_text'] as String? ?? '';
      final staffId = act['staff_id'] as String? ?? '';
      final staffName = _staffNames[staffId] ?? 'System';

      if (_selectedFilter != 'all') {
        if (_selectedFilter == 'auth' && type != 'clock_in' && type != 'clock_out') return false;
        if (_selectedFilter == 'tables' && type != 'table_opened' && type != 'table_closed' && type != 'table_billed') return false;
        if (_selectedFilter == 'menu' && type != 'menu_toggled') return false;
        if (_selectedFilter == 'orders' && !type.startsWith('order_')) return false;
        if (_selectedFilter == 'billing' && !type.startsWith('bill_')) return false;
      }

      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        return text.toLowerCase().contains(query) ||
            type.toLowerCase().contains(query) ||
            staffName.toLowerCase().contains(query);
      }

      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Activity Feed', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadActivities,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search Input
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search activities...',
                      prefixIcon: const Icon(Icons.search, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                    ),
                  ),
                ),

                // Filter Buttons Row
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      _filterChip('all', 'ALL'),
                      const SizedBox(width: 8),
                      _filterChip('auth', 'SHIFTS'),
                      const SizedBox(width: 8),
                      _filterChip('tables', 'TABLES'),
                      const SizedBox(width: 8),
                      _filterChip('menu', 'MENU'),
                      const SizedBox(width: 8),
                      _filterChip('orders', 'ORDERS'),
                      const SizedBox(width: 8),
                      _filterChip('billing', 'BILLING'),
                    ],
                  ),
                ),

                // List
                Expanded(
                  child: filtered.isEmpty
                      ? const CcEmptyState(
                          icon: Icons.notifications_off_outlined,
                          title: 'No activity found',
                          description: 'Recent operations will appear here once actions are taken.',
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            final act = filtered[index];
                            final type = act['activity_type'] as String? ?? 'event';
                            final text = act['display_text'] as String? ?? '';
                            final staffId = act['staff_id'] as String? ?? '';
                            final staffName = _staffNames[staffId] ?? 'System';
                            final createdAtStr = act['created_at'] as String;
                            final time = DateFormat.jm().format(DateTime.parse(createdAtStr).toLocal());
                            final date = DateFormat.MMMd().format(DateTime.parse(createdAtStr).toLocal());

                            final icon = _getActivityIcon(type);
                            final color = _getActivityColor(type);

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: const BorderSide(color: Color(0xFF262b38)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Activity Icon Badge
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: color.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(icon, color: color, size: 22),
                                    ),
                                    const SizedBox(width: 14),

                                    // Content
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            text,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: color.withOpacity(0.08),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  staffName,
                                                  style: TextStyle(
                                                    color: color,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                              const Spacer(),
                                              Text(
                                                '$date at $time',
                                                style: theme.textTheme.bodySmall?.copyWith(
                                                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                                                  fontSize: 11,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
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
            ),
    );
  }

  Widget _filterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        setState(() => _selectedFilter = key);
      },
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }
}
