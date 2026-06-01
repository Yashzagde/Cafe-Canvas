/// Bill model — consolidated invoice. All amounts in paise.
class Bill {
  final String id;
  final String tenantId;
  final String branchId;
  final String? tableId;
  final List<String> orderIds;
  final int subtotal; // paise
  final int tax; // paise
  final int discountAmount; // paise
  final List<Map<String, dynamic>> extraCharges;
  final int total; // paise
  final String status; // 'open', 'paid', 'voided'
  final String? paymentMethod;
  final DateTime? paidAt;
  final String? createdBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Bill({
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
    this.createdAt,
    this.updatedAt,
  });

  bool get isOpen => status == 'open';
  bool get isPaid => status == 'paid';
  int get subtotalInRupees => subtotal ~/ 100;
  int get totalInRupees => total ~/ 100;
  int get taxInRupees => tax ~/ 100;

  factory Bill.fromJson(Map<String, dynamic> json) => Bill(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String,
        tableId: json['table_id'] as String?,
        orderIds: json['order_ids'] != null ? List<String>.from(json['order_ids'] as List) : [],
        subtotal: json['subtotal'] as int,
        tax: json['tax'] as int? ?? 0,
        discountAmount: json['discount_amount'] as int? ?? 0,
        extraCharges: json['extra_charges'] != null ? List<Map<String, dynamic>>.from((json['extra_charges'] as List).map((e) => Map<String, dynamic>.from(e as Map))) : [],
        total: json['total'] as int,
        status: json['status'] as String? ?? 'open',
        paymentMethod: json['payment_method'] as String?,
        paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at'] as String) : null,
        createdBy: json['created_by'] as String?,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'branch_id': branchId,
        'table_id': tableId,
        'order_ids': orderIds,
        'subtotal': subtotal,
        'tax': tax,
        'discount_amount': discountAmount,
        'extra_charges': extraCharges,
        'total': total,
        'status': status,
        'payment_method': paymentMethod,
        'created_by': createdBy,
      };
}
