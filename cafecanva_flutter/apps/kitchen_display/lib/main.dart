import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Ensure the KDS tablet stays awake indefinitely
  await WakelockPlus.enable();
  
  // Initialize Supabase service client
  await SupabaseService.instance.initialize(
    url: 'https://oeringgdbxmmihgvuyfa.supabase.co',
    anonKey: 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU',
  );

  runApp(
    const ProviderScope(
      child: KdsApp(),
    ),
  );
}
