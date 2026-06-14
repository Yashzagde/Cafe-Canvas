/// Store settings model — tax rates and receipt config.
class StoreSettings {
  final String id;
  final String tenantId;
  final String locationId;
  final String? gstin;
  final String? receiptHeader;
  final String receiptFooter;
  final double cgstPercent;
  final double sgstPercent;
  final String serviceChargeType; // 'percent', 'flat', 'none'
  final double serviceChargeValue;
  final String? storeName;
  final String? address;
  final String? printerWidth;
  final String activeGateway;
  final String? phonepeMerchantId;
  final String? phonepeTerminalId;
  final String? googlepayMerchantId;
  final String? googlepayTerminalId;
  final String? paytmMerchantId;
  final String? paytmTerminalId;
  final String? bharatpeMerchantId;
  final String? bharatpeTerminalId;
  final String? razorpayKeyId;
  final DateTime? updatedAt;

  const StoreSettings({
    required this.id,
    required this.tenantId,
    required this.locationId,
    this.gstin,
    this.receiptHeader,
    this.receiptFooter = 'Thank you! Visit again.',
    this.cgstPercent = 2.5,
    this.sgstPercent = 2.5,
    this.serviceChargeType = 'percent',
    this.serviceChargeValue = 5.0,
    this.storeName,
    this.address,
    this.printerWidth,
    this.activeGateway = 'razorpay',
    this.phonepeMerchantId,
    this.phonepeTerminalId,
    this.googlepayMerchantId,
    this.googlepayTerminalId,
    this.paytmMerchantId,
    this.paytmTerminalId,
    this.bharatpeMerchantId,
    this.bharatpeTerminalId,
    this.razorpayKeyId,
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
        id: json['id'] as String,
        tenantId: json['tenant_id'] as String,
        locationId: (json['location_id'] ?? '') as String,
        gstin: json['gstin'] as String?,
        receiptHeader: json['receipt_header'] as String?,
        receiptFooter: json['receipt_footer'] as String? ?? 'Thank you! Visit again.',
        cgstPercent: (double.tryParse(json['tax_cgst']?.toString() ?? '') ?? 250.0) / 100.0,
        sgstPercent: (double.tryParse(json['tax_sgst']?.toString() ?? '') ?? 250.0) / 100.0,
        serviceChargeType: json['service_charge_type'] as String? ?? 'percent',
        serviceChargeValue: json['service_charge_value_paise'] != null
            ? (json['service_charge_value_paise'] as num) / 100.0
            : (double.tryParse(json['service_charge_value']?.toString() ?? '5.0') ?? 5.0),
        storeName: (json['store_name'] ?? json['receipt_header'] ?? '') as String?,
        address: json['address'] as String?,
        printerWidth: json['printer_width'] as String?,
        activeGateway: json['active_gateway'] as String? ?? 'razorpay',
        phonepeMerchantId: json['phonepe_merchant_id'] as String?,
        phonepeTerminalId: json['phonepe_terminal_id'] as String?,
        googlepayMerchantId: json['googlepay_merchant_id'] as String?,
        googlepayTerminalId: json['googlepay_terminal_id'] as String?,
        paytmMerchantId: json['paytm_merchant_id'] as String?,
        paytmTerminalId: json['paytm_terminal_id'] as String?,
        bharatpeMerchantId: json['bharatpe_merchant_id'] as String?,
        bharatpeTerminalId: json['bharatpe_terminal_id'] as String?,
        razorpayKeyId: json['razorpay_key_id'] as String?,
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      );

  Map<String, dynamic> toJson() => {
        'tenant_id': tenantId,
        'location_id': locationId,
        'gstin': gstin,
        'receipt_header': receiptHeader,
        'receipt_footer': receiptFooter,
        'cgst_percent': cgstPercent,
        'sgst_percent': sgstPercent,
        'service_charge_type': serviceChargeType,
        'service_charge_value': serviceChargeValue,
        'store_name': storeName,
        'address': address,
        'printer_width': printerWidth,
        'active_gateway': activeGateway,
        'phonepe_merchant_id': phonepeMerchantId,
        'phonepe_terminal_id': phonepeTerminalId,
        'googlepay_merchant_id': googlepayMerchantId,
        'googlepay_terminal_id': googlepayTerminalId,
        'paytm_merchant_id': paytmMerchantId,
        'paytm_terminal_id': paytmTerminalId,
        'bharatpe_merchant_id': bharatpeMerchantId,
        'bharatpe_terminal_id': bharatpeTerminalId,
        'razorpay_key_id': razorpayKeyId,
      };

  StoreSettings copyWith({
    String? gstin,
    String? receiptHeader,
    String? receiptFooter,
    double? cgstPercent,
    double? sgstPercent,
    String? serviceChargeType,
    double? serviceChargeValue,
    String? storeName,
    String? address,
    String? printerWidth,
    String? activeGateway,
    String? phonepeMerchantId,
    String? phonepeTerminalId,
    String? googlepayMerchantId,
    String? googlepayTerminalId,
    String? paytmMerchantId,
    String? paytmTerminalId,
    String? bharatpeMerchantId,
    String? bharatpeTerminalId,
    String? razorpayKeyId,
  }) =>
      StoreSettings(
        id: id,
        tenantId: tenantId,
        locationId: locationId,
        gstin: gstin ?? this.gstin,
        receiptHeader: receiptHeader ?? this.receiptHeader,
        receiptFooter: receiptFooter ?? this.receiptFooter,
        cgstPercent: cgstPercent ?? this.cgstPercent,
        sgstPercent: sgstPercent ?? this.sgstPercent,
        serviceChargeType: serviceChargeType ?? this.serviceChargeType,
        serviceChargeValue: serviceChargeValue ?? this.serviceChargeValue,
        storeName: storeName ?? this.storeName,
        address: address ?? this.address,
        printerWidth: printerWidth ?? this.printerWidth,
        activeGateway: activeGateway ?? this.activeGateway,
        phonepeMerchantId: phonepeMerchantId ?? this.phonepeMerchantId,
        phonepeTerminalId: phonepeTerminalId ?? this.phonepeTerminalId,
        googlepayMerchantId: googlepayMerchantId ?? this.googlepayMerchantId,
        googlepayTerminalId: googlepayTerminalId ?? this.googlepayTerminalId,
        paytmMerchantId: paytmMerchantId ?? this.paytmMerchantId,
        paytmTerminalId: paytmTerminalId ?? this.paytmTerminalId,
        bharatpeMerchantId: bharatpeMerchantId ?? this.bharatpeMerchantId,
        bharatpeTerminalId: bharatpeTerminalId ?? this.bharatpeTerminalId,
        razorpayKeyId: razorpayKeyId ?? this.razorpayKeyId,
        updatedAt: updatedAt,
      );
}
