import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app_theme.dart';

ThemeData buildTenantTheme(StorefrontConfig config) {
  try {
    final hexString = (config.primaryColor ?? '#FFA500').replaceFirst('#', '0xFF');
    final intColor = int.parse(hexString);
    final brandColor = Color(intColor);

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: brandColor,
        brightness: Brightness.light,
        primary: brandColor,
      ),
      textTheme: GoogleFonts.dmSansTextTheme(),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: const CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(CafeCanvaRadius.lg),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(CafeCanvaRadius.md),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brandColor,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14.0),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(CafeCanvaRadius.md),
          ),
        ),
      ),
    );
  } catch (_) {
    return buildLightTheme(); // Fallback to safe light brand theme
  }
}

ThemeData buildDefaultTheme() {
  return buildLightTheme();
}
