import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'features/login_screen.dart';
import 'features/screens.dart';

final GoRouter storeAdminMobileRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    final isOnLoginPage = state.matchedLocation == '/login';

    // Not authenticated → must go to login
    if (session == null) {
      return isOnLoginPage ? null : '/login';
    }

    // Authenticated → check role
    final role = session.user.appMetadata['role'] as String?;
    final allowedRoles = ['manager', 'owner', 'TENANT_OWNER', 'BRANCH_ADMIN', 'MANAGER'];
    if (role == null || !allowedRoles.contains(role)) {
      Supabase.instance.client.auth.signOut();
      return '/unauthorized';
    }

    // Authenticated + valid role + on login page → go to dashboard
    if (isOnLoginPage) {
      return '/';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
    GoRoute(
      path: '/menu',
      builder: (context, state) => const MenuEditorScreen(),
    ),
    GoRoute(
      path: '/staff',
      builder: (context, state) => const StaffManagementScreen(),
    ),
    GoRoute(
      path: '/unauthorized',
      builder: (context, state) => Scaffold(
        body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CcEmptyState(
              icon: Icons.gpp_bad,
              title: 'Access Unauthorized',
              description: 'You do not have required manager/owner credentials to open this app.',
            ),
            const SizedBox(height: 24),
            Center(
              child: ElevatedButton.icon(
                onPressed: () => context.go('/login'),
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                label: const Text('Back to Login'),
              ),
            ),
          ],
        ),
      ),
    ),
  ],
);
