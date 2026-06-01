/// Notification log entry model.
class NotificationLogEntry {
  final String id;
  final String tenantId;
  final String userId;
  final String type;
  final String title;
  final String body;
  final DateTime? readAt;
  final DateTime sentAt;

  const NotificationLogEntry({
    required this.id, required this.tenantId, required this.userId,
    required this.type, required this.title, required this.body,
    this.readAt, required this.sentAt,
  });

  bool get isRead => readAt != null;

  factory NotificationLogEntry.fromJson(Map<String, dynamic> json) => NotificationLogEntry(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        userId: json['user_id'] as String, type: json['type'] as String,
        title: json['title'] as String, body: json['body'] as String,
        readAt: json['read_at'] != null ? DateTime.parse(json['read_at'] as String) : null,
        sentAt: DateTime.parse(json['sent_at'] as String),
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'user_id': userId, 'type': type, 'title': title, 'body': body,
      };
}
