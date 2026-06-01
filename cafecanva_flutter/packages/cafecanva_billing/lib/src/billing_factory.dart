import 'dart:io';
import 'package:flutter/foundation.dart';
import 'payment/payment_gateway.dart';
import 'payment/payment_gateway_web.dart';
import 'printing/print_service.dart';
import 'printing/print_service_pdf.dart';

class BillingFactory {
  static PaymentGateway? _nativeGateway;
  static PrintService? _nativeService;

  static void registerNativeGateway(PaymentGateway gateway) {
    _nativeGateway = gateway;
  }

  static void registerNativeService(PrintService service) {
    _nativeService = service;
  }

  static PaymentGateway createPaymentGateway() {
    if (kIsWeb || Platform.isMacOS || Platform.isWindows || Platform.isLinux) {
      return WebPaymentGateway();
    }
    if (_nativeGateway != null) {
      return _nativeGateway!;
    }
    throw UnimplementedError(
      'CRITICAL: NativePaymentGateway has not been registered in BillingFactory at startup.'
    );
  }

  static PrintService createPrintService({PrintMode mode = PrintMode.pdf}) {
    final canUseBluetooth = !kIsWeb && 
        (Platform.isAndroid || Platform.isIOS) && 
        mode == PrintMode.bluetooth;
    
    if (canUseBluetooth && _nativeService != null) {
      return _nativeService!;
    }
    return PdfPrintService();
  }
}

enum PrintMode { bluetooth, pdf }
