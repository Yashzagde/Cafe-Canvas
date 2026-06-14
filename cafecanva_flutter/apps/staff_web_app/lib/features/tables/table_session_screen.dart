import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Table session management screen.
/// Staff can open/close table sessions, view active sessions, and link customers.
class TableSessionScreen extends ConsumerStatefulWidget {
  const TableSessionScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TableSessionScreen> createState() => _TableSessionScreenState();
}

class _TableSessionScreenState extends ConsumerState<TableSessionScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _tables = [];
  Map<String, Map<String, dynamic>?> _activeSessions = {};

  @override
  void initState() {
    super.initState();
    _loadTables();
  }

  Future<void> _loadTables() async {
    setState(() => _loading = true);

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final tenantId = user.appMetadata['tenant_id'] as String? ?? '';

      // Fetch tables
      final tablesResult = await Supabase.instance.client
          .from('tables')
          .select('id, name, capacity, section, status')
          .eq('tenant_id', tenantId)
          .order('name');

      // Fetch active table sessions
      final sessionsResult = await Supabase.instance.client
          .from('table_sessions')
          .select('id, table_id, customer_count, status, session_start, opened_by')
          .eq('tenant_id', tenantId)
          .eq('status', 'active');

      final sessions = <String, Map<String, dynamic>?>{};
      for (final s in sessionsResult as List) {
        sessions[s['table_id'] as String] = s as Map<String, dynamic>;
      }

      setState(() {
        _tables = List<Map<String, dynamic>>.from(tablesResult as List);
        _activeSessions = sessions;
      });
    } catch (e) {
      debugPrint('Error loading tables: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openSession(String tableId) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      final locationId = user.appMetadata['location_id'] as String? ?? user.appMetadata['branch_id'] as String? ?? '';
      await Supabase.instance.client.from('table_sessions').insert({
        'tenant_id': user.appMetadata['tenant_id'] ?? '',
        'table_id': tableId,
        'opened_by': user.id,
        'customer_count': 1,
        'status': 'active',
      });

      // Log activity
      await Supabase.instance.client.from('staff_activity_feed').insert({
        'tenant_id': user.appMetadata['tenant_id'] ?? '',
        'branch_id': locationId,
        'staff_id': user.id,
        'activity_type': 'table_opened',
        'entity_type': 'table',
        'entity_id': tableId,
        'display_text': 'Opened table session',
      });

      _loadTables();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to open session: $e')),
        );
      }
    }
  }

  Future<void> _closeSession(String sessionId, String tableId) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      await Supabase.instance.client
          .from('table_sessions')
          .update({
            'status': 'closed',
            'closed_by': user.id,
            'session_end': DateTime.now().toUtc().toIso8601String(),
          })
          .eq('id', sessionId);

      final locationId = user.appMetadata['location_id'] as String? ?? user.appMetadata['branch_id'] as String? ?? '';
      // Log activity
      await Supabase.instance.client.from('staff_activity_feed').insert({
        'tenant_id': user.appMetadata['tenant_id'] ?? '',
        'branch_id': locationId,
        'staff_id': user.id,
        'activity_type': 'table_closed',
        'entity_type': 'table',
        'entity_id': tableId,
        'display_text': 'Closed table session',
      });

      _loadTables();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to close session: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Tables', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTables,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _tables.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.table_restaurant, size: 48, color: Colors.grey),
                      SizedBox(height: 12),
                      Text('No tables configured', style: TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _tables.length,
                  itemBuilder: (context, index) {
                    final table = _tables[index];
                    final tableId = table['id'] as String;
                    final session = _activeSessions[tableId];
                    final isOccupied = session != null;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: isOccupied
                              ? const Color(0xFFE28743).withOpacity(0.3)
                              : theme.colorScheme.outlineVariant.withOpacity(0.3),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            // Table icon
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: isOccupied
                                    ? const Color(0xFFE28743).withOpacity(0.12)
                                    : const Color(0xFF10B981).withOpacity(0.08),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                Icons.table_restaurant,
                                color: isOccupied
                                    ? const Color(0xFFE28743)
                                    : const Color(0xFF10B981),
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Table info
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    table['name'] as String? ?? 'Table',
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${table['section'] ?? 'Indoor'} · Seats ${table['capacity'] ?? '-'}',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurface.withOpacity(0.5),
                                      fontSize: 11,
                                    ),
                                  ),
                                  if (isOccupied) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      '${session['customer_count']} guest(s) · Active',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFFE28743),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),

                            // Action button
                            isOccupied
                                ? FilledButton.tonal(
                                    onPressed: () => _closeSession(
                                      session['id'] as String,
                                      tableId,
                                    ),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: Colors.red.withOpacity(0.1),
                                      foregroundColor: Colors.red,
                                    ),
                                    child: const Text('Close', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                                  )
                                : FilledButton(
                                    onPressed: () => _openSession(tableId),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: const Color(0xFF10B981),
                                    ),
                                    child: const Text('Open', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                                  ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
