/// Storefront config model — storefront display settings.
class StorefrontConfig {
  final String id;
  final String tenantId;
  final String? themeId;
  final String? primaryColor;
  final String? accentColor;
  final String? fontHeading;
  final String? fontBody;
  final String? bannerText;
  final bool showPrices;
  final bool allowOrders;
  final bool showBlog;
  final String? heroImageUrl;
  final DateTime? updatedAt;

  const StorefrontConfig({
    required this.id, required this.tenantId, this.themeId = 'theme-01',
    this.primaryColor, this.accentColor, this.fontHeading, this.fontBody,
    this.bannerText, this.showPrices = true, this.allowOrders = true,
    this.showBlog = true, this.heroImageUrl, this.updatedAt,
  });

  factory StorefrontConfig.fromJson(Map<String, dynamic> json) => StorefrontConfig(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        themeId: json['theme_id'] as String?, primaryColor: json['primary_color'] as String?,
        accentColor: json['accent_color'] as String?, fontHeading: json['font_heading'] as String?,
        fontBody: json['font_body'] as String?, bannerText: json['banner_text'] as String?,
        showPrices: json['show_prices'] as bool? ?? true,
        allowOrders: json['allow_orders'] as bool? ?? true,
        showBlog: json['show_blog'] as bool? ?? true,
        heroImageUrl: json['hero_image_url'] as String?,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'theme_id': themeId, 'primary_color': primaryColor,
        'accent_color': accentColor, 'font_heading': fontHeading, 'font_body': fontBody,
        'banner_text': bannerText, 'show_prices': showPrices, 'allow_orders': allowOrders,
        'show_blog': showBlog, 'hero_image_url': heroImageUrl,
      };
}
