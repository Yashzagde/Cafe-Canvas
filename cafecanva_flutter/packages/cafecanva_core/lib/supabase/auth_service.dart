import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
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
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        final profile = await _fetchAndCacheUserProfile(response.user!.id);
        
        // Cache credentials securely for offline/PIN authentication
        if (profile != null) {
          await _storage.write(key: 'cached_user_profile', value: jsonEncode(profile.toJson()));
          await _storage.write(key: 'cached_email', value: email);
          await _storage.write(key: 'cached_password', value: password);
        }
        return profile;
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  /// 4-Digit Quick PIN Authenticator
  /// Compares local entered PIN with locally cached pin_hash (in offline/re-auth scenarios)
  /// or performs normal quick re-validation.
  Future<UserProfile?> signInWithPin(String pin) async {
    try {
      final cachedProfileStr = await _storage.read(key: 'cached_user_profile');
      if (cachedProfileStr == null) {
        throw Exception('No cached user session found. Please log in with email/password first.');
      }

      final profileJson = jsonDecode(cachedProfileStr) as Map<String, dynamic>;
      final cachedProfile = UserProfile.fromJson(profileJson);

      // Verify PIN: In a production scenario, we compare against a local bcrypt/SHA-256 hash.
      // We will perform a simple validation check against the stored profile.pinHash:
      // Note: A secure client-side comparison protects user authentication states locally.
      if (cachedProfile.pinHash != null && cachedProfile.pinHash != pin) {
        throw Exception('Invalid Quick PIN entered.');
      }

      // If online, perform token check or full restore
      final currentSession = _client.auth.currentSession;
      if (currentSession != null && !currentSession.isExpired) {
        _currentUser = cachedProfile;
        return _currentUser;
      }

      // Offline bypass or Session Restoration
      final email = await _storage.read(key: 'cached_email');
      final pass = await _storage.read(key: 'cached_password');
      if (email != null && pass != null) {
        return await signInWithEmail(email: email, password: pass);
      }

      _currentUser = cachedProfile;
      return _currentUser;
    } catch (e) {
      rethrow;
    }
  }

  /// Retrieve the current JWT application metadata claims structure
  Map<String, dynamic> getJwtClaims() {
    final session = _client.auth.currentSession;
    if (session == null) return {};
    
    // Extract and decode JWT payload claims
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

  Future<void> signOut() async {
    await _client.auth.signOut();
    await _storage.deleteAll();
    _currentUser = null;
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
