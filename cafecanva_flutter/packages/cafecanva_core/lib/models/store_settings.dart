/// Store settings model — tax rates and receipt config.
class StoreSettings {
  final String id;
  final String tenantId;
  final String branchId;
  final String? gstin;
  final String? receiptHeader;
  final String receiptFooter;
  final double cgstPercent;
  final double sgstPercent;
  final String serviceChargeType; // 'percent', 'flat', 'none'
  final double serviceChargeValue;
  final DateTime? updatedAt;

  const StoreSettings({
    required this.id, required this.tenantId, required this.branchId,
    this.gstin, this.receiptHeader, this.receiptFooter = 'Thank you! Visit again.',
    this.cgstPercent = 2.5, this.sgstPercent = 2.5,
    this.serviceChargeType = 'percent', this.serviceChargeValue = 5.0,
    this.updatedAt,
  });

  double get totalTaxPercent => cgstPercent + sgstPercent;

  /// Calculate CGST in paise from subtotal in paise.
  int calcCgst(int subtotalPaise) => (subtotalPaise * cgstPercent / 100).round();
  int calcSgst(int subtotalPaise) => (subtotalPaise * sgstPercent / 100).round();
  int calcTax(int subtotalPaise) => calcCgst(subtotalPaise) + calcSgst(subtotalPaise);

  int calcServiceCharge(int subtotalPaise) {
    if (serviceChargeType == 'none') return 0;
    if (serviceChargeType == 'flat') return (serviceChargeValue * 100).round();
    return (subtotalPaise * serviceChargeValue / 100).round();
  }

  factory StoreSettings.fromJson(Map<String, dynamic> json) => StoreSettings(
        id: json['id'] as String, tenantId: json['tenant_id'] as String,
        branchId: json['branch_id'] as String, gstin: json['gstin'] as String?,
        receiptHeader: json['receipt_header'] as String?,
        receiptFooter: json['receipt_footer'] as String? ?? 'Thank you! Visit again.',
        cgstPercent: double.tryParse(json['cgst_percent']?.toString() ?? '2.5') ?? 2.5,
        sgstPercent: double.tryParse(json['sgst_percent']?.toString() ?? '2.5') ?? 2.5,
        serviceChargeType: json['service_charge_type'] as String? ?? 'percent',
        serviceChargeValue: double.tryParse(json['service_charge_value']?.toString() ?? '5.0') ?? 5.0,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId, 'branch_id': branchId, 'gstin': gstin,
        'receipt_header': receiptHeader, 'receipt_footer': receiptFooter,
        'cgst_percent': cgstPercent, 'sgst_percent': sgstPercent,
        'service_charge_type': serviceChargeType, 'service_charge_value': serviceChargeValue,
      };

  StoreSettings copyWith({
    String? gstin, String? receiptHeader, String? receiptFooter,
    double? cgstPercent, double? sgstPercent,
    String? serviceChargeType, double? serviceChargeValue,
  }) => StoreSettings(
        id: id, tenantId: tenantId, branchId: branchId,
        gstin: gstin ?? this.gstin, receiptHeader: receiptHeader ?? this.receiptHeader,
        receiptFooter: receiptFooter ?? this.receiptFooter,
        cgstPercent: cgstPercent ?? this.cgstPercent, sgstPercent: sgstPercent ?? this.sgstPercent,
        serviceChargeType: serviceChargeType ?? this.serviceChargeType,
        serviceChargeValue: serviceChargeValue ?? this.serviceChargeValue,
        updatedAt: updatedAt,
      );
}
