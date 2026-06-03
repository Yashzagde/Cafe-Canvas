/// Supabase project constants for CafeCanva.
class CafeCanvaConstants {
  CafeCanvaConstants._();

  static const String supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU';

  /// Edge function endpoints
  static const String edgeFnCallStaff = 'call-staff';
  static const String edgeFnGenerateBill = 'generate-bill';
  static const String edgeFnVerifyPayment = 'verify-payment';

  /// Supabase Storage buckets
  static const String bucketMenuImages = 'menu-images';

  /// Default timezone
  static const String defaultTimezone = 'Asia/Kolkata';

  /// Default currency
  static const String defaultCurrency = 'INR';

  /// Staff call cooldown in seconds
  static const int staffCallCooldownSeconds = 120;

  /// Max staff per tenant
  static const int maxStaffPerTenant = 50;

  /// Role hierarchy
  static const List<String> roleHierarchy = [
    'owner',
    'manager',
    'cashier',
    'staff',
    'kitchen',
  ];

  /// Table status values
  static const String tableAvailable = 'available';
  static const String tableOccupied = 'occupied';
  static const String tableReserved = 'reserved';
  static const String tableCleaning = 'cleaning';

  /// Order status values
  static const String orderPending = 'pending';
  static const String orderConfirmed = 'confirmed';
  static const String orderPreparing = 'preparing';
  static const String orderReady = 'ready';
  static const String orderServed = 'served';
  static const String orderBilled = 'billed';
  static const String orderPaid = 'paid';
  static const String orderCancelled = 'cancelled';

  /// KDS status values
  static const String kdsPending = 'pending';
  static const String kdsPreparing = 'preparing';
  static const String kdsReady = 'ready';
  static const String kdsServed = 'served';

  /// Bill status values
  static const String billOpen = 'open';
  static const String billPaid = 'paid';
  static const String billVoided = 'voided';

  /// Discount types
  static const String discountPercent = 'percent';
  static const String discountFlat = 'flat';

  /// Plan tiers
  static const List<String> planTiers = ['free', 'pro', 'growth', 'enterprise'];
}
