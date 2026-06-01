/// User profile model — staff linked to Supabase auth.users.
class UserProfile {
  final String id;
  final String? tenantId;
  final String? branchId;
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
    this.branchId,
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

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String?,
        branchId: json['branch_id'] as String?,
        name: (json['name'] ?? json['full_name'] ?? '') as String,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        role: json['role'] as String? ?? 'staff',
        pinHash: json['pin_hash'] as String?,
        avatarUrl: json['avatar_url'] as String?,
        active: json['active'] as bool? ?? true,
        fcmToken: json['fcm_token'] as String?,
        permissions: json['permissions'] is Map ? Map<String, dynamic>.from(json['permissions'] as Map) : {},
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenant_id': tenantId,
        'branch_id': branchId,
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'pin_hash': pinHash,
        'avatar_url': avatarUrl,
        'active': active,
        'fcm_token': fcmToken,
        'permissions': permissions,
      };

  UserProfile copyWith({
    String? tenantId,
    String? branchId,
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
        branchId: branchId ?? this.branchId,
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
