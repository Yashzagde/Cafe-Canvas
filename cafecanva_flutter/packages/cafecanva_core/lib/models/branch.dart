/// Branch model — multiple locations per tenant.
class Branch {
  final String id;
  final String tenantId;
  final String name;
  final String? address;
  final String? phone;
  final String? managerId;
  final bool active;
  final DateTime? createdAt;

  const Branch({
    required this.id,
    required this.tenantId,
    required this.name,
    this.address,
    this.phone,
    this.managerId,
    this.active = true,
    this.createdAt,
  });

  factory Branch.fromJson(Map<String, dynamic> json) => Branch(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        name: json['name'] as String,
        address: json['address'] as String?,
        phone: json['phone'] as String?,
        managerId: json['manager_id'] as String?,
        active: json['active'] as bool? ?? true,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenant_id': tenantId,
        'name': name,
        'address': address,
        'phone': phone,
        'manager_id': managerId,
        'active': active,
      };

  Branch copyWith({
    String? name,
    String? address,
    String? phone,
    String? managerId,
    bool? active,
  }) =>
      Branch(
        id: id,
        tenantId: tenantId,
        name: name ?? this.name,
        address: address ?? this.address,
        phone: phone ?? this.phone,
        managerId: managerId ?? this.managerId,
        active: active ?? this.active,
        createdAt: createdAt,
      );
}
