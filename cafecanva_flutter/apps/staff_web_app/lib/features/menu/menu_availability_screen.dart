import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';

class MenuAvailabilityScreen extends ConsumerStatefulWidget {
  const MenuAvailabilityScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MenuAvailabilityScreen> createState() => _MenuAvailabilityScreenState();
}

class _MenuAvailabilityScreenState extends ConsumerState<MenuAvailabilityScreen> {
  bool _loading = true;
  List<MenuCategory> _categories = [];
  List<MenuItem> _items = [];
  String? _selectedCategoryId;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadMenuData();
  }

  Future<void> _loadMenuData() async {
    setState(() => _loading = true);

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final tenantId = user.appMetadata['tenant_id'] as String? ?? '';
      final branchId = user.appMetadata['branch_id'] as String? ?? '';

      final categories = await MenuRepository.getCategories(tenantId, branchId);
      final items = await MenuRepository.getItems(tenantId, branchId);

      setState(() {
        _categories = categories;
        _items = items;
      });
    } catch (e) {
      debugPrint('Error loading menu: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load menu: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleItem(MenuItem item, bool isAvailable) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final newStatus = isAvailable ? 'available' : 'unavailable';

    try {
      // 1. Toggle status in Supabase
      await MenuRepository.toggleItemStatus(item.id, newStatus);

      // 2. Log activity
      await Supabase.instance.client.from('staff_activity_feed').insert({
        'tenant_id': user.appMetadata['tenant_id'] ?? '',
        'branch_id': user.appMetadata['branch_id'],
        'staff_id': user.id,
        'activity_type': 'menu_toggled',
        'entity_type': 'menu_item',
        'entity_id': item.id,
        'display_text': 'Toggled menu item "${item.name}" to $newStatus',
        'metadata': {
          'item_name': item.name,
          'status': newStatus,
        },
      });

      // Update local state
      setState(() {
        _items = _items.map((i) {
          if (i.id == item.id) {
            return i.copyWith(status: newStatus);
          }
          return i;
        }).toList();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update status: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Filter items
    final filteredItems = _items.where((item) {
      if (_selectedCategoryId != null && item.categoryId != _selectedCategoryId) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        return item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (item.description ?? '').toLowerCase().contains(_searchQuery.toLowerCase());
      }
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Menu Book', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadMenuData,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search bar
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search items...',
                      prefixIcon: const Icon(Icons.search, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                    ),
                  ),
                ),

                // Category chips
                if (_categories.isNotEmpty)
                  Container(
                    height: 48,
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _categories.length + 1,
                      itemBuilder: (context, index) {
                        final isAll = index == 0;
                        final category = isAll ? null : _categories[index - 1];
                        final isSelected = isAll
                            ? _selectedCategoryId == null
                            : _selectedCategoryId == category!.id;

                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(isAll ? 'ALL' : category!.name.toUpperCase()),
                            selected: isSelected,
                            onSelected: (val) {
                              setState(() {
                                _selectedCategoryId = isAll ? null : category!.id;
                              });
                            },
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                // Items list
                Expanded(
                  child: filteredItems.isEmpty
                      ? const CcEmptyState(
                          icon: Icons.search_off,
                          title: 'No items match filter',
                          description: 'Try changing your search query or category filter.',
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredItems.length,
                          itemBuilder: (context, index) {
                            final item = filteredItems[index];
                            final isAvailable = item.isAvailable;

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: isAvailable
                                      ? const Color(0xFF10B981).withOpacity(0.2)
                                      : theme.colorScheme.outlineVariant.withOpacity(0.3),
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    // Image
                                    Container(
                                      width: 56,
                                      height: 56,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        color: Colors.grey.withOpacity(0.1),
                                      ),
                                      child: item.imageUrl != null
                                          ? ClipRRect(
                                              borderRadius: BorderRadius.circular(12),
                                              child: Image.network(
                                                item.imageUrl!,
                                                fit: BoxFit.cover,
                                              ),
                                            )
                                          : const Icon(Icons.fastfood, color: Colors.grey),
                                    ),
                                    const SizedBox(width: 14),

                                    // Name + Category
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '₹${(item.price / 100).toStringAsFixed(2)}',
                                            style: TextStyle(
                                              color: theme.colorScheme.primary,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Switch
                                    Switch(
                                      value: isAvailable,
                                      onChanged: (val) => _toggleItem(item, val),
                                      activeColor: const Color(0xFF10B981),
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
}
