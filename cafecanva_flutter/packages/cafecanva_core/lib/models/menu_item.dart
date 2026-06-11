/// Menu item model. Price stored in paise (integer).
class MenuItem {
  final String id;
  final String tenantId;
  final String branchId;
  final String categoryId;
  final String name;
  final String? description;
  final int price; // in PAISE
  final String? imageUrl;
  final String status; // 'available', 'unavailable', 'hidden'
  final bool allowsModifiers;
  final bool discountEligible;
  final bool featured;
  final List<String> tags;
  final int prepTimeMin;
  final int sortOrder;
  final DateTime? deletedAt;
  final String? createdBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const MenuItem({
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
    this.featured = false,
    this.tags = const [],
    this.prepTimeMin = 10,
    this.sortOrder = 0,
    this.deletedAt,
    this.createdBy,
    this.createdAt,
    this.updatedAt,
  });

  /// Price in rupees for display.
  int get priceInRupees => price ~/ 100;

  bool get isAvailable => status == 'available';

  factory MenuItem.fromJson(Map<String, dynamic> json) => MenuItem(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        branchId: (json['branch_id'] ?? json['location_id'] ?? '') as String,
        categoryId: json['category_id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        price: json['price'] as int,
        imageUrl: json['image_url'] as String?,
        status: json['status'] as String? ?? 'available',
        allowsModifiers: json['allows_modifiers'] as bool? ?? false,
        discountEligible: json['discount_eligible'] as bool? ?? true,
        featured: json['featured'] as bool? ?? false,
        tags: json['tags'] != null ? List<String>.from(json['tags'] as List) : [],
        prepTimeMin: json['prep_time_min'] as int? ?? 10,
        sortOrder: json['sort_order'] as int? ?? 0,
        deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
        createdBy: json['created_by'] as String?,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'branch_id': branchId,
        'category_id': categoryId,
        'name': name,
        'description': description,
        'price': price,
        'image_url': imageUrl,
        'status': status,
        'allows_modifiers': allowsModifiers,
        'discount_eligible': discountEligible,
        'featured': featured,
        'tags': tags,
        'prep_time_min': prepTimeMin,
        'sort_order': sortOrder,
        'created_by': createdBy,
      };

  MenuItem copyWith({
    String? categoryId,
    String? name,
    String? description,
    int? price,
    String? imageUrl,
    String? status,
    bool? allowsModifiers,
    bool? discountEligible,
    bool? featured,
    List<String>? tags,
    int? prepTimeMin,
    int? sortOrder,
  }) =>
      MenuItem(
        id: id,
        tenantId: tenantId,
        branchId: branchId,
        categoryId: categoryId ?? this.categoryId,
        name: name ?? this.name,
        description: description ?? this.description,
        price: price ?? this.price,
        imageUrl: imageUrl ?? this.imageUrl,
        status: status ?? this.status,
        allowsModifiers: allowsModifiers ?? this.allowsModifiers,
        discountEligible: discountEligible ?? this.discountEligible,
        featured: featured ?? this.featured,
        tags: tags ?? this.tags,
        prepTimeMin: prepTimeMin ?? this.prepTimeMin,
        sortOrder: sortOrder ?? this.sortOrder,
        deletedAt: deletedAt,
        createdBy: createdBy,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}
