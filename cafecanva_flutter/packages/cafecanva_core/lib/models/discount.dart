/// Discount model.
class Discount {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final String type; // 'percent' or 'flat'
  final int value; // percent*100 or flat paise
  final int minOrderAmount; // paise
  final String appliesTo; // 'all', 'category', 'item'
  final List<String> targetIds;
  final DateTime? validFrom;
  final DateTime? validUntil;
  final int? usageLimit;
  final int usedCount;
  final int perCustomerLimit;
  final bool isActive;
  final DateTime? deletedAt;

  const Discount({
    required this.id, required this.tenantId, required this.branchId,
    required this.name, required this.type, required this.value,
    this.minOrderAmount = 0, this.appliesTo = 'all', this.targetIds = const [],
    this.validFrom, this.validUntil, this.usageLimit, this.usedCount = 0,
    this.perCustomerLimit = 1, this.isActive = true, this.deletedAt,
  });

  factory Discount.fromJson(Map<String, dynamic> json) => Discount(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String, name: json['name'] as String,
        type: json['type'] as String, value: json['value'] as int,
        minOrderAmount: json['min_order_amount'] as int? ?? 0,
        appliesTo: json['applies_to'] as String? ?? 'all',
        targetIds: json['target_ids'] != null ? List<String>.from(json['target_ids'] as List) : [],
        validFrom: json['valid_from'] != null ? DateTime.parse(json['valid_from'] as String) : null,
        validUntil: json['valid_until'] != null ? DateTime.parse(json['valid_until'] as String) : null,
        usageLimit: json['usage_limit'] as int?,
        usedCount: json['used_count'] as int? ?? 0,
        perCustomerLimit: json['per_customer_limit'] as int? ?? 1,
        isActive: json['is_active'] as bool? ?? true,
        deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'branch_id': branchId, 'name': name,
        'type': type, 'value': value, 'min_order_amount': minOrderAmount,
        'applies_to': appliesTo, 'target_ids': targetIds,
        'valid_from': validFrom?.toIso8601String(), 'valid_until': validUntil?.toIso8601String(),
        'usage_limit': usageLimit, 'per_customer_limit': perCustomerLimit, 'is_active': isActive,
      };
}
