class EnvConfig {
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const String env = String.fromEnvironment('ENV', defaultValue: 'dev');

  static bool get isDev => env == 'dev';
  static bool get isProd => env == 'prod';

  static void assertValid() {
    if (supabaseUrl.isEmpty) {
      throw StateError('CRITICAL: SUPABASE_URL has not been defined. Pass it using --dart-define=SUPABASE_URL=...');
    }
    if (supabaseAnonKey.isEmpty) {
      throw StateError('CRITICAL: SUPABASE_ANON_KEY has not been defined. Pass it using --dart-define=SUPABASE_ANON_KEY=...');
    }
  }
}
