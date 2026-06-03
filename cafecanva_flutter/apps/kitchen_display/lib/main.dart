import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'app.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('KDS Background Notification received: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Config validation (fails fast on missing --dart-define parameters)
  EnvConfig.assertValid();

  // Keep KDS wall mounted screens awake
  await WakelockPlus.enable();

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

  // 3b. Initialize Firebase Messaging for KDS push alerts
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
  } catch (e) {
    debugPrint('Firebase initialization failed: $e. Using local simulation fallback.');
  }

  // 4. Expose dynamic Edge Function settings
  await SupabaseService.instance.initialize(
    url: EnvConfig.supabaseUrl,
    anonKey: EnvConfig.supabaseAnonKey,
  );

  // 5. Restore session from securely cached refresh token
  final authService = AuthService.instance;
  await authService.restoreSessionFromCache();

  runApp(
    const ProviderScope(
      child: KdsApp(),
    ),
  );
}
