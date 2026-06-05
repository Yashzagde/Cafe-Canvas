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
        userId: (json['staff_id'] ?? json['user_id'] ?? '') as String, branchId: json['branch_id'] as String?,
        date: DateTime.parse(json['date'] as String),
        checkInAt: json['check_in'] != null ? DateTime.parse(json['check_in'] as String) : null,
        checkOutAt: json['check_out'] != null ? DateTime.parse(json['check_out'] as String) : null,
        durationMinutes: json['duration_minutes'] as int?, notes: json['notes'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'staff_id': userId, 'notes': notes,
      };
}
