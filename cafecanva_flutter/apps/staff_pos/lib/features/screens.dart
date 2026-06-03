import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_billing/cafecanva_billing.dart';

final Map<String, List<Map<String, dynamic>>> _posTableCarts = {};

List<Map<String, dynamic>> _getPosCart(String tableId) {
  return _posTableCarts[tableId] ??= [];
}

void _addPosItem(String tableId, MenuItem item, List<ModifierOption> mods, String notes) {
  final cart = _getPosCart(tableId);
  final List<Map<String, dynamic>> modData = mods.map((m) => {
    'id': m.id,
    'name': m.name,
    'extra_price': m.extraPrice,
  }).toList();

  cart.add({
    'menuItemId': item.id,
    'itemName': item.name,
    'quantity': 1,
    'unitPrice': item.price,
    'modifierSelections': modData,
    'itemNotes': notes,
  });
}

// --- SCREEN 1: SECURE PIN PAD RE-AUTH (BLOCKER 2) ---
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final List<int> _pinDigits = [];
  bool _isLoading = false;
  String? _errorMsg;

  void _onDigitPressed(int val) {
    if (_pinDigits.length >= 4) return;
    setState(() {
      _pinDigits.add(val);
      _errorMsg = null;
    });

    if (_pinDigits.length == 4) {
      _authenticate();
    }
  }

  void _onDeletePressed() {
    if (_pinDigits.isEmpty) return;
    setState(() => _pinDigits.removeLast());
  }

  Future<void> _authenticate() async {
    setState(() => _isLoading = true);
    final pin = _pinDigits.join();

    try {
      // Blocker 2: Verify quick PIN securely against stored Bcrypt hashes
      final match = await AuthService.instance.verifyOfflinePin(pin);
      if (match) {
        context.go('/floor');
      } else {
        setState(() {
          _errorMsg = 'Incorrect POS PIN. Access Denied.';
          _pinDigits.clear();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMsg = CcError.friendly(e);
        _pinDigits.clear();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CafeCanvaColors.stone50,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.lock_person_outlined, size: 54.0, color: CafeCanvaColors.primary),
              const SizedBox(height: 12.0),
              const Text(
                'STAFF LOGIN',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.black, fontSize: 20.0, letterSpacing: 0.5),
              ),
              const SizedBox(height: 4.0),
              const Text(
                'Enter your 4-digit POS PIN',
                textAlign: TextAlign.center,
                style: TextStyle(color: CafeCanvaColors.stone500, fontSize: 13.0),
              ),
              const SizedBox(height: 24.0),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  final filled = index < _pinDigits.length;
                  return Container(
                    width: 16.0,
                    height: 16.0,
                    margin: const EdgeInsets.symmetric(horizontal: 8.0),
                    decoration: BoxDecoration(
                      color: filled ? CafeCanvaColors.primary : CafeCanvaColors.stone200,
                      shape: BoxShape.circle,
                    ),
                  );
                }),
              ),
              
              if (_errorMsg != null) ...[
                const SizedBox(height: 16.0),
                Text(
                  _errorMsg!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: CafeCanvaColors.error, fontSize: 12.0, fontWeight: FontWeight.bold),
                ),
              ],
              
              const SizedBox(height: 32.0),
              
              Expanded(
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 1.5,
                  ),
                  itemCount: 12,
                  itemBuilder: (context, index) {
                    if (index == 9) {
                      return IconButton(
                        icon: const Icon(Icons.backspace_outlined),
                        onPressed: _onDeletePressed,
                      );
                    }
                    if (index == 11) {
                      return const SizedBox.shrink();
                    }
                    
                    final val = index == 10 ? 0 : index + 1;
                    return InkWell(
                      onTap: () => _onDigitPressed(val),
                      borderRadius: BorderRadius.circular(40),
                      child: Center(
                        child: Text(
                          '$val',
                          style: const TextStyle(fontSize: 22.0, fontWeight: FontWeight.bold),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// --- SCREEN 2: TABLE FLOOR GRID (BLOCKER 3) ---
class FloorPlanScreen extends StatefulWidget {
  const FloorPlanScreen({Key? key}) : super(key: key);

  @override
  State<FloorPlanScreen> createState() => _FloorPlanScreenState();
}

class _FloorPlanScreenState extends State<FloorPlanScreen> {
  final TableRepository _tableRepo = TableRepository();
  bool _isLoading = true;
  String? _errorMessage;
  List<TableModel> _tables = [];

  @override
  void initState() {
    super.initState();
    _loadTables();
    
    // Blocker 3: Postgres real-time channels strictly bounded inside branch isolation filters
    RealtimeService.instance.subscribeToTableChanges(
      branchId: 'demo-branch-7777',
      onTableUpdated: (payload) {
        _loadTables();
      },
    );
  }

  Future<void> _loadTables() async {
    try {
      final list = await _tableRepo.fetchTables('demo-branch-7777');
      
      // Fetch and cache branch printer width preference from Supabase to Hive
      try {
        final settingsRes = await Supabase.instance.client
            .from('store_settings')
            .select('printer_width')
            .eq('branch_id', 'demo-branch-7777')
            .maybeSingle();
        if (settingsRes != null) {
          final width = settingsRes['printer_width'] as String? ?? 'mm80';
          await Hive.box('session').put('printer_width', width);
        }
      } catch (_) {
        // Silently fallback if offline
      }

      if (mounted) {
        setState(() {
          _tables = list;
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

  void _showTableOptions(TableModel table) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                table.name,
                style: const TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4.0),
              Text(
                'Section: ${table.section}  •  Capacity: ${table.capacity}',
                style: const TextStyle(color: CafeCanvaColors.stone500, fontSize: 13.0),
              ),
              const Divider(height: 24.0),
              
              ListTile(
                leading: const Icon(Icons.add_shopping_cart, color: CafeCanvaColors.primary),
                title: const Text('Start New Order', style: TextStyle(fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/order/${table.id}');
                },
              ),
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined, color: CafeCanvaColors.success),
                title: const Text('View Bill / Settlement', style: TextStyle(fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(context);
                  context.go('/settlement/${table.id}');
                },
              ),
              ListTile(
                leading: const Icon(Icons.cleaning_services_outlined, color: CafeCanvaColors.info),
                title: const Text('Mark Table Cleaning'),
                onTap: () async {
                  await _tableRepo.updateTableStatus(table.id, 'cleaning');
                  Navigator.pop(context);
                  _loadTables();
                },
              ),
              ListTile(
                leading: const Icon(Icons.check_circle_outline, color: CafeCanvaColors.tableAvailable),
                title: const Text('Mark Table Available'),
                onTap: () async {
                  await _tableRepo.updateTableStatus(table.id, 'available');
                  Navigator.pop(context);
                  _loadTables();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    RealtimeService.instance.unsubscribeAll();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_errorMessage != null) return Scaffold(body: CcErrorState(error: _errorMessage!, onRetry: _loadTables));

    return Scaffold(
      appBar: AppBar(
        title: const Text('FLOOR PLAN GRID'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTables,
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.table_bar), label: 'Tables'),
          BottomNavigationBarItem(icon: Icon(Icons.kitchen), label: 'KDS served'),
        ],
        onTap: (index) {
          if (index == 1) {
            context.go('/active-orders');
          }
        },
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.9,
          crossAxisSpacing: CafeCanvaSpacing.md,
          mainAxisSpacing: CafeCanvaSpacing.md,
        ),
        itemCount: _tables.length,
        itemBuilder: (context, index) {
          final t = _tables[index];
          return CcTableCard(
            table: t,
            onTap: () => _showTableOptions(t),
          );
        },
      ),
    );
  }
}

// --- SCREEN 3: MENU ORDER BUILDER ---
class OrderBuilderScreen extends StatefulWidget {
  final String tableId;

  const OrderBuilderScreen({
    Key? key,
    required this.tableId,
  }) : super(key: key);

  @override
  State<OrderBuilderScreen> createState() => _OrderBuilderScreenState();
}

class _OrderBuilderScreenState extends State<OrderBuilderScreen> {
  final MenuRepository _menuRepo = MenuRepository();
  final OrderRepository _orderRepo = OrderRepository();

  bool _isLoading = true;
  String? _errorMessage;
  
  List<MenuCategory> _categories = [];
  List<MenuItem> _items = [];
  List<MenuItem> _filteredItems = [];
  String? _selectedCategoryId;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadMenu();
  }

  Future<void> _loadMenu() async {
    try {
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

  void _showModifiersSheet(MenuItem item) async {
    final modifiers = await _menuRepo.fetchModifiersForItem(item.id);
    final List<ModifierOption> chosenOpts = [];
    final TextEditingController itemNotesCont = TextEditingController();

    for (final grp in modifiers) {
      for (final opt in grp.options) {
        if (opt.isDefault) chosenOpts.add(opt);
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: CafeCanvaRadius.lg)),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            void toggleOpt(ModifierOption opt, ModifierGroup group) {
              setSheetState(() {
                final inGroup = group.options.map((o) => o.id).toList();
                if (group.maxSelect == 1) {
                  chosenOpts.removeWhere((o) => inGroup.contains(o.id));
                  chosenOpts.add(opt);
                } else {
                  if (chosenOpts.any((o) => o.id == opt.id)) {
                    chosenOpts.removeWhere((o) => o.id == opt.id);
                  } else {
                    chosenOpts.add(opt);
                  }
                }
              });
            }

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
                    Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18.0)),
                    const SizedBox(height: 8.0),
                    
                    ...modifiers.map((group) => Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 12.0),
                        Text(group.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.0)),
                        ...group.options.map((opt) {
                          final isSelected = chosenOpts.any((o) => o.id == opt.id);
                          return CheckboxListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(opt.name),
                            secondary: opt.extraPrice > 0 ? CcPriceText(priceInPaise: opt.extraPrice) : null,
                            value: isSelected,
                            onChanged: (_) => toggleOpt(opt, group),
                          );
                        }).toList(),
                      ],
                    )).toList(),

                    const SizedBox(height: 12.0),
                    TextField(controller: itemNotesCont, decoration: const InputDecoration(labelText: 'Item specific request notes')),
                    const SizedBox(height: 24.0),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _addPosItem(widget.tableId, item, chosenOpts, itemNotesCont.text);
                        });
                        Navigator.pop(context);
                      },
                      child: const Text('ADD ITEM TO TICKET'),
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

  Future<void> _submitActiveCart() async {
    final cart = _getPosCart(widget.tableId);
    if (cart.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      int subtotal = 0;
      for (final i in cart) {
        int itemCost = i['unitPrice'] as int;
        final List mods = i['modifierSelections'] as List;
        for (final m in mods) {
          itemCost += m['extra_price'] as int;
        }
        subtotal += itemCost * (i['quantity'] as int);
      }
      
      int tax = (subtotal * 0.05).round();
      int total = subtotal + tax;

      final List<Map<String, dynamic>> itemsData = cart.map((i) {
        final List mods = i['modifierSelections'] as List;
        return {
          'menuItemId': i['menuItemId'],
          'itemName': i['itemName'],
          'unitPrice': i['unitPrice'],
          'quantity': i['quantity'],
          'modifierSelections': mods.map((m) => {'name': m['name']}).toList(),
          'itemNotes': i['itemNotes'],
        };
      }).toList();

      await _orderRepo.createOrder(
        tenantId: 'demo-tenant-5555',
        branchId: 'demo-branch-7777',
        tableId: widget.tableId,
        customerId: null,
        subtotal: subtotal,
        discountAmount: 0,
        total: total,
        notes: 'Placed by Waiter POS',
        itemsData: itemsData,
      );

      setState(() {
        _posTableCarts[widget.tableId] = [];
      });

      context.go('/floor');
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(CcError.friendly(e)), backgroundColor: CafeCanvaColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_errorMessage != null) return Scaffold(body: CcErrorState(error: _errorMessage!, onRetry: _loadMenu));

    final cart = _getPosCart(widget.tableId);

    return Scaffold(
      appBar: AppBar(title: const Text('POS ORDER BUILDER')),
      body: Column(
        children: [
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
          
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.82,
                      crossAxisSpacing: CafeCanvaSpacing.md,
                      mainAxisSpacing: CafeCanvaSpacing.md,
                    ),
                    itemCount: _filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = _filteredItems[index];
                      return CcMenuItemCard(
                        item: item,
                        onAdd: () {
                          if (item.allowsModifiers) {
                            _showModifiersSheet(item);
                          } else {
                            setState(() {
                              _addPosItem(widget.tableId, item, [], '');
                            });
                          }
                        },
                      );
                    },
                  ),
                ),
                
                Container(
                  width: 280.0,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(left: BorderSide(color: CafeCanvaColors.stone200)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(CafeCanvaSpacing.md),
                        child: Text('Active Table Ticket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                      ),
                      const Divider(height: 1),
                      Expanded(
                        child: cart.isEmpty
                            ? const Center(child: Text('No items added yet', style: TextStyle(color: Colors.black26)))
                            : ListView.builder(
                                itemCount: cart.length,
                                itemBuilder: (context, idx) {
                                  final i = cart[idx];
                                  return ListTile(
                                    title: Text('${i['itemName']} x${i['quantity']}'),
                                    subtitle: i['itemNotes'] != '' ? Text(i['itemNotes']) : null,
                                    trailing: IconButton(
                                      icon: const Icon(Icons.delete, color: CafeCanvaColors.error),
                                      onPressed: () {
                                        setState(() {
                                          cart.removeAt(idx);
                                        });
                                      },
                                    ),
                                  );
                                },
                              ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                        child: ElevatedButton(
                          onPressed: cart.isEmpty ? null : _submitActiveCart,
                          child: const Text('SEND TO KITCHEN'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- SCREEN 4: ACTIVE ORDERS KDS QUEUE ---
class ActiveOrdersQueue extends StatefulWidget {
  const ActiveOrdersQueue({Key? key}) : super(key: key);

  @override
  State<ActiveOrdersQueue> createState() => _ActiveOrdersQueueState();
}

class _ActiveOrdersQueueState extends State<ActiveOrdersQueue> {
  final OrderRepository _orderRepo = OrderRepository();
  bool _isLoading = true;
  List<OrderModel> _orders = [];

  @override
  void initState() {
    super.initState();
    _loadActive();
  }

  Future<void> _loadActive() async {
    try {
      final list = await _orderRepo.fetchOrders('demo-branch-7777');
      if (mounted) {
        setState(() {
          _orders = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _markServed(String id) async {
    await _orderRepo.updateOrderStatus(id, 'served');
    _loadActive();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final activeOrders = _orders.where((o) => o.status == 'ready' || o.status == 'preparing').toList();

    return Scaffold(
      appBar: AppBar(title: const Text('ACTIVE ORDERS QUEUE')),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 1,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.table_bar), label: 'Tables'),
          BottomNavigationBarItem(icon: Icon(Icons.kitchen), label: 'KDS served'),
        ],
        onTap: (index) {
          if (index == 0) {
            context.go('/floor');
          }
        },
      ),
      body: activeOrders.isEmpty
          ? const CcEmptyState(icon: Icons.check_circle_outline, title: 'No active orders in preparation', description: 'All kitchen tickets are served.')
          : ListView.builder(
              padding: const EdgeInsets.all(CafeCanvaSpacing.md),
              itemCount: activeOrders.length,
              itemBuilder: (context, index) {
                final o = activeOrders[index];
                return CcCard(
                  padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Order ID: ${o.id.substring(0, 6)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4.0),
                            ...o.items.map((i) => Text('${i.itemName} x${i.quantity}')),
                            const SizedBox(height: 4.0),
                            CcStatusBadge(status: o.status),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => _markServed(o.id),
                        child: const Text('SERVED OUT'),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

// --- SCREEN 5: SETTLEMENT / BILLING SCREEN (BLOCKER 1 & MM PREFERENCE) ---
class BillSettlementScreen extends StatefulWidget {
  final String tableId;

  const BillSettlementScreen({
    Key? key,
    required this.tableId,
  }) : super(key: key);

  @override
  State<BillSettlementScreen> createState() => _BillSettlementScreenState();
}

class _BillSettlementScreenState extends State<BillSettlementScreen> {
  final BillingRepository _billingRepo = BillingRepository();
  final TableRepository _tableRepo = TableRepository();

  bool _isLoading = true;
  String? _errorMessage;
  
  BillModel? _bill;
  double _cashTendered = 0.0;
  double _changeDue = 0.0;

  @override
  void initState() {
    super.initState();
    _triggerBillGeneration();
  }

  Future<void> _triggerBillGeneration() async {
    try {
      setState(() => _isLoading = true);
      final bill = await _billingRepo.generateBill(
        tableId: widget.tableId,
        tenantId: 'demo-tenant-5555',
        branchId: 'demo-branch-7777',
        createdBy: 'demo-user-1234-5678',
      );

      if (mounted) {
        setState(() {
          _bill = bill;
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

  Future<void> _settleBill(String method) async {
    if (_bill == null) return;
    setState(() => _isLoading = true);

    try {
      // 1. Settle in the database
      await _billingRepo.settleBillDirect(billId: _bill!.id, paymentMethod: method);
      
      // 2. Settle payment gateways natively on mobiles (or trigger mock successful Razorpay validations)
      if (method == 'upi' || method == 'card') {
        final gateway = BillingFactory.createPaymentGateway();
        await gateway.payWithRazorpay(
          razorpayOrderId: 'order_mock_pos',
          keyId: 'rzp_test_1234',
          amountInPaise: _bill!.total,
          storeName: 'CafeCanva',
          customerName: 'POS Settle',
          customerPhone: '9999999999',
          themeColor: '#D97706',
        );
      }

      // 3. Print thermal receipt utilizing user printer width setting preference mm80/mm58
      final sessionBox = Hive.box('session');
      final cachedWidth = sessionBox.get('printer_width', defaultValue: 'mm80') as String;

      final printService = BillingFactory.createPrintService(mode: PrintMode.bluetooth);
      await printService.printReceipt(
        bill: _bill!,
        settings: StoreSettings(
          id: 'demo-sett',
          tenantId: 'demo-tenant-5555',
          branchId: 'demo-branch-7777',
          storeName: 'CafeCanva',
          printerWidth: cachedWidth,
        ),
        items: [],
      );

      context.go('/floor');
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(CcError.friendly(e)), backgroundColor: CafeCanvaColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_errorMessage != null) return Scaffold(body: CcErrorState(error: _errorMessage!, onRetry: _triggerBillGeneration));

    final totalCost = _bill!.total;

    return Scaffold(
      appBar: AppBar(title: const Text('BILL SETTLEMENT')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(CafeCanvaSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CcCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Text(
                      'TABLE INVOICE',
                      style: GoogleFonts.dmSans(fontWeight: FontWeight.bold, fontSize: 16.0),
                    ),
                  ),
                  const Divider(height: 24),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('Subtotal'),
                      CcPriceText(priceInPaise: _bill!.subtotal),
                    ],
                  ),
                  const SizedBox(height: 6.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('CGST (2.50%)'),
                      CcPriceText(priceInPaise: (_bill!.tax / 2).round()),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('SGST (2.50%)'),
                      CcPriceText(priceInPaise: (_bill!.tax / 2).round()),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('GRAND TOTAL PAYABLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0)),
                      CcPriceText(priceInPaise: totalCost, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0, color: CafeCanvaColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24.0),
            
            const Text('Cash settlement calculator:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8.0),
            TextField(
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                prefixText: '₹ ',
                labelText: 'Cash Tendered',
              ),
              onChanged: (val) {
                final double? amt = double.tryParse(val);
                if (amt != null) {
                  setState(() {
                    _cashTendered = amt;
                    _changeDue = amt - (totalCost / 100.0);
                  });
                }
              },
            ),
            if (_cashTendered > 0) ...[
              const SizedBox(height: 12.0),
              Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Change Due back:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    '₹ ${_changeDue.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16.0,
                      color: _changeDue >= 0 ? CafeCanvaColors.success : CafeCanvaColors.error,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 24.0),
            
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: CafeCanvaColors.success),
              onPressed: () => _settleBill('cash'),
              child: const Text('SETTLE BILL WITH CASH'),
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: CafeCanvaColors.info),
              onPressed: () => _settleBill('card'),
              child: const Text('SETTLE BILL WITH CARD'),
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: CafeCanvaColors.primary),
              onPressed: () => _settleBill('upi'),
              child: const Text('SETTLE BILL VIA UPI'),
            ),
          ],
        ),
      ),
    );
  }
}
