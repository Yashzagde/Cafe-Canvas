/// Order item model. Prices in paise.
class OrderItem {
  final String id;
  final String orderId;
  final String? menuItemId;
  final String itemName;
  final int unitPrice; // paise
  final int quantity;
  final List<Map<String, dynamic>> modifiers;
  final String? notes;
  final String kdsStatus; // 'pending', 'preparing', 'ready', 'served'
  final DateTime? sentAt;

  const OrderItem({
    required this.id,
    required this.orderId,
    this.menuItemId,
    required this.itemName,
    required this.unitPrice,
    this.quantity = 1,
    this.modifiers = const [],
    this.notes,
    this.kdsStatus = 'pending',
    this.sentAt,
  });

  int get totalPaise => unitPrice * quantity;
  int get unitPriceInRupees => unitPrice ~/ 100;
  int get totalInRupees => totalPaise ~/ 100;

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        id: json['id'] as String,
        orderId: json['order_id'] as String,
        menuItemId: json['menu_item_id'] as String?,
        itemName: json['item_name'] as String,
        unitPrice: json['unit_price'] as int,
        quantity: json['quantity'] as int? ?? 1,
        modifiers: json['modifiers'] != null ? List<Map<String, dynamic>>.from((json['modifiers'] as List).map((e) => Map<String, dynamic>.from(e as Map))) : [],
        notes: json['notes'] as String?,
        kdsStatus: json['kds_status'] as String? ?? 'pending',
        sentAt: json['sent_at'] != null ? DateTime.parse(json['sent_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'order_id': orderId,
        'menu_item_id': menuItemId,
        'item_name': itemName,
        'unit_price': unitPrice,
        'quantity': quantity,
        'modifiers': modifiers,
        'notes': notes,
        'kds_status': kdsStatus,
      };

  OrderItem copyWith({String? kdsStatus, int? quantity, String? notes}) => OrderItem(
        id: id,
        orderId: orderId,
        menuItemId: menuItemId,
        itemName: itemName,
        unitPrice: unitPrice,
        quantity: quantity ?? this.quantity,
        modifiers: modifiers,
        notes: notes ?? this.notes,
        kdsStatus: kdsStatus ?? this.kdsStatus,
        sentAt: sentAt,
      );

  DateTime get createdAt => sentAt ?? DateTime.now();
  List<Map<String, dynamic>> get modifierSelections => modifiers;
  String? get itemNotes => notes;
}

typedef OrderItemModel = OrderItem;
