import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import '../services/auth_service.dart';

/// Stream provider for auth state changes.
final authStateProvider = StreamProvider<AuthState>((ref) {
  return AuthService.onAuthStateChange;
});

/// Provider for the current authenticated user (Supabase User object).
final currentAuthUserProvider = Provider<User?>((ref) {
  return AuthService.currentUser;
});

/// Async provider for the current user's profile from the users table.
final userProfileProvider = FutureProvider<UserProfile?>((ref) async {
  final userId = AuthService.currentUser?.id;
  if (userId == null) return null;
  return await AuthService.fetchUserProfile(userId);
});

/// Provider that watches auth state and auto-refreshes user profile.
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthNotifierState>((ref) {
  return AuthNotifier(ref);
});

class AuthNotifierState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserProfile? profile;
  final String? errorMessage;

  const AuthNotifierState({
    this.isLoading = true,
    this.isAuthenticated = false,
    this.profile,
    this.errorMessage,
  });

  AuthNotifierState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    UserProfile? profile,
    String? errorMessage,
  }) =>
      AuthNotifierState(
        isLoading: isLoading ?? this.isLoading,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        profile: profile ?? this.profile,
        errorMessage: errorMessage,
      );
}

class AuthNotifier extends StateNotifier<AuthNotifierState> {
  final Ref _ref;
  StreamSubscription<AuthState>? _authSub;

  AuthNotifier(this._ref) : super(const AuthNotifierState()) {
    _init();
  }

  void _init() {
    // Check existing session
    _checkSession();

    // Listen for auth changes
    _authSub = AuthService.onAuthStateChange.listen((event) {
      if (event.event == AuthChangeEvent.signedIn ||
          event.event == AuthChangeEvent.tokenRefreshed) {
        _loadProfile();
      } else if (event.event == AuthChangeEvent.signedOut) {
        state = const AuthNotifierState(isLoading: false, isAuthenticated: false);
      }
    });
  }

  Future<void> _checkSession() async {
    if (AuthService.hasValidSession) {
      await _loadProfile();
    } else {
      state = const AuthNotifierState(isLoading: false, isAuthenticated: false);
    }
  }

  Future<void> _loadProfile() async {
    final userId = AuthService.currentUser?.id;
    if (userId == null) {
      state = const AuthNotifierState(isLoading: false, isAuthenticated: false);
      return;
    }

    try {
      final profile = await AuthService.fetchUserProfile(userId);
      state = AuthNotifierState(
        isLoading: false,
        isAuthenticated: true,
        profile: profile,
      );
    } catch (e) {
      state = AuthNotifierState(
        isLoading: false,
        isAuthenticated: true,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      await AuthService.signInWithEmail(email, password);
      await _loadProfile();
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> signOut() async {
    await AuthService.signOut();
    state = const AuthNotifierState(isLoading: false, isAuthenticated: false);
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }
}
