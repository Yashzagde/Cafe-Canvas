import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_analytics/cafecanva_analytics.dart';

// --- SCREEN 1: ANALYTICS & REVENUE DASHBOARD ---
class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final OrderRepository _orderRepo = OrderRepository();
  bool _isLoading = true;
  int _ordersToday = 0;
  int _revenueToday = 0; // Paise
  double _occupancyRate = 0.0;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      setState(() => _isLoading = true);
      // Aggregating statistics from the repository
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
          _occupancyRate = 65.0; // Simulated active occupancy rate
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

    return CcTabletScaffold(
      title: 'STORE ADMIN DASHBOARD',
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: 'Menu Editor'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: 'Staff Management'),
        ],
        onTap: (index) {
          if (index == 1) context.go('/menu');
          if (index == 2) context.go('/staff');
        },
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Analytics stats row
            Row(
              children: [
                Expanded(
                  child: CcCard(
                    padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Revenue Today', style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 12.0)),
                        const SizedBox(height: 8.0),
                        CcPriceText(priceInPaise: _revenueToday, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20.0)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: CcCard(
                    padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Orders Count', style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 12.0)),
                        const SizedBox(height: 8.0),
                        Text('$_ordersToday', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20.0)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16.0),
            
            // Bezier Revenue trend chart (from shared packages)
            const CcRevenueChart(),
            const SizedBox(height: 16.0),
            
            // Popular category splits (from shared packages)
            const CcCategoryPieChart(),
            const SizedBox(height: 16.0),
            
            // Attention items warning list (from shared packages)
            const CcLowSellingTable(),
          ],
        ),
      ),
    );
  }
}

// --- SCREEN 2: MENU CATEGORIES & ITEMS CRUD ---
class MenuEditorScreen extends StatefulWidget {
  const MenuEditorScreen({Key? key}) : super(key: key);

  @override
  State<MenuEditorScreen> createState() => _MenuEditorScreenState();
}

class _MenuEditorScreenState extends State<MenuEditorScreen> {
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

  void _showAddCategorySheet() {
    final TextEditingController nameCont = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            top: CafeCanvaSpacing.lg,
            left: CafeCanvaSpacing.lg,
            right: CafeCanvaSpacing.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Add Menu Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
              const SizedBox(height: 16.0),
              TextField(controller: nameCont, decoration: const InputDecoration(labelText: 'Category Name')),
              const SizedBox(height: 24.0),
              ElevatedButton(
                onPressed: () async {
                  if (nameCont.text.trim().isEmpty) return;
                  await _menuRepo.createCategory({
                    'tenant_id': 'demo-tenant-5555',
                    'branch_id': 'demo-branch-7777',
                    'name': nameCont.text.trim(),
                    'sort_order': _categories.length + 1,
                  });
                  Navigator.pop(context);
                  _loadMenu();
                },
                child: const Text('SAVE CATEGORY'),
              ),
              const SizedBox(height: 16.0),
            ],
          ),
        );
      },
    );
  }

  void _showAddItemSheet() {
    final TextEditingController nameCont = TextEditingController();
    final TextEditingController descCont = TextEditingController();
    final TextEditingController priceCont = TextEditingController();
    String? selectedCatId = _categories.isNotEmpty ? _categories[0].id : null;
    XFile? pickedImage;
    final ImagePicker picker = ImagePicker();
    bool isUploading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                top: CafeCanvaSpacing.lg,
                left: CafeCanvaSpacing.lg,
                right: CafeCanvaSpacing.lg,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Add Menu Item', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                    const SizedBox(height: 16.0),
                    DropdownButtonFormField<String>(
                      value: selectedCatId,
                      decoration: const InputDecoration(labelText: 'Menu Category'),
                      items: _categories
                          .map((c) => DropdownMenuItem(value: c.id, child: Text(c.name)))
                          .toList(),
                      onChanged: (val) => setSheetState(() => selectedCatId = val),
                    ),
                    const SizedBox(height: 8.0),
                    TextField(controller: nameCont, decoration: const InputDecoration(labelText: 'Item Name')),
                    const SizedBox(height: 8.0),
                    TextField(controller: descCont, decoration: const InputDecoration(labelText: 'Item Description')),
                    const SizedBox(height: 8.0),
                    TextField(controller: priceCont, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price (Rupees)')),
                    const SizedBox(height: 16.0),
                    
                    // Image picker UI block
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            pickedImage == null 
                                ? 'No menu photo selected' 
                                : 'Photo ready for upload',
                            style: const TextStyle(fontSize: 12.0, color: CafeCanvaColors.stone500),
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () async {
                            final image = await picker.pickImage(source: ImageSource.gallery);
                            if (image != null) {
                              setSheetState(() => pickedImage = image);
                            }
                          },
                          icon: const Icon(Icons.add_photo_alternate),
                          label: Text(pickedImage == null ? 'Select Photo' : 'Change Photo'),
                        ),
                      ],
                    ),
                    if (pickedImage != null)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(CafeCanvaRadius.sm),
                          child: Image.file(
                            File(pickedImage!.path),
                            height: 120,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    const SizedBox(height: 24.0),
                    ElevatedButton(
                      onPressed: isUploading ? null : () async {
                        if (nameCont.text.trim().isEmpty || priceCont.text.trim().isEmpty || selectedCatId == null) return;
                        
                        setSheetState(() => isUploading = true);
                        String? uploadedUrl;

                        try {
                          if (pickedImage != null) {
                            // Compress item photo to 80% WebP securely before uploading to Supabase menu-images bucket
                            final compressedBytes = await FlutterImageCompress.compressWithFile(
                              pickedImage!.path,
                              quality: 80,
                              format: CompressFormat.webp,
                            );

                            if (compressedBytes != null) {
                              final generatedItemId = 'item_${DateTime.now().millisecondsSinceEpoch}';
                              uploadedUrl = await _menuRepo.uploadMenuImage(
                                'demo-tenant-5555',
                                generatedItemId,
                                compressedBytes,
                              );
                            }
                          }

                          final priceRupees = double.parse(priceCont.text.trim());
                          final pricePaise = (priceRupees * 100).round();

                          await _menuRepo.createItem({
                            'tenant_id': 'demo-tenant-5555',
                            'branch_id': 'demo-branch-7777',
                            'category_id': selectedCatId!,
                            'name': nameCont.text.trim(),
                            'description': descCont.text.trim(),
                            'price': pricePaise,
                            'status': 'available',
                            'image_url': uploadedUrl,
                          });

                          Navigator.pop(context);
                          _loadMenu();
                        } catch (e) {
                          setSheetState(() => isUploading = false);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed to save item: $e')),
                          );
                        }
                      },
                      child: isUploading 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('SAVE MENU ITEM'),
                    ),
                    const SizedBox(height: 16.0),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(title: const Text('MENU EDITOR')),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 1,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: 'Menu Editor'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: 'Staff Management'),
        ],
        onTap: (index) {
          if (index == 0) context.go('/');
          if (index == 2) context.go('/staff');
        },
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(CafeCanvaSpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _showAddCategorySheet,
                    icon: const Icon(Icons.folder_open_outlined, color: Colors.white),
                    label: const Text('ADD CATEGORY'),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _showAddItemSheet,
                    icon: const Icon(Icons.fastfood_outlined, color: Colors.white),
                    label: const Text('ADD MENU ITEM'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(CafeCanvaSpacing.md),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final catItems = _items.where((i) => i.categoryId == cat.id).toList();
                
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(
                        cat.name.toUpperCase(),
                        style: const TextStyle(fontWeight: FontWeight.black, color: CafeCanvaColors.primaryDark, letterSpacing: 0.5),
                      ),
                    ),
                    ...catItems.map((item) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: item.imageUrl != null 
                          ? CircleAvatar(backgroundImage: NetworkImage(item.imageUrl!))
                          : const CircleAvatar(child: Icon(Icons.fastfood)),
                      title: Text(item.name),
                      subtitle: CcPriceText(priceInPaise: item.price),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: CafeCanvaColors.error),
                        onPressed: () async {
                          await _menuRepo.deleteItem(item.id);
                          _loadMenu();
                        },
                      ),
                    )),
                    const SizedBox(height: 16.0),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// --- SCREEN 3: STAFF MANAGEMENT & ROLE UPDATER ---
class StaffManagementScreen extends StatefulWidget {
  const StaffManagementScreen({Key? key}) : super(key: key);

  @override
  State<StaffManagementScreen> createState() => _StaffManagementScreenState();
}

class _StaffManagementScreenState extends State<StaffManagementScreen> {
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

  void _showAddStaffSheet() {
    final TextEditingController nameCont = TextEditingController();
    final TextEditingController emailCont = TextEditingController();
    final TextEditingController phoneCont = TextEditingController();
    final TextEditingController pinCont = TextEditingController();
    String selectedRole = 'staff';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                top: CafeCanvaSpacing.lg,
                left: CafeCanvaSpacing.lg,
                right: CafeCanvaSpacing.lg,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Add Staff Employee', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                    const SizedBox(height: 16.0),
                    TextField(controller: nameCont, decoration: const InputDecoration(labelText: 'Full Name')),
                    const SizedBox(height: 8.0),
                    TextField(controller: emailCont, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email Address')),
                    const SizedBox(height: 8.0),
                    TextField(controller: phoneCont, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone Number')),
                    const SizedBox(height: 8.0),
                    TextField(controller: pinCont, maxLength: 4, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Quick PIN (4 digits)')),
                    const SizedBox(height: 8.0),
                    DropdownButtonFormField<String>(
                      value: selectedRole,
                      decoration: const InputDecoration(labelText: 'Assigned Role'),
                      items: const [
                        DropdownMenuItem(value: 'manager', child: Text('Manager')),
                        DropdownMenuItem(value: 'cashier', child: Text('Cashier')),
                        DropdownMenuItem(value: 'staff', child: Text('Waiter / Staff')),
                        DropdownMenuItem(value: 'kitchen', child: Text('Kitchen Display (KDS)')),
                      ],
                      onChanged: (val) => setSheetState(() => selectedRole = val ?? 'staff'),
                    ),
                    const SizedBox(height: 24.0),
                    ElevatedButton(
                      onPressed: () async {
                        if (nameCont.text.trim().isEmpty || pinCont.text.trim().length != 4) return;
                        
                        await _client.from('users').insert({
                          'tenant_id': 'demo-tenant-5555',
                          'branch_id': 'demo-branch-7777',
                          'name': nameCont.text.trim(),
                          'email': emailCont.text.trim().isNotEmpty ? emailCont.text.trim() : null,
                          'phone': phoneCont.text.trim().isNotEmpty ? phoneCont.text.trim() : null,
                          'role': selectedRole,
                          'pin_hash': pinCont.text.trim(), // Storing flat PIN client-side for offline Bcrypt comparisons
                        });
                        
                        Navigator.pop(context);
                        _loadStaff();
                      },
                      child: const Text('SAVE STAFF PROFILE'),
                    ),
                    const SizedBox(height: 16.0),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(title: const Text('STAFF MANAGEMENT')),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 2,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: 'Menu Editor'),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: 'Staff Management'),
        ],
        onTap: (index) {
          if (index == 0) context.go('/');
          if (index == 1) context.go('/menu');
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: CafeCanvaColors.primary,
        onPressed: _showAddStaffSheet,
        child: const Icon(Icons.person_add_alt_1, color: Colors.white),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(CafeCanvaSpacing.md),
        itemCount: _staff.length,
        separatorBuilder: (context, i) => const Divider(color: CafeCanvaColors.stone200),
        itemBuilder: (context, index) {
          final u = _staff[index];
          return ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: Text(u.fullName),
            subtitle: Text('Role: ${u.role.toUpperCase()}'),
            trailing: Text(
              u.status.toUpperCase(),
              style: TextStyle(
                color: u.status.toUpperCase() == 'ACTIVE' ? CafeCanvaColors.success : CafeCanvaColors.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          );
        },
      ),
    );
  }
}
