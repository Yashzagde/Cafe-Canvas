import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';

// Feature screens
import 'features/auth/login_screen.dart';
import 'features/auth/pin_lock_screen.dart';
import 'features/dashboard/staff_dashboard_screen.dart';
import 'features/attendance/clock_in_screen.dart';
import 'features/tables/table_session_screen.dart';
import 'features/menu/menu_availability_screen.dart';
import 'features/activity/activity_feed_screen.dart';

/// Staff Web PWA router with auth guard.
final GoRouter staffWebRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    final isLoginPage = state.matchedLocation == '/';
    final isPinPage = state.matchedLocation == '/pin';

    if (session == null && !isLoginPage) {
      return '/';
    }

    if (session != null && isLoginPage) {
      return '/dashboard';
    }

    // Role check — only staff roles allowed
    if (session != null) {
      final role = session.user.appMetadata['role'] as String?;
      final allowed = ['staff', 'cashier', 'manager', 'owner', 'bartender'];
      if (role == null || !allowed.contains(role)) {
        Supabase.instance.client.auth.signOut();
        return '/unauthorized';
      }
    }

    return null;
  },
  routes: [
    // ── Auth ──
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/pin',
      builder: (context, state) => const PinLockScreen(),
    ),

    // ── Main App Shell ──
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const StaffDashboardScreen(),
    ),
    GoRoute(
      path: '/clock-in',
      builder: (context, state) => const ClockInScreen(),
    ),
    GoRoute(
      path: '/tables',
      builder: (context, state) => const TableSessionScreen(),
    ),
    GoRoute(
      path: '/menu',
      builder: (context, state) => const MenuAvailabilityScreen(),
    ),
    GoRoute(
      path: '/activity',
      builder: (context, state) => const ActivityFeedScreen(),
    ),

    // ── Error States ──
    GoRoute(
      path: '/unauthorized',
      builder: (context, state) => const Scaffold(
        body: CcEmptyState(
          icon: Icons.gpp_bad,
          title: 'Access Unauthorized',
          description: 'You do not have staff credentials for this app.',
        ),
      ),
    ),
  ],
);
