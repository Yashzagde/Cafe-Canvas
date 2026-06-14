/// Table model — physical floor tables.
class CafeTable {
  final String id;
  final String tenantId;
  final String locationId;
  final String name;
  final int capacity;
  final String section;
  final String shape; // 'square', 'round', 'long'
  final String status; // 'available', 'occupied', 'reserved', 'cleaning'
  final int positionX;
  final int positionY;
  final DateTime? deletedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CafeTable({
    required this.id,
    required this.tenantId,
    required this.locationId,
    required this.name,
    this.capacity = 4,
    this.section = 'indoor',
    this.shape = 'square',
    this.status = 'available',
    this.positionX = 0,
    this.positionY = 0,
    this.deletedAt,
    this.createdAt,
    this.updatedAt,
  });

  bool get isAvailable => status == 'available';
  bool get isOccupied => status == 'occupied';
  bool get isReserved => status == 'reserved';
  bool get isCleaning => status == 'cleaning';

  factory CafeTable.fromJson(Map<String, dynamic> json) {
    // Handle position field which might be stored as JSON object or separate x/y
    int px = 0, py = 0;
    if (json['position'] is Map) {
      px = (json['position']['x'] as num?)?.toInt() ?? 0;
      py = (json['position']['y'] as num?)?.toInt() ?? 0;
    } else {
      px = json['position_x'] as int? ?? 0;
      py = json['position_y'] as int? ?? 0;
    }

    return CafeTable(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      locationId: (json['location_id'] ?? '') as String,
      name: (json['name'] ?? '') as String,
      capacity: json['capacity'] as int? ?? 4,
      section: json['section'] as String? ?? 'indoor',
      shape: json['shape'] as String? ?? 'square',
      status: json['status'] as String? ?? 'available',
      positionX: px,
      positionY: py,
      deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'location_id': locationId,
        'name': name,
        'capacity': capacity,
        'section': section,
        'shape': shape,
        'status': status,
        'position_x': positionX,
        'position_y': positionY,
      };

  CafeTable copyWith({
    String? name,
    int? capacity,
    String? section,
    String? shape,
    String? status,
    int? positionX,
    int? positionY,
  }) =>
      CafeTable(
        id: id,
        tenantId: tenantId,
        locationId: locationId,
        name: name ?? this.name,
        capacity: capacity ?? this.capacity,
        section: section ?? this.section,
        shape: shape ?? this.shape,
        status: status ?? this.status,
        positionX: positionX ?? this.positionX,
        positionY: positionY ?? this.positionY,
        deletedAt: deletedAt,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}

typedef TableModel = CafeTable;
