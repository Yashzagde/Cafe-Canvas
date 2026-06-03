import 'package:intl/intl.dart';

/// Date/time formatting utilities for IST (India Standard Time).
class DateFormatter {
  DateFormatter._();

  static final _dateFormat = DateFormat('dd MMM yyyy');
  static final _timeFormat = DateFormat('hh:mm a');
  static final _dateTimeFormat = DateFormat('dd MMM yyyy, hh:mm a');
  static final _shortDateFormat = DateFormat('dd/MM/yy');
  static final _isoFormat = DateFormat("yyyy-MM-dd'T'HH:mm:ss");

  /// Format DateTime to "01 Jun 2026"
  static String formatDate(DateTime dt) => _dateFormat.format(dt.toLocal());

  /// Format DateTime to "02:30 PM"
  static String formatTime(DateTime dt) => _timeFormat.format(dt.toLocal());

  /// Format DateTime to "01 Jun 2026, 02:30 PM"
  static String formatDateTime(DateTime dt) => _dateTimeFormat.format(dt.toLocal());

  /// Format DateTime to "01/06/26"
  static String formatShortDate(DateTime dt) => _shortDateFormat.format(dt.toLocal());

  /// Relative time: "5 mins ago", "2 hours ago", "Yesterday"
  static String relativeTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt.toLocal());

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min${diff.inMinutes > 1 ? 's' : ''} ago';
    if (diff.inHours < 24) return '${diff.inHours} hour${diff.inHours > 1 ? 's' : ''} ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return formatDate(dt);
  }

  /// Elapsed time since a timestamp: "12:45" (mm:ss format)
  static String elapsedSince(DateTime dt) {
    final diff = DateTime.now().difference(dt.toLocal());
    final mins = diff.inMinutes;
    final secs = diff.inSeconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  /// Parse ISO date string from Supabase.
  static DateTime? parseIso(String? iso) {
    if (iso == null || iso.isEmpty) return null;
    return DateTime.tryParse(iso)?.toLocal();
  }

  /// Today's date as YYYY-MM-DD for query filters.
  static String todayIso() => DateFormat('yyyy-MM-dd').format(DateTime.now());

  /// Start of today as ISO string.
  static String startOfTodayIso() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day).toUtc().toIso8601String();
  }

  /// Start of this week (Monday) as ISO string.
  static String startOfWeekIso() {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    return DateTime(monday.year, monday.month, monday.day).toUtc().toIso8601String();
  }

  /// Start of this month as ISO string.
  static String startOfMonthIso() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, 1).toUtc().toIso8601String();
  }
}
