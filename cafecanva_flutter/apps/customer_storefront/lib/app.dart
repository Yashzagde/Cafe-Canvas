import 'package:flutter/material.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'router.dart';

class StorefrontApp extends StatelessWidget {
  const StorefrontApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CafeCanva Storefront',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.light, // Default customer flow to a warm, cozy light theme
      routerConfig: storefrontRouter,
    );
  }
}
