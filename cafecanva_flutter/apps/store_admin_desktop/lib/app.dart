import 'package:flutter/material.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'router.dart';

class StoreAdminDesktopApp extends StatelessWidget {
  const StoreAdminDesktopApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CafeCanva Store Admin Desktop',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.light,
      routerConfig: storeAdminDesktopRouter,
    );
  }
}
