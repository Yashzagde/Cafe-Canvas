import 'package:flutter/material.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'router.dart';

class StoreAdminMobileApp extends StatelessWidget {
  const StoreAdminMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CafeCanva Store Admin',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.light,
      routerConfig: storeAdminMobileRouter,
    );
  }
}
