import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StaffDashboardScreen extends ConsumerStatefulWidget {
  const StaffDashboardScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<StaffDashboardScreen> createState() => _StaffDashboardScreenState();
}

class _StaffDashboardScreenState extends ConsumerState<StaffDashboardScreen> {
  bool _loading = true;
  bool _isClockedIn = false;
  String _staffName = 'Staff Member';
  String _staffRole = 'Staff';
  String _branchName = 'Loading Branch...';
  String? _clockInTime;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      // Extract details from JWT claims
      _staffRole = (user.appMetadata['role'] as String? ?? 'staff').toUpperCase();
      _staffName = user.userMetadata?['full_name'] as String? ?? user.email?.split('@')[0] ?? 'Staff Member';

      final tenantId = user.appMetadata['tenant_id'] as String? ?? '';
      final locationId = user.appMetadata['location_id'] as String? ?? user.appMetadata['branch_id'] as String? ?? '';

      // Fetch location name
      if (locationId.isNotEmpty) {
        final branchData = await Supabase.instance.client
            .from('locations')
            .select('name')
            .eq('id', locationId)
            .maybeSingle();
        if (branchData != null && mounted) {
          setState(() {
            _branchName = branchData['name'] as String;
          });
        }
      } else {
        setState(() {
          _branchName = 'All Branches';
        });
      }

      // Check attendance status
      final record = await Supabase.instance.client
          .from('staff_attendance')
          .select('id, clock_in')
          .eq('staff_id', user.id)
          .isFilter('clock_out', null)
          .maybeSingle();

      if (mounted) {
        setState(() {
          _isClockedIn = record != null;
          _clockInTime = record?['clock_in'] as String?;
        });
      }
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CafeCanvas Staff', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDashboardData,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: _logout,
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User Welcome Card
                  Card(
                    color: const Color(0xFF151820),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(color: Color(0xFF262b38)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: const Color(0xFFE28743).withOpacity(0.1),
                            child: Text(
                              _staffName.substring(0, min(2, _staffName.length)).toUpperCase(),
                              style: const TextStyle(
                                color: Color(0xFFE28743),
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello, $_staffName',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE28743).withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        _staffRole,
                                        style: const TextStyle(
                                          color: Color(0xFFE28743),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _branchName,
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.5),
                                        fontSize: 12,
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
                  ),
                  const SizedBox(height: 24),

                  // Shift Status Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Shift Operations',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _isClockedIn
                              ? const Color(0xFF10B981).withOpacity(0.1)
                              : Colors.red.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _isClockedIn
                                ? const Color(0xFF10B981).withOpacity(0.3)
                                : Colors.red.withOpacity(0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _isClockedIn ? const Color(0xFF10B981) : Colors.red,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _isClockedIn ? 'ON DUTY' : 'OFF DUTY',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: _isClockedIn ? const Color(0xFF10B981) : Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Menu Grid Options
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.1,
                    children: [
                      _buildMenuCard(
                        context,
                        title: 'Attendance',
                        subtitle: _isClockedIn ? 'Clock out shift' : 'Clock in shift',
                        icon: Icons.timer,
                        color: const Color(0xFF10B981),
                        route: '/clock-in',
                      ),
                      _buildMenuCard(
                        context,
                        title: 'Dining Tables',
                        subtitle: 'Manage sessions',
                        icon: Icons.table_restaurant,
                        color: const Color(0xFFE28743),
                        route: '/tables',
                      ),
                      _buildMenuCard(
                        context,
                        title: 'Menu Book',
                        subtitle: 'Toggle items',
                        icon: Icons.restaurant_menu,
                        color: const Color(0xFF3B82F6),
                        route: '/menu',
                      ),
                      _buildMenuCard(
                        context,
                        title: 'Activity Feed',
                        subtitle: 'Live events log',
                        icon: Icons.assignment_outlined,
                        color: const Color(0xFF8C96A3),
                        route: '/activity',
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF262b38)),
      ),
      child: InkWell(
        onTap: () => context.go(route),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  int min(int a, int b) => a < b ? a : b;
}
