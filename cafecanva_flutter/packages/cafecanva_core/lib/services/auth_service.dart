import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import 'supabase_service.dart';

/// Authentication service for CafeCanva.
/// Handles email/password login, PIN re-auth, and session management.
class AuthService {
  AuthService._();

  static GoTrueClient get _auth => SupabaseService.auth;

  /// Sign in with email and password.
  static Future<AuthResponse> signInWithEmail(String email, String password) async {
    return await _auth.signInWithPassword(email: email, password: password);
  }

  /// Sign up with email and password.
  static Future<AuthResponse> signUp(String email, String password) async {
    return await _auth.signUp(email: email, password: password);
  }

  /// Sign out the current user.
  static Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Get the current session.
  static Session? get currentSession => _auth.currentSession;

  /// Get the current user.
  static User? get currentUser => _auth.currentUser;

  /// Check if session is valid and not expired.
  static bool get hasValidSession {
    final session = currentSession;
    if (session == null) return false;
    final expiresAt = DateTime.fromMillisecondsSinceEpoch(session.expiresAt! * 1000);
    return expiresAt.isAfter(DateTime.now());
  }

  /// Listen to auth state changes.
  static Stream<AuthState> get onAuthStateChange => _auth.onAuthStateChange;

  /// Fetch the user profile from the users table.
  static Future<UserProfile?> fetchUserProfile(String userId) async {
    final response = await SupabaseService.from('users')
        .select()
        .eq('id', userId)
        .maybeSingle();
    if (response == null) return null;
    return UserProfile.fromJson(response);
  }

  /// Update FCM token for the current user.
  static Future<void> updateFcmToken(String userId, String fcmToken) async {
    await SupabaseService.from('users')
        .update({'fcm_token': fcmToken})
        .eq('id', userId);
  }

  /// Get tenant/branch/role from JWT app_metadata.
  static Map<String, dynamic> get appMetadata {
    final user = currentUser;
    if (user == null) return {};
    return user.appMetadata;
  }

  /// Get tenant_id from JWT claims.
  static String? get tenantId => appMetadata['tenant_id'] as String?;

  /// Get branch_id from JWT claims.
  static String? get branchId => appMetadata['branch_id'] as String?;

  /// Get role from JWT claims.
  static String? get userRole => appMetadata['role'] as String?;

  /// Refresh the current session.
  static Future<AuthResponse> refreshSession() async {
    return await _auth.refreshSession();
  }
}
