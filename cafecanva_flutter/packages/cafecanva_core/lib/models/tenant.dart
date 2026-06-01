/// Tenant model — one per cafe business.
class Tenant {
  final String id;
  final String name;
  final String subdomain;
  final String plan;
  final String? logoUrl;
  final String timezone;
  final String currency;
  final String? address;
  final String? phone;
  final String? gstin;
  final bool active;
  final DateTime? createdAt;

  const Tenant({
    required this.id,
    required this.name,
    required this.subdomain,
    this.plan = 'free',
    this.logoUrl,
    this.timezone = 'Asia/Kolkata',
    this.currency = 'INR',
    this.address,
    this.phone,
    this.gstin,
    this.active = true,
    this.createdAt,
  });

  factory Tenant.fromJson(Map<String, dynamic> json) => Tenant(
        id: json['id'] as String,
        name: json['name'] as String,
        subdomain: json['subdomain'] as String,
        plan: json['plan'] as String? ?? 'free',
        logoUrl: json['logo_url'] as String?,
        timezone: json['timezone'] as String? ?? 'Asia/Kolkata',
        currency: json['currency'] as String? ?? 'INR',
        address: json['address'] as String?,
        phone: json['phone'] as String?,
        gstin: json['gstin'] as String?,
        active: json['active'] as bool? ?? true,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'subdomain': subdomain,
        'plan': plan,
        'logo_url': logoUrl,
        'timezone': timezone,
        'currency': currency,
        'address': address,
        'phone': phone,
        'gstin': gstin,
        'active': active,
      };

  Tenant copyWith({
    String? id,
    String? name,
    String? subdomain,
    String? plan,
    String? logoUrl,
    String? timezone,
    String? currency,
    String? address,
    String? phone,
    String? gstin,
    bool? active,
  }) =>
      Tenant(
        id: id ?? this.id,
        name: name ?? this.name,
        subdomain: subdomain ?? this.subdomain,
        plan: plan ?? this.plan,
        logoUrl: logoUrl ?? this.logoUrl,
        timezone: timezone ?? this.timezone,
        currency: currency ?? this.currency,
        address: address ?? this.address,
        phone: phone ?? this.phone,
        gstin: gstin ?? this.gstin,
        active: active ?? this.active,
        createdAt: createdAt,
      );
}
