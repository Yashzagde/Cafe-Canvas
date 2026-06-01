import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive storage for persistent customer carts
  await Hive.initFlutter();
  await Hive.openBox('customer_storefront_cart');

  // Initialize Supabase connection
  await SupabaseService.instance.initialize(
    url: 'https://oeringgdbxmmihgvuyfa.supabase.co',
    anonKey: 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU',
  );

  runApp(
    const ProviderScope(
      child: StorefrontApp(),
    ),
  );
}
