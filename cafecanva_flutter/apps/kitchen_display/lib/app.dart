import 'package:flutter/material.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'features/kds_dashboard_screen.dart';

class KdsApp extends StatelessWidget {
  const KdsApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CafeCanva KDS',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.dark, // Force Dark theme on KDS screens
      home: const KdsDashboardScreen(branchId: 'demo-branch-7777'), // Seeded default branch
    );
  }
}
