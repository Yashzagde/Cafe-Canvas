import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';

/// Provider for the SupabaseClient instance.
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return SupabaseService.client;
});

/// Provider for the GoTrueClient (auth).
final supabaseAuthProvider = Provider<GoTrueClient>((ref) {
  return SupabaseService.auth;
});
