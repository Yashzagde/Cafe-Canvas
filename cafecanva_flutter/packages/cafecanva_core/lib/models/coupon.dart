/// Coupon model.
class Coupon {
  final String id;
  final String tenantId;
  final String discountId;
  final String code;
  final int? maxUses;
  final int usedCount;
  final int perUserLimit;
  final DateTime? validUntil;
  final bool isActive;

  const Coupon({
    required this.id, required this.tenantId, required this.discountId,
    required this.code, this.maxUses, this.usedCount = 0,
    this.perUserLimit = 1, this.validUntil, this.isActive = true,
  });

  bool get isExpired => validUntil != null && validUntil!.isBefore(DateTime.now());
  bool get isUsedUp => maxUses != null && usedCount >= maxUses!;

  factory Coupon.fromJson(Map<String, dynamic> json) => Coupon(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        discountId: json['discount_id'] as String, code: json['code'] as String,
        maxUses: json['max_uses'] as int?, usedCount: json['used_count'] as int? ?? 0,
        perUserLimit: json['per_user_limit'] as int? ?? 1,
        validUntil: json['valid_until'] != null ? DateTime.parse(json['valid_until'] as String) : null,
        isActive: json['is_active'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'discount_id': discountId, 'code': code,
        'max_uses': maxUses, 'per_user_limit': perUserLimit,
        'valid_until': validUntil?.toIso8601String(), 'is_active': isActive,
      };
}
