/// Modifier group model (e.g. "Milk Type", "Size").
class ModifierGroup {
  final String id;
  final String itemId;
  final String name;
  final bool required;
  final int minSelect;
  final int maxSelect;
  final DateTime? updatedAt;
  final List<ModifierOption> options;

  const ModifierGroup({
    required this.id,
    required this.itemId,
    required this.name,
    this.required = false,
    this.minSelect = 0,
    this.maxSelect = 1,
    this.updatedAt,
    this.options = const [],
  });

  factory ModifierGroup.fromJson(Map<String, dynamic> json) => ModifierGroup(
        id: json['id'] as String,
        itemId: json['item_id'] as String,
        name: json['name'] as String,
        required: json['required'] as bool? ?? false,
        minSelect: json['min_select'] as int? ?? 0,
        maxSelect: json['max_select'] as int? ?? 1,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'item_id': itemId,
        'name': name,
        'required': required,
        'min_select': minSelect,
        'max_select': maxSelect,
      };

  ModifierGroup copyWith({
    String? name,
    bool? required,
    int? minSelect,
    int? maxSelect,
    List<ModifierOption>? options,
  }) =>
      ModifierGroup(
        id: id,
        itemId: itemId,
        name: name ?? this.name,
        required: required ?? this.required,
        minSelect: minSelect ?? this.minSelect,
        maxSelect: maxSelect ?? this.maxSelect,
        updatedAt: updatedAt,
        options: options ?? this.options,
      );
}

/// Modifier option model. Extra price in paise.
class ModifierOption {
  final String id;
  final String groupId;
  final String name;
  final int extraPrice; // in PAISE
  final bool isDefault;

  const ModifierOption({
    required this.id,
    required this.groupId,
    required this.name,
    this.extraPrice = 0,
    this.isDefault = false,
  });

  /// Extra price in rupees.
  int get extraPriceInRupees => extraPrice ~/ 100;

  factory ModifierOption.fromJson(Map<String, dynamic> json) => ModifierOption(
        id: json['id'] as String,
        groupId: json['group_id'] as String,
        name: json['name'] as String,
        extraPrice: json['extra_price'] as int? ?? 0,
        isDefault: json['is_default'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'group_id': groupId,
        'name': name,
        'extra_price': extraPrice,
        'is_default': isDefault,
      };
}
