import 'dart:typed_data';
import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:cafecanva_core/cafecanva_core.dart';

class PrintingService {
  static final PrintingService instance = PrintingService._internal();
  PrintingService._internal();

  final BluetoothPrint bluetoothPrint = BluetoothPrint.instance;

  /// Generates the raw ESC/POS command bytes for 80mm thermal printers
  Future<List<int>> buildReceiptBytes({
    required BillModel bill,
    required StoreSettings settings,
    required List<OrderItemModel> items,
    bool use80mm = true,
  }) async {
    final PaperSize paperSize = use80mm ? PaperSize.mm80 : PaperSize.mm58;
    final capabilityProfile = await CapabilityProfile.load();
    final generator = Generator(paperSize, capabilityProfile);
    List<int> bytes = [];

    bytes += generator.reset();
    
    // Header
    bytes += generator.text(
      settings.storeName.toUpperCase(),
      styles: const PosStyles(
        align: PosAlign.center,
        bold: true,
        height: PosTextSize.size2,
        width: PosTextSize.size2,
      ),
    );
    
    if (settings.address != null) {
      bytes += generator.text(settings.address!, styles: const PosStyles(align: PosAlign.center));
    }
    if (settings.phone != null) {
      bytes += generator.text('Tel: ${settings.phone!}', styles: const PosStyles(align: PosAlign.center));
    }
    if (settings.gstin != null) {
      bytes += generator.text('GSTIN: ${settings.gstin!}', styles: const PosStyles(align: PosAlign.center, bold: true));
    }
    
    bytes += generator.hr();
    bytes += generator.text('Bill ID: ${bill.id.substring(0, 8)}...', styles: const PosStyles(bold: true));
    bytes += generator.text('Date: ${bill.createdAt.toLocal().toString().split('.')[0]}');
    bytes += generator.hr();

    // Table Header
    bytes += generator.row([
      PosColumn(text: 'ITEM', width: 6, styles: const PosStyles(bold: true)),
      PosColumn(text: 'QTY', width: 2, styles: const PosStyles(bold: true, align: PosAlign.center)),
      PosColumn(text: 'AMOUNT', width: 4, styles: const PosStyles(bold: true, align: PosAlign.right)),
    ]);
    
    bytes += generator.hr();

    // Line Items
    for (final item in items) {
      bytes += generator.row([
        PosColumn(text: item.itemName, width: 6),
        PosColumn(text: 'x${item.quantity}', width: 2, styles: const PosStyles(align: PosAlign.center)),
        PosColumn(text: 'INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(0)}', width: 4, styles: const PosStyles(align: PosAlign.right)),
      ]);
    }

    bytes += generator.hr(ch: '=');

    // Aggregates
    bytes += generator.row([
      PosColumn(text: 'Subtotal', width: 6),
      PosColumn(text: 'INR ${(bill.subtotal / 100).toStringAsFixed(2)}', width: 6, styles: const PosStyles(align: PosAlign.right)),
    ]);
    if (bill.tax > 0) {
      bytes += generator.row([
        PosColumn(text: 'GST (5%)', width: 6),
        PosColumn(text: 'INR ${(bill.tax / 100).toStringAsFixed(2)}', width: 6, styles: const PosStyles(align: PosAlign.right)),
      ]);
    }
    if (bill.discountAmount > 0) {
      bytes += generator.row([
        PosColumn(text: 'Discount', width: 6),
        PosColumn(text: '- INR ${(bill.discountAmount / 100).toStringAsFixed(2)}', width: 6, styles: const PosStyles(align: PosAlign.right)),
      ]);
    }

    bytes += generator.hr(ch: '=');

    // Grand Total
    bytes += generator.row([
      PosColumn(
        text: 'GRAND TOTAL',
        width: 6,
        styles: const PosStyles(bold: true, height: PosTextSize.size2),
      ),
      PosColumn(
        text: 'INR ${(bill.total / 100).toStringAsFixed(0)}',
        width: 6,
        styles: const PosStyles(bold: true, align: PosAlign.right, height: PosTextSize.size2),
      ),
    ]);

    bytes += generator.feed(2);
    
    // Footer
    bytes += generator.text('THANK YOU! VISIT AGAIN.', styles: const PosStyles(align: PosAlign.center, bold: true));
    bytes += generator.feed(3);
    bytes += generator.cut();

    return bytes;
  }

  /// Connects and prints raw bytes to a thermal Bluetooth printer
  Future<bool> printReceiptViaBluetooth({
    required BluetoothDevice device,
    required List<int> bytes,
  }) async {
    try {
      await bluetoothPrint.connect(device);
      // Wait for connection stabilization
      await Future.delayed(const Duration(seconds: 1));
      
      // Write raw bytes directly to Bluetooth device
      await bluetoothPrint.writeData(bytes);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Generates a PDF invoice for sharing or paper print dialogues
  Future<Uint8List> generatePdfReceipt({
    required BillModel bill,
    required StoreSettings settings,
    required List<OrderItemModel> items,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.roll80,
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(8.0),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Center(
                  child: pw.Text(
                    settings.storeName.toUpperCase(),
                    style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 16.0),
                  ),
                ),
                if (settings.address != null)
                  pw.Center(child: pw.Text(settings.address!, style: const pw.TextStyle(fontSize: 9.0))),
                if (settings.gstin != null)
                  pw.Center(child: pw.Text('GSTIN: ${settings.gstin!}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0))),
                pw.Divider(),
                pw.Text('Bill ID: ${bill.id.substring(0, 8)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0)),
                pw.Text('Date: ${bill.createdAt.toLocal().toString().split('.')[0]}', style: const pw.TextStyle(fontSize: 9.0)),
                pw.Divider(),
                
                // Items Table
                pw.Table(
                  columnWidths: {
                    0: const pw.FlexColumnWidth(6),
                    1: const pw.FlexColumnWidth(2),
                    2: const pw.FlexColumnWidth(4),
                  },
                  children: [
                    pw.TableRow(
                      children: [
                        pw.Text('ITEM', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0)),
                        pw.Center(child: pw.Text('QTY', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0))),
                        pw.Align(alignment: pw.Alignment.centerRight, child: pw.Text('PRICE', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0))),
                      ],
                    ),
                    ...items.map(
                      (item) => pw.TableRow(
                        children: [
                          pw.Text(item.itemName, style: const pw.TextStyle(fontSize: 8.0)),
                          pw.Center(child: pw.Text('x${item.quantity}', style: const pw.TextStyle(fontSize: 8.0))),
                          pw.Align(alignment: pw.Alignment.centerRight, child: pw.Text('INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(0)}', style: const pw.TextStyle(fontSize: 8.0))),
                        ],
                      ),
                    ),
                  ],
                ),
                pw.Divider(),

                // Summaries
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Subtotal', style: const pw.TextStyle(fontSize: 8.0)),
                    pw.Text('INR ${(bill.subtotal / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 8.0)),
                  ],
                ),
                if (bill.tax > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('GST (5%)', style: const pw.TextStyle(fontSize: 8.0)),
                      pw.Text('INR ${(bill.tax / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 8.0)),
                    ],
                  ),
                if (bill.discountAmount > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Discount', style: const pw.TextStyle(fontSize: 8.0)),
                      pw.Text('-INR ${(bill.discountAmount / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 8.0)),
                    ],
                  ),
                pw.Divider(),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('GRAND TOTAL', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10.0)),
                    pw.Text('INR ${(bill.total / 100).toStringAsFixed(2)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10.0)),
                  ],
                ),
                pw.SizedBox(height: 12.0),
                pw.Center(
                  child: pw.Text('THANK YOU! VISIT AGAIN.', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0)),
                ),
              ],
            ),
          );
        },
      ),
    );

    return pdf.save();
  }

  /// Triggers standard system print dialogue
  Future<void> printPdf(Uint8List pdfData) async {
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfData,
    );
  }
}
