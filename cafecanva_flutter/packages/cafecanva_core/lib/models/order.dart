/// Order model. All amounts in paise.
class Order {
  final String id;
  final String tenantId;
  final String branchId;
  final String? tableId;
  final String? customerName;
  final int customerCount;
  final String status;
  final int subtotal; // paise
  final int discountAmount; // paise
  final int total; // paise
  final String? notes;
  final String? localRef;
  final String? createdBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<OrderItem> items;

  const Order({
    required this.id,
    required this.tenantId,
    required this.branchId,
    this.tableId,
    this.customerName,
    this.customerCount = 1,
    this.status = 'pending',
    this.subtotal = 0,
    this.discountAmount = 0,
    this.total = 0,
    this.notes,
    this.localRef,
    this.createdBy,
    this.createdAt,
    this.updatedAt,
    this.items = const [],
  });

  int get subtotalInRupees => subtotal ~/ 100;
  int get totalInRupees => total ~/ 100;

  bool get isPending => status == 'pending';
  bool get isPreparing => status == 'preparing';
  bool get isReady => status == 'ready';
  bool get isServed => status == 'served';
  bool get isPaid => status == 'paid';
  bool get isCancelled => status == 'cancelled';
  bool get isActive => !isPaid && !isCancelled;

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String,
        tableId: json['table_id'] as String?,
        customerName: json['customer_name'] as String?,
        customerCount: json['customer_count'] as int? ?? 1,
        status: json['status'] as String? ?? 'pending',
        subtotal: json['subtotal'] as int? ?? 0,
        discountAmount: json['discount_amount'] as int? ?? 0,
        total: json['total'] as int? ?? 0,
        notes: json['notes'] as String?,
        localRef: json['local_ref'] as String?,
        createdBy: json['created_by'] as String?,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'branch_id': branchId,
        'table_id': tableId,
        'customer_name': customerName,
        'customer_count': customerCount,
        'status': status,
        'subtotal': subtotal,
        'discount_amount': discountAmount,
        'total': total,
        'notes': notes,
        'local_ref': localRef,
        'created_by': createdBy,
      };

  Order copyWith({
    String? status,
    int? subtotal,
    int? discountAmount,
    int? total,
    String? notes,
    List<OrderItem>? items,
  }) =>
      Order(
        id: id,
        tenantId: tenantId,
        branchId: branchId,
        tableId: tableId,
        customerName: customerName,
        customerCount: customerCount,
        status: status ?? this.status,
        subtotal: subtotal ?? this.subtotal,
        discountAmount: discountAmount ?? this.discountAmount,
        total: total ?? this.total,
        notes: notes ?? this.notes,
        localRef: localRef,
        createdBy: createdBy,
        createdAt: createdAt,
        updatedAt: updatedAt,
        items: items ?? this.items,
      );
}
