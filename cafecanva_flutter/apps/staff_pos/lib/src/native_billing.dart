import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:bluetooth_print/bluetooth_print_model.dart';
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
        content: '${item.itemName} x${item.quantity}',
        align: LineText.ALIGN_LEFT,
      ));
      list.add(LineText(
        type: LineText.TYPE_TEXT,
        content: 'INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(0)}',
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
