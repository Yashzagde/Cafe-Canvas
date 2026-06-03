/// Attendance model.
class Attendance {
  final String id;
  final String tenantId;
  final String userId;
  final String? branchId;
  final DateTime date;
  final DateTime? checkInAt;
  final DateTime? checkOutAt;
  final int? durationMinutes;
  final String? notes;

  const Attendance({
    required this.id, required this.tenantId, required this.userId,
    this.branchId, required this.date, this.checkInAt, this.checkOutAt,
    this.durationMinutes, this.notes,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) => Attendance(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        userId: json['user_id'] as String, branchId: json['branch_id'] as String?,
        date: DateTime.parse(json['date'] as String),
        checkInAt: json['check_in_at'] != null ? DateTime.parse(json['check_in_at'] as String) : null,
        checkOutAt: json['check_out_at'] != null ? DateTime.parse(json['check_out_at'] as String) : null,
        durationMinutes: json['duration_minutes'] as int?, notes: json['notes'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'user_id': userId, 'branch_id': branchId, 'notes': notes,
      };
}
