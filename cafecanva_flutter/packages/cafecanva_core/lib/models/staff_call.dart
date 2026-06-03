/// Staff call model — customer calls waiter.
class StaffCall {
  final String id;
  final String tenantId;
  final String tableId;
  final String? sessionId;
  final DateTime calledAt;
  final DateTime? attendedAt;
  final String? attendedBy;
  final String status; // 'pending', 'attended', 'ignored'

  const StaffCall({
    required this.id, required this.tenantId, required this.tableId,
    this.sessionId, required this.calledAt, this.attendedAt,
    this.attendedBy, this.status = 'pending',
  });

  bool get isPending => status == 'pending';

  factory StaffCall.fromJson(Map<String, dynamic> json) => StaffCall(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        tableId: json['table_id'] as String, sessionId: json['session_id'] as String?,
        calledAt: DateTime.parse(json['called_at'] as String),
        attendedAt: json['attended_at'] != null ? DateTime.parse(json['attended_at'] as String) : null,
        attendedBy: json['attended_by'] as String?, status: json['status'] as String? ?? 'pending',
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'table_id': tableId, 'session_id': sessionId, 'status': status,
      };
}
