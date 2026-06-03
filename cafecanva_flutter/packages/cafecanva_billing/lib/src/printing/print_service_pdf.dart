import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'print_service.dart';

class PdfPrintService implements PrintService {
  @override
  Future<void> printReceipt({
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
                    style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14.0),
                  ),
                ),
                if (settings.address != null)
                  pw.Center(child: pw.Text(settings.address!, style: const pw.TextStyle(fontSize: 8.0))),
                if (settings.gstin != null)
                  pw.Center(child: pw.Text('GSTIN: ${settings.gstin!}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0))),
                pw.Divider(),
                pw.Text('Bill ID: ${bill.id.substring(0, 8)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0)),
                pw.Text('Date: ${bill.createdAt.toLocal().toString().split('.')[0]}', style: const pw.TextStyle(fontSize: 8.0)),
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
                        pw.Text('ITEM', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0)),
                        pw.Center(child: pw.Text('QTY', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0))),
                        pw.Align(alignment: pw.Alignment.centerRight, child: pw.Text('PRICE', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 8.0))),
                      ],
                    ),
                    ...items.map(
                      (item) => pw.TableRow(
                        children: [
                          pw.Text(item.itemName, style: const pw.TextStyle(fontSize: 7.0)),
                          pw.Center(child: pw.Text('x${item.quantity}', style: const pw.TextStyle(fontSize: 7.0))),
                          pw.Align(alignment: pw.Alignment.centerRight, child: pw.Text('INR ${(item.unitPrice * item.quantity / 100).toStringAsFixed(0)}', style: const pw.TextStyle(fontSize: 7.0))),
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
                    pw.Text('Subtotal', style: const pw.TextStyle(fontSize: 7.0)),
                    pw.Text('INR ${(bill.subtotal / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 7.0)),
                  ],
                ),
                if (bill.tax > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('GST (5%)', style: const pw.TextStyle(fontSize: 7.0)),
                      pw.Text('INR ${(bill.tax / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 7.0)),
                    ],
                  ),
                if (bill.discountAmount > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text('Discount', style: const pw.TextStyle(fontSize: 7.0)),
                      pw.Text('-INR ${(bill.discountAmount / 100).toStringAsFixed(2)}', style: const pw.TextStyle(fontSize: 7.0)),
                    ],
                  ),
                pw.Divider(),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('GRAND TOTAL', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0)),
                    pw.Text('INR ${(bill.total / 100).toStringAsFixed(2)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9.0)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }
}
