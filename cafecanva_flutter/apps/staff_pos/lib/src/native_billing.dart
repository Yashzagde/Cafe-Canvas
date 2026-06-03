import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_billing/cafecanva_billing.dart';

class RazorpayPaymentGateway implements PaymentGateway {
  late Razorpay _razorpay;
  void Function(PaymentSuccessResponse)? _onSuccess;
  void Function(PaymentFailureResponse)? _onFailure;

  void initialize({
    required void Function(PaymentSuccessResponse) onSuccess,
    required void Function(PaymentFailureResponse) onFailure,
  }) {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, onSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, onFailure);
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
    final options = {
      'key': keyId,
      'amount': amountInPaise, // Paise
      'currency': 'INR',
      'order_id': razorpayOrderId,
      'name': storeName,
      'description': 'POS Settle Bill Receipt',
      'prefill': {
        'contact': customerPhone,
        'name': customerName,
      },
      'theme': {
        'color': themeColor,
      }
    };
    _razorpay.open(options);
  }

  void dispose() {
    _razorpay.clear();
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
    // Bluetooth direct prints are triggered when connected to a thermal device.
    // Generates ESC/POS format commands matching millimeter width preference:
    final use80mm = settings.printerWidth == 'mm80';
    final paperSize = use80mm ? PaperSize.mm80 : PaperSize.mm58;
    final capabilityProfile = await CapabilityProfile.load();
    final generator = Generator(paperSize, capabilityProfile);
    
    List<int> bytes = [];
    bytes += generator.reset();
    bytes += generator.text(
      settings.storeName.toUpperCase(),
      styles: const PosStyles(align: PosAlign.center, bold: true, height: PosTextSize.size2),
    );
    bytes += generator.hr();
    
    for (final item in items) {
      bytes += generator.row([
        PosColumn(text: item.itemName, width: 6),
        PosColumn(text: 'x${item.quantity}', width: 2, styles: const PosStyles(align: PosAlign.center)),
        PosColumn(text: 'INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(0)}', width: 4, styles: const PosStyles(align: PosAlign.right)),
      ]);
    }
    
    bytes += generator.hr();
    bytes += generator.row([
      PosColumn(text: 'GRAND TOTAL', width: 6, styles: const PosStyles(bold: true)),
      PosColumn(text: 'INR ${(bill.total / 100).toStringAsFixed(2)}', width: 6, styles: const PosStyles(bold: true, align: PosAlign.right)),
    ]);
    
    bytes += generator.feed(3);
    bytes += generator.cut();

    await bluetoothPrint.writeData(bytes);
  }
}
