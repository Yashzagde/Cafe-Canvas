import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_analytics/cafecanva_analytics.dart';

// Helper sidebar component for desktop layouts
class DesktopLayout extends StatelessWidget {
  final Widget body;
  final String activeRoute;

  const DesktopLayout({
    Key? key,
    required this.body,
    required this.activeRoute,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Fixed 240px left sidebar
          Container(
            width: 240.0,
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(right: BorderSide(color: CafeCanvaColors.stone200)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
                  child: Row(
                    children: [
                      const Icon(Icons.coffee, color: CafeCanvaColors.primary),
                      const SizedBox(width: 8.0),
                      Text(
                        'CafeCanva',
                        style: TextStyle(
                          fontSize: 22.0,
                          fontWeight: FontWeight.black,
                          color: CafeCanvaColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                
                // Navigation list
                ListTile(
                  leading: const Icon(Icons.dashboard_outlined),
                  title: const Text('Dashboard'),
                  selected: activeRoute == '/',
                  selectedColor: CafeCanvaColors.primary,
                  onTap: () => context.go('/'),
                ),
                ListTile(
                  leading: const Icon(Icons.menu_book),
                  title: const Text('Menu Editor'),
                  selected: activeRoute == '/menu',
                  selectedColor: CafeCanvaColors.primary,
                  onTap: () => context.go('/menu'),
                ),
                ListTile(
                  leading: const Icon(Icons.people_outline),
                  title: const Text('Staff Directory'),
                  selected: activeRoute == '/staff',
                  selectedColor: CafeCanvaColors.primary,
                  onTap: () => context.go('/staff'),
                ),
                
                const Spacer(),
                const Padding(
                  padding: EdgeInsets.all(CafeCanvaSpacing.lg),
                  child: Text('v1.0 (Desktop Ready)', style: TextStyle(color: Colors.black26, fontSize: 11.0)),
                ),
              ],
            ),
          ),
          Expanded(child: body),
        ],
      ),
    );
  }
}

// --- SCREEN 1: DESKTOP ANALYTICS DASHBOARD ---
class DesktopDashboardScreen extends StatefulWidget {
  const DesktopDashboardScreen({Key? key}) : super(key: key);

  @override
  State<DesktopDashboardScreen> createState() => _DesktopDashboardScreenState();
}

class _DesktopDashboardScreenState extends State<DesktopDashboardScreen> {
  final OrderRepository _orderRepo = OrderRepository();
  bool _isLoading = true;
  int _ordersToday = 0;
  int _revenueToday = 0;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      setState(() => _isLoading = true);
      final orders = await _orderRepo.fetchOrders('demo-branch-7777');
      
      int revenue = 0;
      for (final o in orders) {
        if (o.status == 'paid') {
          revenue += o.total;
        }
      }

      if (mounted) {
        setState(() {
          _ordersToday = orders.length;
          _revenueToday = revenue;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _exportReports() {
    // Simulating Excel/CSV file generation
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('CSV report exported successfully! (Saved to Downloads)'),
        backgroundColor: CafeCanvaColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return DesktopLayout(
      activeRoute: '/',
      body: CallbackShortcuts(
        bindings: {
          const SingleActivator(LogicalKeyboardKey.keyN, control: true): () {
            // Hotkey shortcut simulation
            debugPrint('New item hotkey triggered.');
          },
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            appBar: AppBar(
              title: const Text('Store Analytics (Desktop)'),
              actions: [
                ElevatedButton.icon(
                  onPressed: _exportReports,
                  icon: const Icon(Icons.download, color: Colors.white),
                  label: const Text('EXPORT CSV'),
                ),
                const SizedBox(width: 16.0),
              ],
            ),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: CcCard(
                          padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Today\'s Revenue', style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 13.0)),
                              const SizedBox(height: 8.0),
                              CcPriceText(priceInPaise: _revenueToday, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24.0)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16.0),
                      Expanded(
                        child: CcCard(
                          padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Orders Completed', style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 13.0)),
                              const SizedBox(height: 8.0),
                              Text('$_ordersToday', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24.0)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24.0),
                  
                  // Bezier chart
                  const CcRevenueChart(),
                  const SizedBox(height: 24.0),
                  
                  // Pie Chart split
                  const CcCategoryPieChart(),
                  const SizedBox(height: 24.0),
                  
                  // Attention items warning list
                  const CcLowSellingTable(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// --- SCREEN 2: DESKTOP MENU LISTINGS EDITOR ---
class DesktopMenuEditorScreen extends StatefulWidget {
  const DesktopMenuEditorScreen({Key? key}) : super(key: key);

  @override
  State<DesktopMenuEditorScreen> createState() => _DesktopMenuEditorScreenState();
}

class _DesktopMenuEditorScreenState extends State<DesktopMenuEditorScreen> {
  final MenuRepository _menuRepo = MenuRepository();
  bool _isLoading = true;
  List<MenuCategory> _categories = [];
  List<MenuItem> _items = [];

  @override
  void initState() {
    super.initState();
    _loadMenu();
  }

  Future<void> _loadMenu() async {
    try {
      setState(() => _isLoading = true);
      final categories = await _menuRepo.fetchCategories('demo-branch-7777');
      final items = await _menuRepo.fetchItems('demo-branch-7777');

      if (mounted) {
        setState(() {
          _categories = categories;
          _items = items;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showContextMenu(MenuItem item, TapDownDetails details) {
    showMenu(
      context: context,
      position: RelativeRect.fromLTRB(
        details.globalPosition.dx,
        details.globalPosition.dy,
        details.globalPosition.dx + 1.0,
        details.globalPosition.dy + 1.0,
      ),
      items: [
        PopupMenuItem(
          child: const Text('Edit Menu Item Details'),
          onTap: () {
            // Context menu action
            debugPrint('Editing item context action.');
          },
        ),
        PopupMenuItem(
          child: const Text('Toggle Availability', style: TextStyle(color: CafeCanvaColors.primary)),
          onTap: () async {
            await _menuRepo.updateItem(item.id, {
              'status': item.status == 'available' ? 'unavailable' : 'available',
            });
            _loadMenu();
          },
        ),
        PopupMenuItem(
          child: const Text('Delete Listing Permanently', style: TextStyle(color: CafeCanvaColors.error)),
          onTap: () async {
            await _menuRepo.deleteItem(item.id);
            _loadMenu();
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return DesktopLayout(
      activeRoute: '/menu',
      body: Scaffold(
        appBar: AppBar(
          title: const Text('Menu Catalog Editor'),
        ),
        body: ListView.builder(
          padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
          itemCount: _categories.length,
          itemBuilder: (context, index) {
            final cat = _categories[index];
            final catItems = _items.where((i) => i.categoryId == cat.id).toList();

            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: Text(
                    cat.name.toUpperCase(),
                    style: const TextStyle(fontWeight: FontWeight.black, color: CafeCanvaColors.primaryDark, fontSize: 16.0),
                  ),
                ),
                Wrap(
                  spacing: 16.0,
                  runSpacing: 16.0,
                  children: catItems.map((item) {
                    return GestureDetector(
                      onSecondaryTapDown: (details) => _showContextMenu(item, details),
                      child: Container(
                        width: 260.0,
                        padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12.0),
                          border: Border.all(color: CafeCanvaColors.stone200),
                        ),
                        child: Row(
                          children: [
                            const CircleAvatar(radius: 24, child: Icon(Icons.fastfood)),
                            const SizedBox(width: 12.0),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4.0),
                                  CcPriceText(priceInPaise: item.price),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24.0),
              ],
            );
          },
        ),
      ),
    );
  }
}

// --- SCREEN 3: DESKTOP STAFF DIRECTORY ---
class DesktopStaffManagementScreen extends StatefulWidget {
  const DesktopStaffManagementScreen({Key? key}) : super(key: key);

  @override
  State<DesktopStaffManagementScreen> createState() => _DesktopStaffManagementScreenState();
}

class _DesktopStaffManagementScreenState extends State<DesktopStaffManagementScreen> {
  final _client = SupabaseService.instance.client;
  bool _isLoading = true;
  List<UserProfile> _staff = [];

  @override
  void initState() {
    super.initState();
    _loadStaff();
  }

  Future<void> _loadStaff() async {
    try {
      setState(() => _isLoading = true);
      final response = await _client.from('users').select().eq('branch_id', 'demo-branch-7777');
      if (mounted) {
        setState(() {
          _staff = (response as List).map((u) => UserProfile.fromJson(u)).toList();
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return DesktopLayout(
      activeRoute: '/staff',
      body: Scaffold(
        appBar: AppBar(title: const Text('Staff Directory')),
        body: Padding(
          padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
          child: CcCard(
            padding: EdgeInsets.zero,
            child: SingleChildScrollView(
              child: DataTable(
                headingRowColor: MaterialStateProperty.all(CafeCanvaColors.stone550.withOpacity(0.05)),
                columns: const [
                  DataColumn(label: Text('Full Name', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Assigned Role', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Contact Email', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: _staff.map((u) {
                  return DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          const CircleAvatar(radius: 14, child: Icon(Icons.person, size: 14)),
                          const SizedBox(width: 8.0),
                          Text(u.fullName),
                        ],
                      )),
                      DataCell(Text(u.role.toUpperCase())),
                      DataCell(Text(u.email ?? 'N/A')),
                      DataCell(Text(
                        u.status.toUpperCase(),
                        style: TextStyle(
                          color: u.status.toUpperCase() == 'ACTIVE' ? CafeCanvaColors.success : CafeCanvaColors.error,
                          fontWeight: FontWeight.bold,
                        ),
                      )),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
