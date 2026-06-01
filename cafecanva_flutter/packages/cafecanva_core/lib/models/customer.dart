/// Customer model for CRM.
class Customer {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final String? phone;
  final String? notes;
  final int visitCount;
  final int totalSpend; // paise
  final DateTime? deletedAt;
  final DateTime? createdAt;

  const Customer({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.name,
    this.phone,
    this.notes,
    this.visitCount = 1,
    this.totalSpend = 0,
    this.deletedAt,
    this.createdAt,
  });

  int get totalSpendInRupees => totalSpend ~/ 100;

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String,
        name: json['name'] as String,
        phone: json['phone'] as String?,
        notes: json['notes'] as String?,
        visitCount: json['visit_count'] as int? ?? 1,
        totalSpend: json['total_spend'] as int? ?? 0,
        deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'branch_id': branchId,
        'name': name,
        'phone': phone,
        'notes': notes,
        'visit_count': visitCount,
        'total_spend': totalSpend,
      };

  Customer copyWith({String? name, String? phone, String? notes, int? visitCount, int? totalSpend}) => Customer(
        id: id, tenantId: tenantId, branchId: branchId,
        name: name ?? this.name, phone: phone ?? this.phone, notes: notes ?? this.notes,
        visitCount: visitCount ?? this.visitCount, totalSpend: totalSpend ?? this.totalSpend,
        deletedAt: deletedAt, createdAt: createdAt,
      );
}
