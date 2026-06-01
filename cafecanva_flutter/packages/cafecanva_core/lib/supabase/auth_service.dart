import 'dart:convert';
import 'package:bcrypt/bcrypt.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../auth/secure_cache_keys.dart';
import 'supabase_service.dart';

class AuthService {
  static final AuthService instance = AuthService._internal();
  AuthService._internal();

  final _storage = const FlutterSecureStorage();
  final _client = SupabaseService.instance.client;

  UserProfile? _currentUser;
  UserProfile? get currentUser => _currentUser;

  /// Full Email + Password Authentication
  Future<UserProfile?> signInWithEmail({
    required String email,
    required String password,
    required String pin,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null && response.session != null) {
        final profile = await _fetchAndCacheUserProfile(response.user!.id);
        
        if (profile != null) {
          // Blocker 2: Cache only refresh token, bcrypt hash of PIN, and minimal snap
          await cacheStaffCredentials(
            refreshToken: response.session!.refreshToken!,
            pin: pin,
            profile: profile,
          );
        }
        return profile;
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  /// Blocker 2: Securely caches only the permitted revocable credentials
  Future<void> cacheStaffCredentials({
    required String refreshToken,
    required String pin,
    required UserProfile profile,
  }) async {
    // Generate salt and BCrypt hash securely
    final pinHash = BCrypt.hashpw(pin, BCrypt.gensalt(logRounds: 10));

    await Future.wait([
      _storage.write(key: SecureCacheKeys.refreshToken, value: refreshToken),
      _storage.write(key: SecureCacheKeys.staffPinHash, value: pinHash),
      _storage.write(key: SecureCacheKeys.lastBranchId, value: profile.branchId),
      _storage.write(
        key: SecureCacheKeys.staffProfile,
        value: jsonEncode(profile.toMinimalJson()),
      ),
    ]);
  }

  /// Online session restore on reconnect
  Future<AuthResponse?> restoreSessionFromCache() async {
    final rt = await _storage.read(key: SecureCacheKeys.refreshToken);
    if (rt == null) return null;
    try {
      final response = await _client.auth.recoverSession(rt); // Exchanges refresh -> fresh access token
      if (response.user != null) {
        await _fetchAndCacheUserProfile(response.user!.id);
      }
      return response;
    } catch (_) {
      await clearCache(); // Revoked/Expired -> force re-login
      return null;
    }
  }

  /// Offline PIN verification using BCrypt checks
  Future<bool> verifyOfflinePin(String enteredPin) async {
    final hash = await _storage.read(key: SecureCacheKeys.staffPinHash);
    if (hash == null) return false;
    
    // Compare entered PIN with stored bcrypt hash
    final match = BCrypt.checkpw(enteredPin, hash);
    if (match) {
      final cachedProfileStr = await _storage.read(key: SecureCacheKeys.staffProfile);
      if (cachedProfileStr != null) {
        _currentUser = UserProfile.fromJson(jsonDecode(cachedProfileStr));
      }
    }
    return match;
  }

  /// Retrieve the current JWT application metadata claims structure
  Map<String, dynamic> getJwtClaims() {
    final session = _client.auth.currentSession;
    if (session == null) return {};

    final parts = session.accessToken.split('.');
    if (parts.length != 3) return {};

    try {
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final claims = jsonDecode(payload) as Map<String, dynamic>;
      return claims['app_metadata'] as Map<String, dynamic>? ?? {};
    } catch (_) {
      return {};
    }
  }

  Future<void> clearCache() async {
    await _storage.deleteAll();
    _currentUser = null;
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
    await clearCache();
  }

  Future<UserProfile?> _fetchAndCacheUserProfile(String userId) async {
    final response = await _client
        .from('users')
        .select()
        .eq('id', userId)
        .maybeSingle();

    if (response != null) {
      _currentUser = UserProfile.fromJson(response);
      return _currentUser;
    }
    return null;
  }
}
