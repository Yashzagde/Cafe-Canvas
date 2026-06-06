import 'dart:convert';
import 'package:bcrypt/bcrypt.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import '../auth/secure_cache_keys.dart';
import 'supabase_service.dart';

/// Authentication service for CafeCanva.
/// Handles email/password login, PIN re-auth, and session management.
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static GoTrueClient get _auth => SupabaseService.auth;
  final _storage = const FlutterSecureStorage();

  static UserProfile? _currentUserProfile;
  static UserProfile? get currentUserProfile => _currentUserProfile;

  /// Sign in with email and password.
  static Future<AuthResponse> signInWithEmail(String email, String password) async {
    final response = await _auth.signInWithPassword(email: email, password: password);
    if (response.user != null) {
      await fetchUserProfile(response.user!.id);
    }
    return response;
  }

  /// Sign up with email and password.
  static Future<AuthResponse> signUp(String email, String password) async {
    return await _auth.signUp(email: email, password: password);
  }

  /// Sign out the current user.
  static Future<void> signOut() async {
    await _auth.signOut();
    await instance.clearCache();
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

  /// Fetch the user profile from the staff_accounts table.
  static Future<UserProfile?> fetchUserProfile(String userId) async {
    final response = await SupabaseService.from('staff_accounts')
        .select()
        .eq('auth_user_id', userId)
        .maybeSingle();
    if (response == null) return null;
    final profile = UserProfile.fromJson(response);
    _currentUserProfile = profile;
    return profile;
  }

  /// Update FCM token for the current user.
  static Future<void> updateFcmToken(String userId, String fcmToken) async {
    await SupabaseService.from('staff_accounts')
        .update({'fcm_token': fcmToken})
        .eq('auth_user_id', userId);
  }

  /// Get tenant/branch/role from JWT app_metadata.
  static Map<String, dynamic> get appMetadata {
    final user = currentUser;
    if (user == null) return {};
    return user.appMetadata;
  }

  /// Get tenant_id from JWT claims.
  static String? get tenantId => appMetadata['tenant_id'] as String? ?? _currentUserProfile?.tenantId;

  /// Get branch_id from JWT claims.
  static String? get branchId => appMetadata['branch_id'] as String? ?? _currentUserProfile?.branchId;

  /// Get role from JWT claims.
  static String? get userRole => appMetadata['role'] as String? ?? _currentUserProfile?.role;

  /// Refresh the current session.
  static Future<AuthResponse> refreshSession() async {
    return await _auth.refreshSession();
  }

  /// Blocker 2: Securely caches only the permitted revocable credentials
  Future<void> cacheStaffCredentials({
    required String refreshToken,
    required String pin,
    required UserProfile profile,
  }) async {
    final pinHash = BCrypt.hashpw(pin, BCrypt.gensalt(logRounds: 10));

    await Future.wait([
      _storage.write(key: SecureCacheKeys.refreshToken, value: refreshToken),
      _storage.write(key: SecureCacheKeys.staffPinHash, value: pinHash),
      _storage.write(key: SecureCacheKeys.lastBranchId, value: profile.branchId),
      _storage.write(
        key: SecureCacheKeys.staffProfile,
        value: jsonEncode(profile.toJson()),
      ),
    ]);
  }

  /// Online session restore on reconnect
  Future<AuthResponse?> restoreSessionFromCache() async {
    final rt = await _storage.read(key: SecureCacheKeys.refreshToken);
    if (rt == null) return null;
    try {
      final response = await _auth.recoverSession(rt);
      if (response.user != null) {
        await fetchUserProfile(response.user!.id);
      }
      return response;
    } catch (_) {
      await clearCache();
      return null;
    }
  }

  /// Check if there are cached staff credentials
  Future<bool> get hasCachedPin async {
    final hash = await _storage.read(key: SecureCacheKeys.staffPinHash);
    return hash != null;
  }

  /// Offline PIN verification using BCrypt checks
  Future<bool> verifyOfflinePin(String enteredPin) async {
    final hash = await _storage.read(key: SecureCacheKeys.staffPinHash);
    if (hash == null) return false;
    
    final match = BCrypt.checkpw(enteredPin, hash);
    if (match) {
      final cachedProfileStr = await _storage.read(key: SecureCacheKeys.staffProfile);
      if (cachedProfileStr != null) {
        _currentUserProfile = UserProfile.fromJson(jsonDecode(cachedProfileStr));
      }
    }
    return match;
  }

  Future<void> clearCache() async {
    await _storage.deleteAll();
    _currentUserProfile = null;
  }
}
