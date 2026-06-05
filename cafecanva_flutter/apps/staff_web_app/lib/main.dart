import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Config validation (fails fast on missing --dart-define parameters)
  EnvConfig.assertValid();

  // 2. Initialize Supabase connection
  await Supabase.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );

  // 3. Initialize core Supabase service singleton
  await SupabaseService.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
  );

  // 4. Restore session from cached refresh token
  final authService = AuthService.instance;
  await authService.restoreSessionFromCache();

  runApp(
    const ProviderScope(
      child: StaffWebApp(),
    ),
  );
}
