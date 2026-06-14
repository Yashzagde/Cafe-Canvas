/// User profile model — staff linked to Supabase auth.users.
class UserProfile {
  final String id;
  final String? tenantId;
  final String? locationId;
  final String name;
  final String? email;
  final String? phone;
  final String role;
  final String? pinHash;
  final String? avatarUrl;
  final bool active;
  final String? fcmToken;
  final Map<String, dynamic> permissions;
  final DateTime? createdAt;

  const UserProfile({
    required this.id,
    this.tenantId,
    this.locationId,
    required this.name,
    this.email,
    this.phone,
    this.role = 'staff',
    this.pinHash,
    this.avatarUrl,
    this.active = true,
    this.fcmToken,
    this.permissions = const {},
    this.createdAt,
  });

  bool get isOwner => role == 'owner';
  bool get isManager => role == 'manager';
  bool get isCashier => role == 'cashier';
  bool get isStaff => role == 'staff';
  bool get isKitchen => role == 'kitchen';
  bool get canManage => role == 'owner' || role == 'manager';
  bool get canTakeOrders => role == 'owner' || role == 'manager' || role == 'cashier' || role == 'staff';

  String get fullName => name;
  String get status => active ? 'ACTIVE' : 'INACTIVE';

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String?,
        locationId: json['location_id'] as String?,
        name: (json['full_name'] ?? json['name'] ?? '') as String,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        role: json['role'] as String? ?? 'staff',
        pinHash: json['pin'] as String?,
        avatarUrl: json['avatar_url'] as String?,
        active: json['is_active'] as bool? ?? true,
        fcmToken: json['fcm_token'] as String?,
        permissions: json['permissions'] is Map ? Map<String, dynamic>.from(json['permissions'] as Map) : {},
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenant_id': tenantId,
        'location_id': locationId,
        'full_name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'pin': pinHash,
        'avatar_url': avatarUrl,
        'is_active': active,
        'fcm_token': fcmToken,
        'permissions': permissions,
      };

  UserProfile copyWith({
    String? tenantId,
    String? locationId,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? pinHash,
    String? avatarUrl,
    bool? active,
    String? fcmToken,
    Map<String, dynamic>? permissions,
  }) =>
      UserProfile(
        id: id,
        tenantId: tenantId ?? this.tenantId,
        locationId: locationId ?? this.locationId,
        name: name ?? this.name,
        email: email ?? this.email,
        phone: phone ?? this.phone,
        role: role ?? this.role,
        pinHash: pinHash ?? this.pinHash,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        active: active ?? this.active,
        fcmToken: fcmToken ?? this.fcmToken,
        permissions: permissions ?? this.permissions,
        createdAt: createdAt,
      );
}
