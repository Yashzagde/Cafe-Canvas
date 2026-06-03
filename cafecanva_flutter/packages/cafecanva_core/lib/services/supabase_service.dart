import 'package:supabase_flutter/supabase_flutter.dart';
import '../utils/constants.dart';

/// Singleton Supabase client accessor.
class SupabaseService {
  SupabaseService._();

  static SupabaseClient get client => Supabase.instance.client;

  /// Initialize Supabase. Call once in main.dart.
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: CafeCanvaConstants.supabaseUrl,
      anonKey: CafeCanvaConstants.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      realtimeClientOptions: const RealtimeClientOptions(
        logLevel: RealtimeLogLevel.info,
      ),
    );
  }

  /// Shorthand for supabase.auth
  static GoTrueClient get auth => client.auth;

  /// Shorthand for supabase.from(table)
  static SupabaseQueryBuilder from(String table) => client.from(table);

  /// Shorthand for supabase.functions
  static FunctionsClient get functions => client.functions;

  /// Shorthand for supabase.storage
  static SupabaseStorageClient get storage => client.storage;

  /// Shorthand for supabase.channel
  static RealtimeChannel channel(String name) => client.channel(name);

  /// Remove a realtime channel.
  static Future<void> removeChannel(RealtimeChannel channel) async {
    await client.removeChannel(channel);
  }

  /// Invoke an edge function.
  static Future<FunctionResponse> invokeFunction(
    String functionName, {
    Map<String, dynamic>? body,
  }) async {
    return await client.functions.invoke(
      functionName,
      body: body,
    );
  }

  /// Get current authenticated user's ID.
  static String? get currentUserId => client.auth.currentUser?.id;

  /// Check if user is authenticated.
  static bool get isAuthenticated => client.auth.currentUser != null;
}
