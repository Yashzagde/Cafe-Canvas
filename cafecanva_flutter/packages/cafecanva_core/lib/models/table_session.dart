/// Table session model — one per dining experience.
class TableSession {
  final String id;
  final String tenantId;
  final String tableId;
  final DateTime checkInAt;
  final DateTime? checkOutAt;
  final int? durationMinutes;
  final int? totalRevenue; // paise
  final String? billId;
  final DateTime? updatedAt;

  const TableSession({
    required this.id,
    required this.tenantId,
    required this.tableId,
    required this.checkInAt,
    this.checkOutAt,
    this.durationMinutes,
    this.totalRevenue,
    this.billId,
    this.updatedAt,
  });

  bool get isActive => checkOutAt == null;

  factory TableSession.fromJson(Map<String, dynamic> json) => TableSession(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        tableId: json['table_id'] as String,
        checkInAt: DateTime.parse(json['check_in_at'] as String),
        checkOutAt: json['check_out_at'] != null ? DateTime.parse(json['check_out_at'] as String) : null,
        durationMinutes: json['duration_minutes'] as int?,
        totalRevenue: json['total_revenue'] as int?,
        billId: json['bill_id'] as String?,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'table_id': tableId,
      };
}
