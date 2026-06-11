import 'dart:convert';

// ---------- SaaS Tenants & Branches ----------

class Tenant {
  final String id;
  final String name;
  final String mode;
  final int maxSubaccounts;
  final String status;
  final DateTime createdAt;

  Tenant({
    required this.id,
    required this.name,
    this.mode = 'SINGLE_STORE',
    this.maxSubaccounts = 50,
    this.status = 'ACTIVE',
    required this.createdAt,
  });

  factory Tenant.fromJson(Map<String, dynamic> json) => Tenant(
    id: json['id'] as String,
    name: json['name'] as String,
    mode: json['mode'] as String? ?? 'SINGLE_STORE',
    maxSubaccounts: json['max_subaccounts'] as int? ?? 50,
    status: json['status'] as String? ?? 'ACTIVE',
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'mode': mode,
    'max_subaccounts': maxSubaccounts,
    'status': status,
    'created_at': createdAt.toIso8601String(),
  };

  Tenant copyWith({
    String? id,
    String? name,
    String? mode,
    int? maxSubaccounts,
    String? status,
    DateTime? createdAt,
  }) => Tenant(
    id: id ?? this.id,
    name: name ?? this.name,
    mode: mode ?? this.mode,
    maxSubaccounts: maxSubaccounts ?? this.maxSubaccounts,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
  );
}

class Branch {
  final String id;
  final String tenantId;
  final String name;
  final String status;
  final DateTime createdAt;

  Branch({
    required this.id,
    required this.tenantId,
    required this.name,
    this.status = 'ACTIVE',
    required this.createdAt,
  });

  factory Branch.fromJson(Map<String, dynamic> json) => Branch(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String, // Safe mapping
    name: json['name'] as String,
    status: json['status'] as String? ?? 'ACTIVE',
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'name': name,
    'status': status,
    'created_at': createdAt.toIso8601String(),
  };

  Branch copyWith({
    String? id,
    String? tenantId,
    String? name,
    String? status,
    DateTime? createdAt,
  }) => Branch(
    id: id ?? this.id,
    tenantId: tenantId ?? this.tenantId,
    name: name ?? this.name,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
  );
}

// ---------- Core Users ----------

class UserProfile {
  final String id;
  final String? tenantId;
  final String? branchId;
  final String fullName;
  final String? email;
  final String? phone;
  final String role; // owner, manager, cashier, staff, kitchen
  final String status;
  final String? pinHash;
  final String? fcmToken;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    this.tenantId,
    this.branchId,
    required this.fullName,
    this.email,
    this.phone,
    this.role = 'staff',
    this.status = 'ACTIVE',
    this.pinHash,
    this.fcmToken,
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String?,
    branchId: json['branch_id'] as String?,
    fullName: json['full_name'] as String? ?? json['name'] as String? ?? 'Anonymous',
    email: json['email'] as String?,
    phone: json['phone'] as String?,
    role: json['role'] as String? ?? 'staff',
    status: json['status'] as String? ?? 'ACTIVE',
    pinHash: json['pin_hash'] as String?,
    fcmToken: json['fcm_token'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'full_name': fullName,
    'email': email,
    'phone': phone,
    'role': role,
    'status': status,
    'pin_hash': pinHash,
    'fcm_token': fcmToken,
    'created_at': createdAt.toIso8601String(),
  };

  Map<String, dynamic> toMinimalJson() => {
    'id': id,
    'name': fullName,
    'role': role,
    'branch_id': branchId,
  };

  UserProfile copyWith({
    String? id,
    String? tenantId,
    String? branchId,
    String? fullName,
    String? email,
    String? phone,
    String? role,
    String? status,
    String? pinHash,
    String? fcmToken,
    DateTime? createdAt,
  }) => UserProfile(
    id: id ?? this.id,
    tenantId: tenantId ?? this.tenantId,
    branchId: branchId ?? this.branchId,
    fullName: fullName ?? this.fullName,
    email: email ?? this.email,
    phone: phone ?? this.phone,
    role: role ?? this.role,
    status: status ?? this.status,
    pinHash: pinHash ?? this.pinHash,
    fcmToken: fcmToken ?? this.fcmToken,
    createdAt: createdAt ?? this.createdAt,
  );
}

// ---------- Menu & Modifier Management ----------

class MenuCategory {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final int sortOrder;
  final bool isVisible;
  final DateTime? deletedAt;
  final DateTime createdAt;

  MenuCategory({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.name,
    this.sortOrder = 0,
    this.isVisible = true,
    this.deletedAt,
    required this.createdAt,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) => MenuCategory(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: (json['branch_id'] ?? json['location_id'] ?? '') as String,
    name: json['name'] as String,
    sortOrder: json['sort_order'] as int? ?? 0,
    isVisible: json['is_visible'] as bool? ?? true,
    deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'name': name,
    'sort_order': sortOrder,
    'is_visible': isVisible,
    'deleted_at': deletedAt?.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
  };
}

class MenuItem {
  final String id;
  final String tenantId;
  final String branchId;
  final String categoryId;
  final String name;
  final String? description;
  final int price; // In Paise (Int)
  final String? imageUrl;
  final String status; // available, unavailable, hidden
  final bool allowsModifiers;
  final bool discountEligible;
  final String? createdBy;
  final DateTime? deletedAt;
  final DateTime createdAt;

  MenuItem({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.categoryId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.status = 'available',
    this.allowsModifiers = false,
    this.discountEligible = true,
    this.createdBy,
    this.deletedAt,
    required this.createdAt,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) => MenuItem(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    categoryId: json['category_id'] as String,
    name: json['name'] as String,
    description: json['description'] as String?,
    price: ((json['price'] as num) * 100).round(), // Blocker 6: num -> paise
    imageUrl: json['image_url'] as String?,
    status: json['status'] as String? ?? 'available',
    allowsModifiers: json['allows_modifiers'] as bool? ?? false,
    discountEligible: json['discount_eligible'] as bool? ?? true,
    createdBy: json['created_by'] as String?,
    deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'category_id': categoryId,
    'name': name,
    'description': description,
    'price': price / 100.0, // Blocker 6: paise -> num rate
    'image_url': imageUrl,
    'status': status,
    'allows_modifiers': allowsModifiers,
    'discount_eligible': discountEligible,
    'created_by': createdBy,
    'deleted_at': deletedAt?.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
  };
}

class ModifierGroup {
  final String id;
  final String itemId;
  final String name;
  final bool required;
  final int minSelect;
  final int maxSelect;
  final List<ModifierOption> options;

  ModifierGroup({
    required this.id,
    required this.itemId,
    required this.name,
    this.required = false,
    this.minSelect = 0,
    this.maxSelect = 1,
    this.options = const [],
  });

  factory ModifierGroup.fromJson(Map<String, dynamic> json, [List<ModifierOption> options = const []]) => ModifierGroup(
    id: json['id'] as String,
    itemId: json['item_id'] as String,
    name: json['name'] as String,
    required: json['required'] as bool? ?? false,
    minSelect: json['min_select'] as int? ?? 0,
    maxSelect: json['max_select'] as int? ?? 1,
    options: options,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'item_id': itemId,
    'name': name,
    'required': required,
    'min_select': minSelect,
    'max_select': maxSelect,
  };
}

class ModifierOption {
  final String id;
  final String groupId;
  final String name;
  final int extraPrice; // In Paise (Int)
  final bool isDefault;

  ModifierOption({
    required this.id,
    required this.groupId,
    required this.name,
    this.extraPrice = 0,
    this.isDefault = false,
  });

  factory ModifierOption.fromJson(Map<String, dynamic> json) => ModifierOption(
    id: json['id'] as String,
    groupId: json['group_id'] as String,
    name: json['name'] as String,
    extraPrice: ((json['extra_price'] as num) * 100).round(), // num -> paise
    isDefault: json['is_default'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'group_id': groupId,
    'name': name,
    'extra_price': extraPrice / 100.0, // paise -> num
    'is_default': isDefault,
  };
}

// ---------- Tables & Customer Sessions ----------

class TableModel {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final int capacity;
  final String section;
  final Map<String, dynamic> position;
  final String status; // available, occupied, reserved, cleaning
  final DateTime? deletedAt;
  final DateTime createdAt;

  TableModel({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.name,
    this.capacity = 2,
    this.section = 'Main Floor',
    this.position = const {'x': 0, 'y': 0},
    this.status = 'available',
    this.deletedAt,
    required this.createdAt,
  });

  factory TableModel.fromJson(Map<String, dynamic> json) => TableModel(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    name: json['name'] as String,
    capacity: json['capacity'] as int? ?? 2,
    section: json['section'] as String? ?? 'Main Floor',
    position: json['position'] is String 
        ? jsonDecode(json['position'] as String) as Map<String, dynamic>
        : json['position'] as Map<String, dynamic>? ?? const {'x': 0, 'y': 0},
    status: json['status'] as String? ?? 'available',
    deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'name': name,
    'capacity': capacity,
    'section': section,
    'position': position,
    'status': status,
    'deleted_at': deletedAt?.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
  };

  TableModel copyWith({
    String? id,
    String? tenantId,
    String? branchId,
    String? name,
    int? capacity,
    String? section,
    Map<String, dynamic>? position,
    String? status,
    DateTime? deletedAt,
    DateTime? createdAt,
  }) => TableModel(
    id: id ?? this.id,
    tenantId: tenantId ?? this.tenantId,
    branchId: branchId ?? this.branchId,
    name: name ?? this.name,
    capacity: capacity ?? this.capacity,
    section: section ?? this.section,
    position: position ?? this.position,
    status: status ?? this.status,
    deletedAt: deletedAt ?? this.deletedAt,
    createdAt: createdAt ?? this.createdAt,
  );
}

class Customer {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final String phone;
  final String? notes;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.name,
    required this.phone,
    this.notes,
    required this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    name: json['name'] as String,
    phone: json['phone'] as String,
    notes: json['notes'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'name': name,
    'phone': phone,
    'notes': notes,
    'created_at': createdAt.toIso8601String(),
  };
}

// ---------- Orders & Invoicing ----------

class OrderModel {
  final String id;
  final String tenantId;
  final String branchId;
  final String? tableId;
  final String? customerId;
  final String? createdBy;
  final String status; // pending, confirmed, preparing, ready, served, billed, paid, cancelled
  final String source; // staff_app, storefront
  final int subtotal; // In Paise (Int)
  final int discountAmount; // In Paise (Int)
  final List<dynamic> extraCharges;
  final int total; // In Paise (Int)
  final String? notes;
  final DateTime createdAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.tenantId,
    required this.branchId,
    this.tableId,
    this.customerId,
    this.createdBy,
    this.status = 'pending',
    this.source = 'staff_app',
    this.subtotal = 0,
    this.discountAmount = 0,
    this.extraCharges = const [],
    required this.total,
    this.notes,
    required this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json, [List<OrderItemModel> items = const []]) => OrderModel(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    tableId: json['table_id'] as String?,
    customerId: json['customer_id'] as String?,
    createdBy: json['created_by'] as String?,
    status: json['status'] as String? ?? 'pending',
    source: json['source'] as String? ?? 'staff_app',
    subtotal: ((json['subtotal'] as num? ?? 0) * 100).round(), // Blocker 6: num -> paise
    discountAmount: ((json['discount_amount'] as num? ?? 0) * 100).round(),
    extraCharges: json['extra_charges'] is String 
        ? jsonDecode(json['extra_charges'] as String) as List<dynamic>
        : json['extra_charges'] as List<dynamic>? ?? const [],
    total: ((json['total'] as num) * 100).round(),
    notes: json['notes'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
    items: items,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'table_id': tableId,
    'customer_id': customerId,
    'created_by': createdBy,
    'status': status,
    'source': source,
    'subtotal': subtotal / 100.0, // Blocker 6: paise -> num
    'discount_amount': discountAmount / 100.0,
    'extra_charges': extraCharges,
    'total': total / 100.0,
    'notes': notes,
    'created_at': createdAt.toIso8601String(),
  };

  OrderModel copyWith({
    String? id,
    String? tenantId,
    String? branchId,
    String? tableId,
    String? customerId,
    String? createdBy,
    String? status,
    String? source,
    int? subtotal,
    int? discountAmount,
    List<dynamic>? extraCharges,
    int? total,
    String? notes,
    DateTime? createdAt,
    List<OrderItemModel>? items,
  }) => OrderModel(
    id: id ?? this.id,
    tenantId: tenantId ?? this.tenantId,
    branchId: branchId ?? this.branchId,
    tableId: tableId ?? this.tableId,
    customerId: customerId ?? this.customerId,
    createdBy: createdBy ?? this.createdBy,
    status: status ?? this.status,
    source: source ?? this.source,
    subtotal: subtotal ?? this.subtotal,
    discountAmount: discountAmount ?? this.discountAmount,
    extraCharges: extraCharges ?? this.extraCharges,
    total: total ?? this.total,
    notes: notes ?? this.notes,
    createdAt: createdAt ?? this.createdAt,
    items: items ?? this.items,
  );
}

class OrderItemModel {
  final String id;
  final String orderId;
  final String? menuItemId;
  final int quantity;
  final int unitPrice; // In Paise (Int)
  final List<dynamic> modifierSelections;
  final String itemName;
  final String? itemNotes;
  final DateTime createdAt;

  OrderItemModel({
    required this.id,
    required this.orderId,
    this.menuItemId,
    this.quantity = 1,
    required this.unitPrice,
    this.modifierSelections = const [],
    required this.itemName,
    this.itemNotes,
    required this.createdAt,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) => OrderItemModel(
    id: json['id'] as String,
    orderId: json['order_id'] as String,
    menuItemId: json['menu_item_id'] as String?,
    quantity: json['quantity'] as int? ?? 1,
    unitPrice: ((json['unit_price'] as num) * 100).round(), // num -> paise
    modifierSelections: json['modifier_selections'] is String 
        ? jsonDecode(json['modifier_selections'] as String) as List<dynamic>
        : json['modifier_selections'] as List<dynamic>? ?? const [],
    itemName: json['item_name'] as String,
    itemNotes: json['item_notes'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'order_id': orderId,
    'menu_item_id': menuItemId,
    'quantity': quantity,
    'unit_price': unitPrice / 100.0, // paise -> num
    'modifier_selections': modifierSelections,
    'item_name': itemName,
    'item_notes': itemNotes,
    'created_at': createdAt.toIso8601String(),
  };
}

class BillModel {
  final String id;
  final String tenantId;
  final String branchId;
  final String? tableId;
  final List<String> orderIds;
  final int subtotal; // In Paise (Int)
  final int tax; // In Paise (Int)
  final int discountAmount; // In Paise (Int)
  final List<dynamic> extraCharges;
  final int total; // In Paise (Int)
  final String status; // open, paid, voided
  final String? paymentMethod;
  final DateTime? paidAt;
  final String? createdBy;
  final DateTime createdAt;

  BillModel({
    required this.id,
    required this.tenantId,
    required this.branchId,
    this.tableId,
    this.orderIds = const [],
    required this.subtotal,
    this.tax = 0,
    this.discountAmount = 0,
    this.extraCharges = const [],
    required this.total,
    this.status = 'open',
    this.paymentMethod,
    this.paidAt,
    this.createdBy,
    required this.createdAt,
  });

  factory BillModel.fromJson(Map<String, dynamic> json) {
    var rawOrders = json['orders'] ?? json['order_ids'];
    List<String> parsedIds = [];
    if (rawOrders is List) {
      parsedIds = rawOrders.map((o) => o.toString()).toList();
    } else if (rawOrders is String) {
      try {
        var decoded = jsonDecode(rawOrders);
        if (decoded is List) {
          parsedIds = decoded.map((o) => o.toString()).toList();
        }
      } catch (_) {}
    }

    return BillModel(
      id: json['id'] as String,
      tenantId: (json['tenant_id'] ?? json['org_id']) as String,
      branchId: json['branch_id'] as String,
      tableId: json['table_id'] as String?,
      orderIds: parsedIds,
      subtotal: ((json['subtotal'] as num) * 100).round(), // num -> paise
      tax: ((json['tax'] as num? ?? 0) * 100).round(),
      discountAmount: ((json['discount_amount'] as num? ?? 0) * 100).round(),
      extraCharges: json['extra_charges'] is String 
          ? jsonDecode(json['extra_charges'] as String) as List<dynamic>
          : json['extra_charges'] as List<dynamic>? ?? const [],
      total: ((json['total'] as num) * 100).round(),
      status: json['status'] as String? ?? 'open',
      paymentMethod: json['payment_method'] as String?,
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at'] as String) : null,
      createdBy: json['created_by'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'table_id': tableId,
    'orders': orderIds,
    'subtotal': subtotal / 100.0, // paise -> num
    'tax': tax / 100.0,
    'discount_amount': discountAmount / 100.0,
    'extra_charges': extraCharges,
    'total': total / 100.0,
    'status': status,
    'payment_method': paymentMethod,
    'paid_at': paidAt?.toIso8601String(),
    'created_by': createdBy,
    'created_at': createdAt.toIso8601String(),
  };
}

class TableSession {
  final String id;
  final String tableId;
  final String tenantId;
  final DateTime checkInAt;
  final DateTime? checkOutAt;
  final int? durationMinutes;
  final int totalRevenue; // In Paise
  final int customerCount;
  final String? assignedStaffId;
  final String? billId;

  TableSession({
    required this.id,
    required this.tableId,
    required this.tenantId,
    required this.checkInAt,
    this.checkOutAt,
    this.durationMinutes,
    this.totalRevenue = 0,
    this.customerCount = 1,
    this.assignedStaffId,
    this.billId,
  });

  factory TableSession.fromJson(Map<String, dynamic> json) => TableSession(
    id: json['id'] as String,
    tableId: json['table_id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    checkInAt: DateTime.parse(json['check_in_at'] as String),
    checkOutAt: json['check_out_at'] != null ? DateTime.parse(json['check_out_at'] as String) : null,
    durationMinutes: json['duration_minutes'] as int?,
    totalRevenue: ((json['total_revenue'] as num? ?? 0) * 100).round(), // num -> paise
    customerCount: json['customer_count'] as int? ?? 1,
    assignedStaffId: json['assigned_staff_id'] as String?,
    billId: json['bill_id'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'table_id': tableId,
    'tenant_id': tenantId,
    'check_in_at': checkInAt.toIso8601String(),
    'check_out_at': checkOutAt?.toIso8601String(),
    'duration_minutes': durationMinutes,
    'total_revenue': totalRevenue / 100.0, // paise -> num
    'customer_count': customerCount,
    'assigned_staff_id': assignedStaffId,
    'bill_id': billId,
  };
}

class StaffCall {
  final String id;
  final String tenantId;
  final String tableId;
  final String? sessionId;
  final DateTime calledAt;
  final DateTime? attendedAt;
  final String? attendedBy;
  final String status; // pending, attended, ignored

  StaffCall({
    required this.id,
    required this.tenantId,
    required this.tableId,
    this.sessionId,
    required this.calledAt,
    this.attendedAt,
    this.attendedBy,
    this.status = 'pending',
  });

  factory StaffCall.fromJson(Map<String, dynamic> json) => StaffCall(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    tableId: json['table_id'] as String,
    sessionId: json['session_id'] as String?,
    calledAt: DateTime.parse(json['called_at'] as String),
    attendedAt: json['attended_at'] != null ? DateTime.parse(json['attended_at'] as String) : null,
    attendedBy: json['attended_by'] as String?,
    status: json['status'] as String? ?? 'pending',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'table_id': tableId,
    'session_id': sessionId,
    'called_at': calledAt.toIso8601String(),
    'attended_at': attendedAt?.toIso8601String(),
    'attended_by': attendedBy,
    'status': status,
  };
}

// ---------- Store Settings & Config ----------

class StoreSettings {
  final String id;
  final String tenantId;
  final String branchId;
  final String storeName;
  final String? address;
  final String? phone;
  final String? email;
  final String? gstin;
  final String currency;
  final String timezone;
  final String printerWidth; // mm80 or mm58

  StoreSettings({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.storeName,
    this.address,
    this.phone,
    this.email,
    this.gstin,
    this.currency = 'INR',
    this.timezone = 'Asia/Kolkata',
    this.printerWidth = 'mm80',
  });

  factory StoreSettings.fromJson(Map<String, dynamic> json) => StoreSettings(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    storeName: json['store_name'] as String,
    address: json['address'] as String?,
    phone: json['phone'] as String?,
    email: json['email'] as String?,
    gstin: json['gstin'] as String?,
    currency: json['currency'] as String? ?? 'INR',
    timezone: json['timezone'] as String? ?? 'Asia/Kolkata',
    printerWidth: json['printer_width'] as String? ?? 'mm80', // Fetch default Mm preference
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'store_name': storeName,
    'address': address,
    'phone': phone,
    'email': email,
    'gstin': gstin,
    'currency': currency,
    'timezone': timezone,
    'printer_width': printerWidth,
  };
}

class Branding {
  final String id;
  final String tenantId;
  final String branchId;
  final String? logoUrl;
  final String? bannerUrl;
  final String primaryColor;
  final String secondaryColor;
  final String backgroundColor;
  final String fontFamily;

  Branding({
    required this.id,
    required this.tenantId,
    required this.branchId,
    this.logoUrl,
    this.bannerUrl,
    this.primaryColor = '#F59E0B',
    this.secondaryColor = '#C2410C',
    this.backgroundColor = '#FAFAF7',
    this.fontFamily = 'DM Sans',
  });

  factory Branding.fromJson(Map<String, dynamic> json) => Branding(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    logoUrl: json['logo_url'] as String?,
    bannerUrl: json['banner_url'] as String?,
    primaryColor: json['primary_color'] as String? ?? '#F59E0B',
    secondaryColor: json['secondary_color'] as String? ?? '#C2410C',
    backgroundColor: json['background_color'] as String? ?? '#FAFAF7',
    fontFamily: json['font_family'] as String? ?? 'DM Sans',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'logo_url': logoUrl,
    'banner_url': bannerUrl,
    'primary_color': primaryColor,
    'secondary_color': secondaryColor,
    'background_color': backgroundColor,
    'font_family': fontFamily,
  };
}

class StorefrontConfig {
  final String id;
  final String tenantId;
  final String branchId;
  final String slug;
  final String? domain;
  final bool isActive;
  final bool allowOnlineOrders;
  final bool allowPayAtCounter;
  final int taxRatePercent;
  final int serviceChargePercent;

  StorefrontConfig({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.slug,
    this.domain,
    this.isActive = true,
    this.allowOnlineOrders = true,
    this.allowPayAtCounter = true,
    this.taxRatePercent = 5,
    this.serviceChargePercent = 5,
  });

  factory StorefrontConfig.fromJson(Map<String, dynamic> json) => StorefrontConfig(
    id: json['id'] as String,
    tenantId: (json['tenant_id'] ?? json['org_id']) as String,
    branchId: json['branch_id'] as String,
    slug: json['slug'] as String,
    domain: json['domain'] as String?,
    isActive: json['is_active'] as bool? ?? true,
    allowOnlineOrders: json['allow_online_orders'] as bool? ?? true,
    allowPayAtCounter: json['allow_pay_at_counter'] as bool? ?? true,
    taxRatePercent: json['tax_rate_percent'] as int? ?? 5,
    serviceChargePercent: json['service_charge_percent'] as int? ?? 5,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenant_id': tenantId,
    'branch_id': branchId,
    'slug': slug,
    'domain': domain,
    'is_active': isActive,
    'allow_online_orders': allowOnlineOrders,
    'allow_pay_at_counter': allowPayAtCounter,
    'tax_rate_percent': taxRatePercent,
    'service_charge_percent': serviceChargePercent,
  };
}
