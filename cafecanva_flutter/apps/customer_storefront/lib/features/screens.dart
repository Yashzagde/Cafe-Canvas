import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_billing/cafecanva_billing.dart';

// Persistent Cart Local Boxes
final _cartBox = Hive.box('cart');

List<Map<String, dynamic>> _getCart(String slug) {
  final List<dynamic>? raw = _cartBox.get('cart_$slug');
  if (raw == null) return [];
  return raw.map((item) => Map<String, dynamic>.from(item as Map)).toList();
}

void _saveCart(String slug, List<Map<String, dynamic>> cart) {
  _cartBox.put('cart_$slug', cart);
}

void _addToCart(String slug, MenuItem item, int quantity, List<ModifierOption> mods, String notes) {
  final cart = _getCart(slug);
  final List<Map<String, dynamic>> modData = mods.map((m) => {
    'id': m.id,
    'name': m.name,
    'extra_price': m.extraPrice,
  }).toList();
  
  cart.add({
    'itemId': item.id,
    'itemName': item.name,
    'quantity': quantity,
    'unitPrice': item.price,
    'modifierSelections': modData,
    'itemNotes': notes,
    'imageUrl': item.imageUrl,
  });
  _saveCart(slug, cart);
}

// --- SCREEN 1: SLUG ENTRY WITH CAMERA QR SCANNER ---
class SlugEntryScreen extends StatefulWidget {
  const SlugEntryScreen({Key? key}) : super(key: key);

  @override
  State<SlugEntryScreen> createState() => _SlugEntryScreenState();
}

class _SlugEntryScreenState extends State<SlugEntryScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _isLoading = false;

  Future<void> _proceed() async {
    final slug = _controller.text.trim().toLowerCase();
    if (slug.isEmpty) return;

    setState(() => _isLoading = true);
    context.go('/$slug');
  }

  /// Blocker 4: Triggers camera scanner overlay modal
  void _openCameraScanner() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Scan Table QR Code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12.0),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12.0),
                  child: MobileScanner(
                    onDetect: (capture) {
                      final List<Barcode> barcodes = capture.barcodes;
                      for (final barcode in barcodes) {
                        final String? code = barcode.rawValue;
                        if (code != null && code.startsWith('cafecanva://')) {
                          Navigator.pop(context);
                          _handleDeepLink(code);
                          return;
                        }
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
              const Center(
                child: Text('Position the QR code inside the camera view finder', style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 12.0)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _handleDeepLink(String url) {
    try {
      final uri = Uri.parse(url);
      final slug = uri.pathSegments.isNotEmpty ? uri.pathSegments[0] : '';
      final tableId = uri.queryParameters['table'];
      
      if (slug.isNotEmpty) {
        context.go('/$slug?table=$tableId');
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid CafeCanva QR code scanned.'), backgroundColor: CafeCanvaColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [Color(0xFFFEF3C7), Color(0xFFFAFAF7)],
          ),
        ),
        padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Icon(Icons.coffee, size: 64.0, color: CafeCanvaColors.primary),
            ),
            const SizedBox(height: 16.0),
            Center(
              child: Text(
                'CafeCanva',
                style: GoogleFonts.dmSans(
                  fontSize: 32.0,
                  fontWeight: FontWeight.w900,
                  color: CafeCanvaColors.primaryDark,
                ),
              ),
            ),
            const SizedBox(height: 8.0),
            Center(
              child: Text(
                'Scan your table QR code or enter code to browse & place orders',
                textAlign: TextAlign.center,
                style: GoogleFonts.dmSans(fontSize: 14.0, color: CafeCanvaColors.stone500),
              ),
            ),
            const SizedBox(height: 32.0),
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'e.g. cappuccino-house',
                labelText: 'Cafe Subdomain Code',
                prefixIcon: const Icon(Icons.qr_code_scanner),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.camera_alt_outlined, color: CafeCanvaColors.primary),
                  onPressed: _openCameraScanner,
                ),
              ),
            ),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: _isLoading ? null : _proceed,
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('EXPLORE CAFE', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// --- SCREEN 2: HOME / MENU BROWSE ---
class StorefrontHomeScreen extends StatefulWidget {
  final String slug;
  final String? prefilledTableId;

  const StorefrontHomeScreen({
    Key? key,
    required this.slug,
    this.prefilledTableId,
  }) : super(key: key);

  @override
  State<StorefrontHomeScreen> createState() => _StorefrontHomeScreenState();
}

class _StorefrontHomeScreenState extends State<StorefrontHomeScreen> {
  final MenuRepository _menuRepo = MenuRepository();
  bool _isLoading = true;
  String? _errorMessage;
  
  List<MenuCategory> _categories = [];
  List<MenuItem> _items = [];
  List<MenuItem> _filteredItems = [];
  String? _selectedCategoryId;
  String _searchQuery = '';
  
  bool _callCooldown = false;
  int _cooldownSeconds = 0;
  Timer? _cooldownTimer;

  @override
  void initState() {
    super.initState();
    _loadMenu();
  }

  Future<void> _loadMenu() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final categories = await _menuRepo.fetchCategories('demo-branch-7777');
      final items = await _menuRepo.fetchItems('demo-branch-7777');

      if (mounted) {
        setState(() {
          _categories = categories;
          _items = items;
          _filteredItems = items;
          if (categories.isNotEmpty) {
            _selectedCategoryId = categories[0].id;
            _filterItems();
          }
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

  void _filterItems() {
    setState(() {
      _filteredItems = _items.where((i) {
        final matchesCategory = _selectedCategoryId == null || i.categoryId == _selectedCategoryId;
        final matchesSearch = i.name.toLowerCase().contains(_searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }).toList();
    });
  }

  Future<void> _triggerCallStaff() async {
    if (_callCooldown) return;
    
    setState(() {
      _callCooldown = true;
      _cooldownSeconds = 120;
    });

    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_cooldownSeconds <= 1) {
        _cooldownTimer?.cancel();
        setState(() => _callCooldown = false);
      } else {
        setState(() => _cooldownSeconds--);
      }
    });

    await SupabaseService.instance.callStaff(
      tableId: widget.prefilledTableId ?? 'demo-table-1',
      tenantId: 'demo-tenant-5555',
      tableNumber: 'Table 4',
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Waitress support requested. Staff will be at your table shortly!'),
        backgroundColor: CafeCanvaColors.success,
      ),
    );
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_errorMessage != null) return Scaffold(body: CcErrorState(error: _errorMessage!, onRetry: _loadMenu));

    final cartItems = _getCart(widget.slug);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(widget.slug.toUpperCase().replaceAll('-', ' ')),
            if (widget.prefilledTableId != null)
              const Text('Dine-In • Active Table Session', style: TextStyle(fontSize: 11.0, color: CafeCanvaColors.success, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () => context.go('/${widget.slug}/cart'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: _callCooldown ? CafeCanvaColors.stone400 : CafeCanvaColors.primary,
        onPressed: _callCooldown ? null : _triggerCallStaff,
        icon: const Icon(Icons.room_service_outlined, color: Colors.white),
        label: Text(
          _callCooldown ? 'COOLDOWN ${_cooldownSeconds}s' : 'CALL STAFF',
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Theme banners
          Container(
            height: 120,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(CafeCanvaSpacing.md),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search menus...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (val) {
                _searchQuery = val;
                _filterItems();
              },
            ),
          ),
          // Categories list
          SizedBox(
            height: 48.0,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: CafeCanvaSpacing.md),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat.id == _selectedCategoryId;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(cat.name),
                    selected: isSelected,
                    selectedColor: CafeCanvaColors.primaryLight,
                    onSelected: (val) {
                      setState(() {
                        _selectedCategoryId = val ? cat.id : null;
                        _filterItems();
                      });
                    },
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12.0),
          Expanded(
            child: _filteredItems.isEmpty
                ? const CcEmptyState(title: 'No items matching criteria.')
                : GridView.builder(
                    padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.78,
                      crossAxisSpacing: CafeCanvaSpacing.md,
                      mainAxisSpacing: CafeCanvaSpacing.md,
                    ),
                    itemCount: _filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredItems[index];
                      return CcMenuItemCard(
                        item: item,
                        onAdd: () => context.go('/${widget.slug}/item/${item.id}'),
                      );
                    },
                  ),
          ),
          if (cartItems.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(CafeCanvaSpacing.md),
              color: CafeCanvaColors.primaryDark,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${cartItems.length} items added in basket',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  TextButton.icon(
                    style: TextButton.styleFrom(foregroundColor: Colors.white),
                    onPressed: () => context.go('/${widget.slug}/cart'),
                    icon: const Icon(Icons.shopping_cart),
                    label: const Text('VIEW BASKET'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// --- SCREEN 3: ITEM DETAIL / MODIFIERS ---
class ItemDetailScreen extends StatefulWidget {
  final String slug;
  final String itemId;

  const ItemDetailScreen({
    Key? key,
    required this.slug,
    required this.itemId,
  }) : super(key: key);

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  final MenuRepository _menuRepo = MenuRepository();
  
  bool _isLoading = true;
  String? _errorMessage;
  
  late MenuItem _item;
  List<ModifierGroup> _modifierGroups = [];
  final List<ModifierOption> _selectedOptions = [];
  int _quantity = 1;
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadItemDetails();
  }

  Future<void> _loadItemDetails() async {
    try {
      final items = await _menuRepo.fetchItems('demo-branch-7777');
      final matched = items.firstWhere((i) => i.id == widget.itemId);
      final modifiers = await _menuRepo.fetchModifiersForItem(widget.itemId);

      if (mounted) {
        setState(() {
          _item = matched;
          _modifierGroups = modifiers;
          
          for (final group in modifiers) {
            for (final opt in group.options) {
              if (opt.isDefault) _selectedOptions.add(opt);
            }
          }
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

  void _toggleOption(ModifierOption opt, ModifierGroup group) {
    setState(() {
      final inGroup = group.options.map((o) => o.id).toList();
      if (group.maxSelect == 1) {
        _selectedOptions.removeWhere((o) => inGroup.contains(o.id));
        _selectedOptions.add(opt);
      } else {
        if (_selectedOptions.any((o) => o.id == opt.id)) {
          _selectedOptions.removeWhere((o) => o.id == opt.id);
        } else {
          final count = _selectedOptions.where((o) => inGroup.contains(o.id)).length;
          if (count < group.maxSelect) {
            _selectedOptions.add(opt);
          }
        }
      }
    });
  }

  void _submit() {
    for (final group in _modifierGroups) {
      if (group.required) {
        final inGroup = group.options.map((o) => o.id).toList();
        final selected = _selectedOptions.where((o) => inGroup.contains(o.id));
        if (selected.length < group.minSelect) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Please select required modifier: ${group.name}'),
              backgroundColor: CafeCanvaColors.error,
            ),
          );
          return;
        }
      }
    }

    _addToCart(widget.slug, _item, _quantity, _selectedOptions, _notesController.text);
    context.go('/${widget.slug}');
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_errorMessage != null) return Scaffold(body: CcErrorState(error: _errorMessage!, onRetry: _loadItemDetails));

    int priceAggregator = _item.price;
    for (final opt in _selectedOptions) {
      priceAggregator += opt.extraPrice;
    }

    return Scaffold(
      appBar: AppBar(title: Text(_item.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_item.imageUrl != null)
              CachedNetworkImage(imageUrl: _item.imageUrl!, height: 200, fit: BoxFit.cover),
            Padding(
              padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(_item.name, style: const TextStyle(fontSize: 22.0, fontWeight: FontWeight.bold)),
                      ),
                      CcPriceText(priceInPaise: priceAggregator, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: CafeCanvaColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  
                  ..._modifierGroups.map((group) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 12.0),
                        Row(
                          children: [
                            Text(group.name, style: const TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold)),
                            if (group.required)
                              const Padding(
                                padding: EdgeInsets.only(left: 6.0),
                                child: Text('* REQUIRED', style: TextStyle(color: CafeCanvaColors.error, fontSize: 10.0, fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8.0),
                        ...group.options.map((opt) {
                          final isSelected = _selectedOptions.any((o) => o.id == opt.id);
                          return CheckboxListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(opt.name),
                            secondary: opt.extraPrice > 0 ? CcPriceText(priceInPaise: opt.extraPrice) : null,
                            value: isSelected,
                            onChanged: (_) => _toggleOption(opt, group),
                          );
                        }).toList(),
                      ],
                    );
                  }).toList(),
                  
                  const SizedBox(height: 16.0),
                  const Text('Instructions notes', style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8.0),
                  TextField(
                    controller: _notesController,
                    decoration: const InputDecoration(hintText: 'e.g. Extra hot, sugar free'),
                  ),
                  const SizedBox(height: 24.0),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantity', style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                          ),
                          Text('$_quantity', style: const TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold)),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: () => setState(() => _quantity++),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24.0),
                  
                  ElevatedButton(
                    onPressed: _submit,
                    child: Text('ADD TO BASKET (₹${((priceAggregator * _quantity) / 100).toStringAsFixed(0)})'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- SCREEN 4: BASKET / CHECKOUT & PAYMENTS ---
class CartScreen extends StatefulWidget {
  final String slug;

  const CartScreen({
    Key? key,
    required this.slug,
  }) : super(key: key);

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final OrderRepository _orderRepo = OrderRepository();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _tableController = TextEditingController();
  bool _isDineIn = true;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final cart = _getCart(widget.slug);
    
    int subtotal = 0;
    for (final item in cart) {
      int itemPrice = item['unitPrice'] as int;
      final mods = item['modifierSelections'] as List;
      for (final m in mods) {
        itemPrice += m['extra_price'] as int;
      }
      subtotal += itemPrice * (item['quantity'] as int);
    }
    
    int tax = (subtotal * 0.05).round();
    int total = subtotal + tax;

    Future<void> _placeOrder() async {
      final name = _nameController.text.trim();
      final phone = _phoneController.text.trim();
      final tableNum = _tableController.text.trim();

      if (name.isEmpty || phone.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter customer details'), backgroundColor: CafeCanvaColors.error),
        );
        return;
      }

      if (_isDineIn && tableNum.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter table number'), backgroundColor: CafeCanvaColors.error),
        );
        return;
      }

      setState(() => _isLoading = true);

      try {
        final List<Map<String, dynamic>> itemsData = cart.map((item) {
          final List mods = item['modifierSelections'] as List;
          return {
            'menuItemId': item['itemId'],
            'itemName': item['itemName'],
            'unitPrice': item['unitPrice'],
            'quantity': item['quantity'],
            'modifierSelections': mods.map((m) => {'name': m['name']}).toList(),
            'itemNotes': item['itemNotes'],
          };
        }).toList();

        // 1. Submit order
        final order = await _orderRepo.createOrder(
          tenantId: 'demo-tenant-5555',
          branchId: 'demo-branch-7777',
          tableId: _isDineIn ? 'demo-table-1' : null,
          customerId: null,
          subtotal: subtotal,
          discountAmount: 0,
          total: total,
          notes: _isDineIn ? 'Dine-In: Table $tableNum' : 'Takeaway',
          itemsData: itemsData,
        );

        // Blocker 1 & 6: trigger payment flow cross-platform via BillingFactory
        final paymentGateway = BillingFactory.createPaymentGateway();
        await paymentGateway.payWithRazorpay(
          razorpayOrderId: 'order_mock_123',
          keyId: 'rzp_test_1234',
          amountInPaise: total,
          storeName: 'CafeCanva',
          customerName: name,
          customerPhone: phone,
          themeColor: '#D97706',
        );

        _saveCart(widget.slug, []);

        if (mounted) {
          context.go('/${widget.slug}/track/${order.id}');
        }
      } catch (e) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(CcError.friendly(e)), backgroundColor: CafeCanvaColors.error),
        );
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text('My Basket')),
      body: cart.isEmpty
          ? const CcEmptyState(icon: Icons.shopping_basket, title: 'Basket is empty')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: cart.length,
                    separatorBuilder: (context, i) => const Divider(color: CafeCanvaColors.stone200),
                    itemBuilder: (context, index) {
                      final item = cart[index];
                      final mods = item['modifierSelections'] as List;
                      
                      return Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${item['itemName']} x${item['quantity']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                if (mods.isNotEmpty)
                                  Text(
                                    mods.map((m) => m['name']).join(', '),
                                    style: const TextStyle(fontSize: 12.0, color: CafeCanvaColors.stone500),
                                  ),
                              ],
                            ),
                          ),
                          CcPriceText(priceInPaise: (item['unitPrice'] as int) * (item['quantity'] as int)),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: CafeCanvaColors.error),
                            onPressed: () {
                              setState(() {
                                cart.removeAt(index);
                                _saveCart(widget.slug, cart);
                              });
                            },
                          ),
                        ],
                      );
                    },
                  ),
                  const Divider(),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Subtotal'),
                      CcPriceText(priceInPaise: subtotal),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('GST (5%)'),
                      CcPriceText(priceInPaise: tax),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('TOTAL PAYABLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                      CcPriceText(priceInPaise: total, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: CafeCanvaColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 24.0),

                  const Text('Customer Details', style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12.0),
                  TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Name')),
                  const SizedBox(height: 8.0),
                  TextField(controller: _phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone Number')),
                  const SizedBox(height: 16.0),
                  
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text('DINE IN')),
                          selected: _isDineIn,
                          onSelected: (val) => setState(() => _isDineIn = true),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: ChoiceChip(
                          label: const Center(child: Text('TAKEAWAY')),
                          selected: !_isDineIn,
                          onSelected: (val) => setState(() => _isDineIn = false),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12.0),
                  if (_isDineIn)
                    TextField(controller: _tableController, decoration: const InputDecoration(labelText: 'Table Number')),
                  
                  const SizedBox(height: 24.0),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _placeOrder,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('CONFIRM AND PLACE ORDER'),
                  ),
                ],
              ),
            ),
    );
  }
}

// --- SCREEN 5: ORDER TRACKING & PDF SHARE ---
class TrackScreen extends StatefulWidget {
  final String slug;
  final String orderId;

  const TrackScreen({
    Key? key,
    required this.slug,
    required this.orderId,
  }) : super(key: key);

  @override
  State<TrackScreen> createState() => _TrackScreenState();
}

class _TrackScreenState extends State<TrackScreen> {
  final OrderRepository _orderRepo = OrderRepository();
  bool _isLoading = true;
  OrderModel? _order;
  late Timer _realtimeMockTimer;

  @override
  void initState() {
    super.initState();
    _loadStatus();
    _realtimeMockTimer = Timer.periodic(const Duration(seconds: 8), (t) {
      _loadStatus();
    });
  }

  Future<void> _loadStatus() async {
    try {
      final active = await _orderRepo.fetchOrders('demo-branch-7777');
      final matched = active.firstWhere((o) => o.id == widget.orderId);
      if (mounted) {
        setState(() {
          _order = matched;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _realtimeMockTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_order == null) return const Scaffold(body: CcEmptyState(title: 'Missing order details'));

    final String status = _order!.status;
    int progressPercent = 10;
    if (status == 'confirmed') progressPercent = 35;
    if (status == 'preparing') progressPercent = 60;
    if (status == 'ready') progressPercent = 85;
    if (status == 'served' || status == 'paid') progressPercent = 100;

    return Scaffold(
      appBar: AppBar(title: const Text('Track Order')),
      body: Padding(
        padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Icon(
                status == 'ready' ? Icons.check_circle : Icons.cookie_outlined,
                size: 80.0,
                color: CafeCanvaColors.primary,
              ),
            ),
            const SizedBox(height: 24.0),
            Text(
              'ORDER STATUS: ${status.toUpperCase()}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18.0, letterSpacing: 0.5),
            ),
            const SizedBox(height: 16.0),
            LinearProgressIndicator(
              value: progressPercent / 100,
              backgroundColor: CafeCanvaColors.stone200,
              color: CafeCanvaColors.primary,
              minHeight: 8,
            ),
            const SizedBox(height: 24.0),
            CcCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Order details:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8.0),
                  ..._order!.items.map((i) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2.0),
                    child: Text('${i.itemName} x${i.quantity}'),
                  )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total'),
                      CcPriceText(priceInPaise: _order!.total),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24.0),
            ElevatedButton.icon(
              icon: const Icon(Icons.home),
              onPressed: () => context.go('/${widget.slug}'),
              label: const Text('BACK TO MENU'),
            ),
          ],
        ),
      ),
    );
  }
}
