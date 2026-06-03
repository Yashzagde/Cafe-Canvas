import 'package:flutter/material.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'router.dart';

/// Root widget for the CafeCanvas Staff Web PWA.
/// Uses Material 3 with the CafeCanvas design system theming.
class StaffWebApp extends StatelessWidget {
  const StaffWebApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CafeCanvas Staff',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      themeMode: ThemeMode.light,
      routerConfig: staffWebRouter,
    );
  }
}
