/// Input validation helpers for CafeCanva forms.
class Validators {
  Validators._();

  /// Validate email address.
  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final regex = RegExp(r'^[\w\.\+\-]+@[\w\-]+\.[\w\-\.]+$');
    if (!regex.hasMatch(value.trim())) return 'Enter a valid email';
    return null;
  }

  /// Validate Indian phone number (10 digits, optional +91 prefix).
  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) return 'Phone is required';
    final cleaned = value.replaceAll(RegExp(r'[\s\-\+]'), '');
    final regex = RegExp(r'^(91)?[6-9]\d{9}$');
    if (!regex.hasMatch(cleaned)) return 'Enter valid 10-digit phone';
    return null;
  }

  /// Validate 4-digit PIN.
  static String? pin(String? value) {
    if (value == null || value.isEmpty) return 'PIN is required';
    if (value.length != 4) return 'PIN must be 4 digits';
    if (!RegExp(r'^\d{4}$').hasMatch(value)) return 'PIN must be numeric';
    return null;
  }

  /// Validate non-empty text field.
  static String? required(String? value, [String fieldName = 'This field']) {
    if (value == null || value.trim().isEmpty) return '$fieldName is required';
    return null;
  }

  /// Validate password (minimum 6 characters).
  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  /// Validate price in rupees (positive number).
  static String? price(String? value) {
    if (value == null || value.trim().isEmpty) return 'Price is required';
    final parsed = double.tryParse(value.trim());
    if (parsed == null || parsed < 0) return 'Enter a valid price';
    return null;
  }

  /// Validate GSTIN (15-character alphanumeric Indian GST Number).
  static String? gstin(String? value) {
    if (value == null || value.trim().isEmpty) return null; // optional
    final regex = RegExp(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$');
    if (!regex.hasMatch(value.trim().toUpperCase())) return 'Enter a valid GSTIN';
    return null;
  }

  /// Validate percentage (0-100).
  static String? percentage(String? value) {
    if (value == null || value.trim().isEmpty) return 'Value is required';
    final parsed = double.tryParse(value.trim());
    if (parsed == null || parsed < 0 || parsed > 100) return 'Enter 0-100';
    return null;
  }
}
