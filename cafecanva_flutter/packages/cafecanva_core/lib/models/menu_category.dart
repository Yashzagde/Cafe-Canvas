/// Menu category model.
class MenuCategory {
  final String id;
  final String tenantId;
  final String branchId;
  final String name;
  final String? icon;
  final int sortOrder;
  final bool isVisible;
  final DateTime? deletedAt;
  final DateTime? createdAt;

  const MenuCategory({
    required this.id,
    required this.tenantId,
    required this.branchId,
    required this.name,
    this.icon,
    this.sortOrder = 0,
    this.isVisible = true,
    this.deletedAt,
    this.createdAt,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) => MenuCategory(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String,
        name: json['name'] as String,
        icon: json['icon'] as String?,
        sortOrder: json['sort_order'] as int? ?? 0,
        isVisible: json['is_visible'] as bool? ?? true,
        deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'branch_id': branchId,
        'name': name,
        'icon': icon,
        'sort_order': sortOrder,
        'is_visible': isVisible,
      };

  MenuCategory copyWith({String? name, String? icon, int? sortOrder, bool? isVisible}) => MenuCategory(
        id: id,
        tenantId: tenantId,
        branchId: branchId,
        name: name ?? this.name,
        icon: icon ?? this.icon,
        sortOrder: sortOrder ?? this.sortOrder,
        isVisible: isVisible ?? this.isVisible,
        deletedAt: deletedAt,
        createdAt: createdAt,
      );
}
