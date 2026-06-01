import 'package:intl/intl.dart';

/// Utility for converting between paise (DB storage) and display rupees.
///
/// ALL prices in the database are stored as INTEGER paise.
/// ₹1 = 100 paise. Example: ₹290 → stored as 29000.
class CurrencyFormatter {
  CurrencyFormatter._();

  static final _inrFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static final _inrFormatDecimal = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  /// Convert paise (int from DB) to rupees for display.
  /// Example: 29000 → 290
  static int paiseToRupees(int paise) => paise ~/ 100;

  /// Convert rupees to paise for DB storage.
  /// Example: 290 → 29000
  static int rupeesToPaise(int rupees) => rupees * 100;

  /// Convert rupees (double) to paise. Rounds to avoid FP errors.
  /// Example: 290.50 → 29050
  static int rupeesDoubleToPaise(double rupees) => (rupees * 100).round();

  /// Format paise as display string: 29000 → "₹290"
  static String formatPaise(int paise) {
    return _inrFormat.format(paise / 100);
  }

  /// Format paise with decimals: 29050 → "₹290.50"
  static String formatPaiseDecimal(int paise) {
    return _inrFormatDecimal.format(paise / 100);
  }

  /// Format rupees (int) as display string: 290 → "₹290"
  static String formatRupees(int rupees) {
    return _inrFormat.format(rupees);
  }

  /// Format a raw number (already in rupees) with ₹ symbol.
  static String formatAmount(num amount) {
    return _inrFormat.format(amount);
  }

  /// Parse a display string back to paise: "₹290" → 29000
  static int? parseToPaise(String text) {
    final cleaned = text.replaceAll(RegExp(r'[₹,\s]'), '');
    final parsed = double.tryParse(cleaned);
    if (parsed == null) return null;
    return (parsed * 100).round();
  }
}
