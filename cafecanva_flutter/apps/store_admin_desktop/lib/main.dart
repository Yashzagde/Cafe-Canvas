import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:window_manager/window_manager.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Config validation (fails fast on missing --dart-define parameters)
  EnvConfig.assertValid();

  // 2. Initialize Hive local persistent cache
  await Hive.initFlutter();
  await Hive.openBox('session');

  // 3. Initialize Supabase connection
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );

  // 4. Expose dynamic Edge Function settings
  await SupabaseService.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
  );

  // 5. Restore session from securely cached refresh token
  final authService = AuthService.instance;
  await authService.restoreSessionFromCache();

  // 6. Blocker 1 & Part 6: Window constraints initialization natively on desktop targets
  if (!kIsWeb && (Platform.isWindows || Platform.isMacOS || Platform.isLinux)) {
    await windowManager.ensureInitialized();
    await windowManager.setMinimumSize(const Size(1200, 700));
    await windowManager.setTitle('CafeCanva Admin');
  }

  runApp(
    const ProviderScope(
      child: StoreAdminDesktopApp(),
    ),
  );
}
