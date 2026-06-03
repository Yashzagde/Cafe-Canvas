/// Branding model — visual customization per branch.
class Branding {
  final String id;
  final String tenantId;
  final String branchId;
  final String? logoUrl;
  final String? bannerUrl;
  final String primaryColor;
  final String secondaryColor;
  final String backgroundColor;
  final String fontFamily;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Branding({
    required this.id, required this.tenantId, required this.branchId,
    this.logoUrl, this.bannerUrl,
    this.primaryColor = '#F59E0B', this.secondaryColor = '#C2410C',
    this.backgroundColor = '#FAFAF7', this.fontFamily = 'DM Sans',
    this.createdAt, this.updatedAt,
  });

  factory Branding.fromJson(Map<String, dynamic> json) => Branding(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String, logoUrl: json['logo_url'] as String?,
        bannerUrl: json['banner_url'] as String?,
        primaryColor: json['primary_color'] as String? ?? '#F59E0B',
        secondaryColor: json['secondary_color'] as String? ?? '#C2410C',
        backgroundColor: json['background_color'] as String? ?? '#FAFAF7',
        fontFamily: json['font_family'] as String? ?? 'DM Sans',
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'branch_id': branchId, 'logo_url': logoUrl,
        'banner_url': bannerUrl, 'primary_color': primaryColor,
        'secondary_color': secondaryColor, 'background_color': backgroundColor,
        'font_family': fontFamily,
      };

  Branding copyWith({
    String? logoUrl, String? bannerUrl, String? primaryColor,
    String? secondaryColor, String? backgroundColor, String? fontFamily,
  }) => Branding(
        id: id, tenantId: tenantId, branchId: branchId,
        logoUrl: logoUrl ?? this.logoUrl, bannerUrl: bannerUrl ?? this.bannerUrl,
        primaryColor: primaryColor ?? this.primaryColor,
        secondaryColor: secondaryColor ?? this.secondaryColor,
        backgroundColor: backgroundColor ?? this.backgroundColor,
        fontFamily: fontFamily ?? this.fontFamily,
        createdAt: createdAt, updatedAt: updatedAt,
      );
}
