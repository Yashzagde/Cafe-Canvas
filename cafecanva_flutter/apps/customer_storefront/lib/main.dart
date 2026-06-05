import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Config validation (fails fast on missing --dart-define parameters)
  EnvConfig.assertValid();

  // 2. Initialize Hive local persistent cache
  await Hive.initFlutter();
  await Hive.openBox('cart');
  await Hive.openBox('session');

  // 3. Initialize Supabase connection
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );

  runApp(
    const ProviderScope(
      child: StorefrontApp(),
    ),
  );
}
