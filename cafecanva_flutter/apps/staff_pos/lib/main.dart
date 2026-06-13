import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_billing/cafecanva_billing.dart';
import 'src/native_billing.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  String? initError;

  try {
    // 1. Config validation (fails fast on missing --dart-define parameters)
    EnvConfig.assertValid();

    // 2. Initialize Hive local persistent cache
    await Hive.initFlutter();
    await Hive.openBox('session');
    
    // Initialize offline sync service
    await OfflineSyncService.instance.initialize();

    // 3. Initialize Supabase connection
    await Supabase.initialize(
      url: EnvConfig.supabaseUrl,
      anonKey: EnvConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );

    // 3a. Restore cached session
    await AuthService.instance.restoreSessionFromCache();

    // 4. Inject concrete native mobile handlers at app startup
    final razorpayGateway = RazorpayPaymentGateway();
    razorpayGateway.initialize(
      onSuccess: (res) {
        debugPrint('Native Mobile POS Payment Success: ${res.paymentId}');
      },
      onFailure: (res) {
        debugPrint('Native Mobile POS Payment Failed: ${res.message}');
      },
    );
    BillingFactory.registerNativeGateway(razorpayGateway);
    BillingFactory.registerNativeService(BluetoothPrintService());
  } catch (e, stackTrace) {
    debugPrint('Initialization error in main(): $e\n$stackTrace');
    initError = e.toString();
  }

  runApp(
    ProviderScope(
      child: initError != null
          ? InitializationErrorApp(errorMessage: initError)
          : const StaffPosApp(),
    ),
  );
}

class InitializationErrorApp extends StatelessWidget {
  final String errorMessage;

  const InitializationErrorApp({Key? key, required this.errorMessage}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CafeCanva POS Diagnostics',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFDC2626), // Red error
          brightness: Brightness.dark,
        ),
      ),
      home: Scaffold(
        backgroundColor: const Color(0xFF0F0F11),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Card(
                color: const Color(0xFF1C1917),
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16.0),
                  side: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: Color(0xFFDC2626),
                            size: 32,
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Launch Initialization Failed',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Color(0xFF292524)),
                      const SizedBox(height: 16),
                      const Text(
                        'Details:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFA8A29E),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F0F11),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: SelectableText(
                          errorMessage,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 13,
                            color: Color(0xFFFCA5A5),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Troubleshooting Steps:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFA8A29E),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const BulletPoint(text: 'Ensure the device has internet access (WiFi/Mobile data).'),
                      const BulletPoint(text: 'Check if compile-time env parameters (SUPABASE_URL, SUPABASE_ANON_KEY) were correctly injected during build.'),
                      const BulletPoint(text: 'Verify that the Supabase service is online and active.'),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            main();
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry Startup'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFDC2626),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class BulletPoint extends StatelessWidget {
  final String text;
  const BulletPoint({Key? key, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: Color(0xFFD6D3D1)),
            ),
          ),
        ],
      ),
    );
  }
}
