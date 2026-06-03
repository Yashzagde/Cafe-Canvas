import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CafeCanvaColors {
  // Primary brand: warm amber/orange
  static const primary = Color(0xFFD97706);     // Amber 600
  static const primaryLight = Color(0xFFFDE68A); // Amber 200
  static const primaryDark = Color(0xFF92400E);  // Amber 800

  // Secondary: terracotta
  static const secondary = Color(0xFFEA580C);   // Orange 600

  // Semantic
  static const success = Color(0xFF16A34A);     // Green 600
  static const error = Color(0xFFDC2626);       // Red 600
  static const warning = Color(0xFFF59E0B);     // Amber 500
  static const info = Color(0xFF2563EB);        // Blue 600

  // Table status colors
  static const tableAvailable = Color(0xFF16A34A);
  static const tableOccupied = Color(0xFFDC2626);
  static const tableReserved = Color(0xFFF59E0B);
  static const tableCleaning = Color(0xFF6366F1);

  // Order status colors
  static const orderPending = Color(0xFFF59E0B);
  static const orderConfirmed = Color(0xFF2563EB);
  static const orderPreparing = Color(0xFFF97316);
  static const orderReady = Color(0xFF16A34A);
  static const orderServed = Color(0xFF78716C);
  static const orderPaid = Color(0xFF16A34A);
  static const orderCancelled = Color(0xFFDC2626);

  // Neutral Colors (Stone)
  static const stone50 = Color(0xFFFAFAF7);
  static const stone100 = Color(0xFFF5F5F4);
  static const stone200 = Color(0xFFE7E5E4);
  static const stone300 = Color(0xFFD6D3D1);
  static const stone400 = Color(0xFFA8A29E);
  static const stone500 = Color(0xFF78716C);
  static const stone800 = Color(0xFF1C1917);
}

class CafeCanvaSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
}

class CafeCanvaRadius {
  static const sm = Radius.circular(8.0);
  static const md = Radius.circular(12.0);
  static const lg = Radius.circular(16.0);
  static const xl = Radius.circular(24.0);
  static const full = Radius.circular(999.0);
}

ThemeData buildLightTheme() {
  final base = ThemeData.light();
  return base.copyWith(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: CafeCanvaColors.primary,
      brightness: Brightness.light,
      primary: CafeCanvaColors.primary,
      secondary: CafeCanvaColors.secondary,
      background: CafeCanvaColors.stone50,
      surface: Colors.white,
    ),
    textTheme: GoogleFonts.dmSansTextTheme(base.textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: CafeCanvaColors.stone800,
        fontSize: 18.0,
        fontWeight: FontWeight.bold,
      ),
    ),
    cardTheme: const CardTheme(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(CafeCanvaRadius.lg),
        side: BorderSide(color: CafeCanvaColors.stone200),
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: CafeCanvaColors.stone50,
      contentPadding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(CafeCanvaRadius.md),
        borderSide: BorderSide(color: CafeCanvaColors.stone200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.all(CafeCanvaRadius.md),
        borderSide: BorderSide(color: CafeCanvaColors.stone200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.all(CafeCanvaRadius.md),
        borderSide: BorderSide(color: CafeCanvaColors.primary, width: 1.5),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: CafeCanvaColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14.0),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(CafeCanvaRadius.md),
        ),
      ),
    ),
  );
}

ThemeData buildDarkTheme() {
  final base = ThemeData.dark();
  return base.copyWith(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: CafeCanvaColors.primary,
      brightness: Brightness.dark,
      primary: CafeCanvaColors.primary,
      secondary: CafeCanvaColors.secondary,
      background: const Color(0xFF0F0F11),
      surface: const Color(0xFF1C1917),
    ),
    textTheme: GoogleFonts.dmSansTextTheme(base.textTheme),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1C1917),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      centerTitle: true,
    ),
    cardTheme: const CardTheme(
      elevation: 0,
      color: Color(0xFF1C1917),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(CafeCanvaRadius.lg),
        side: BorderSide(color: Color(0xFF292524)),
      ),
    ),
  );
}
