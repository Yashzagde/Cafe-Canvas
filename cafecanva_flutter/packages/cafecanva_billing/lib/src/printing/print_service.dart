import 'dart:typed_data';
import 'package:cafecanva_core/cafecanva_core.dart';

abstract class PrintService {
  Future<void> printReceipt({
    required BillModel bill,
    required StoreSettings settings,
    required List<OrderItemModel> items,
  });
}
