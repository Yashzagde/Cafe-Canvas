import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:bluetooth_print/bluetooth_print_model.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_billing/cafecanva_billing.dart';

class PaymentSuccessResponse {
  final String? paymentId;
  final String? orderId;
  final String? signature;
  PaymentSuccessResponse(this.paymentId, this.orderId, this.signature);
}

class PaymentFailureResponse {
  final int? code;
  final String? message;
  PaymentFailureResponse(this.code, this.message);
}

class RazorpayPaymentGateway implements PaymentGateway {
  void initialize({
    required void Function(PaymentSuccessResponse) onSuccess,
    required void Function(PaymentFailureResponse) onFailure,
  }) {
    // No-op - payment gateway disabled
  }

  @override
  Future<void> payWithRazorpay({
    required String razorpayOrderId,
    required String keyId,
    required int amountInPaise,
    required String storeName,
    required String customerName,
    required String customerPhone,
    required String themeColor,
  }) async {
    debugPrint('Online payment gateway checkout has been disabled.');
  }

  void dispose() {
    // No-op
  }

  @override
  Future<void> payWithTerminal({
    required String gateway,
    required String merchantId,
    required String terminalId,
    required int amountInPaise,
  }) async {
    debugPrint('Terminal payment settlements disabled.');
  }
}

class BluetoothPrintService implements PrintService {
  final BluetoothPrint bluetoothPrint = BluetoothPrint.instance;

  @override
  Future<void> printReceipt({
    required BillModel bill,
    required StoreSettings settings,
    required List<OrderItemModel> items,
  }) async {
    final Map<String, dynamic> config = {};
    final List<LineText> list = [];

    list.add(LineText(
      type: LineText.TYPE_TEXT,
      content: (settings.storeName ?? 'Cafe').toUpperCase(),
      weight: 1,
      align: LineText.ALIGN_CENTER,
      linefeed: 1,
    ));

    if (settings.address != null) {
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: settings.address!,
        align: LineText.ALIGN_CENTER,
        linefeed: 1,
      ));
    }

    if (settings.gstin != null) {
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: 'GSTIN: ${settings.gstin}',
        align: LineText.ALIGN_CENTER,
        linefeed: 1,
      ));
    }

    list.add(LineText(
      type: LineText.TYPE_TEXT,
      content: '--------------------------------',
      linefeed: 1,
    ));

    for (final item in items) {
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: item.itemName,
        align: LineText.ALIGN_LEFT,
        linefeed: 1,
      ));
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: '  ${item.quantity} x INR ${(item.unitPrice / 100).toStringAsFixed(2)}',
        align: LineText.ALIGN_LEFT,
      ));
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: 'INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(2)}',
        align: LineText.ALIGN_RIGHT,
        linefeed: 1,
      ));
    }

    list.add(LineText(
      type: LineText.TYPE_TEXT,
      content: '--------------------------------',
      linefeed: 1,
    ));

    list.add(LineText(
      type: LineText.TYPE_TEXT,
      content: 'GRAND TOTAL: INR ${(bill.total / 100).toStringAsFixed(2)}',
      weight: 1,
      align: LineText.ALIGN_RIGHT,
      linefeed: 1,
    ));

    await bluetoothPrint.printReceipt(config, list);
  }
}

class HardwareService {
  static const MethodChannel _channel = MethodChannel('com.cafecanva.pos/hardware');

  /// Checks if any USB device is connected (via Android UsbManager MethodChannel)
  static Future<bool> isUsbConnected() async {
    if (kIsWeb) return false;
    try {
      if (Platform.isAndroid) {
        final bool? isConnected = await _channel.invokeMethod<bool>('isUsbDeviceConnected');
        return isConnected ?? false;
      }
    } catch (e) {
      debugPrint('Error checking USB device connection: $e');
    }
    return false;
  }

  /// Checks if any Bluetooth device is connected (via bluetooth_print plugin)
  static Future<bool> isBluetoothConnected() async {
    try {
      final bool? isConnected = await BluetoothPrint.instance.isConnected;
      return isConnected ?? false;
    } catch (e) {
      debugPrint('Error checking Bluetooth connection: $e');
    }
    return false;
  }

  /// Helper to determine if a terminal is available (either USB or Bluetooth)
  /// In debug/simulator mode or non-mobile platforms, defaults to true so testing is not blocked.
  static Future<bool> isPaymentMachineAvailable() async {
    if (kDebugMode) {
      // Allow simulator/local testing fallback
      return true;
    }
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
      return true;
    }
    final usb = await isUsbConnected();
    final bt = await isBluetoothConnected();
    return usb || bt;
  }
}
