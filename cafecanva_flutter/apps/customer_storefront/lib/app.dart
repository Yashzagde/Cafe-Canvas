import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'router.dart';

// Riverpod provider for storefront dynamic configs mapping
final storefrontConfigProvider = FutureProvider<StorefrontConfig>((ref) async {
  // In production, reads the active config filtered by the active subdomain/slug
  return StorefrontConfig(
    id: 'demo-cfg-1',
    tenantId: 'demo-tenant-5555',
    primaryColor: '#D97706', // Primary Brand Seed
  );
});

class StorefrontApp extends ConsumerWidget {
  const StorefrontApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configState = ref.watch(storefrontConfigProvider);

    return configState.when(
      data: (config) => MaterialApp.router(
        title: 'CafeCanva Storefront',
        debugShowCheckedModeBanner: false,
        theme: buildTenantTheme(config),
        routerConfig: storefrontRouter,
      ),
      loading: () => MaterialApp.router(
        title: 'CafeCanva Storefront',
        debugShowCheckedModeBanner: false,
        theme: buildDefaultTheme(),
        routerConfig: storefrontRouter,
      ),
      error: (_, __) => MaterialApp.router(
        title: 'CafeCanva Storefront',
        debugShowCheckedModeBanner: false,
        theme: buildDefaultTheme(),
        routerConfig: storefrontRouter,
      ),
    );
  }
}
