import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'features/screens.dart';

final GoRouter staffPosRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) async {
    final session = Supabase.instance.client.auth.currentSession;
    final path = state.matchedLocation;

    if (session == null) {
      if (path != '/' && path != '/unauthorized') {
        return '/';
      }
      return null; // Let user access login Pad
    }

    // Try loading the profile if it's not cached in memory
    if (AuthService.currentUserProfile == null) {
      try {
        await AuthService.fetchUserProfile(session.user.id);
      } catch (e) {
        debugPrint('Error fetching user profile during redirect: $e');
        // If profile fetch fails (e.g. network/offline) and no profile is loaded,
        // stay on the current route if it's the login/PIN pad or unauthorized screen.
        // Otherwise redirect to login Pad so they can log in offline/online.
        if (path != '/' && path != '/unauthorized') {
          return '/';
        }
        return null;
      }
    }

    final role = AuthService.userRole?.toLowerCase();
    if (role == null) {
      await Supabase.instance.client.auth.signOut();
      return '/unauthorized';
    }

    if (role == 'kitchen') {
      if (path == '/' || path == '/floor' || path == '/unauthorized' || path.startsWith('/order/') || path.startsWith('/settlement/')) {
        return '/active-orders';
      }
    } else if (role == 'waiter') {
      if (path == '/' || path == '/active-orders' || path == '/unauthorized') {
        return '/floor';
      }
    } else {
      if (path == '/' || path == '/unauthorized') {
        return '/floor';
      }
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) => UserActivityWrapper(child: child),
      routes: [
        GoRoute(
          path: '/floor',
          builder: (context, state) => const FloorPlanScreen(),
        ),
        GoRoute(
          path: '/order/:tableId',
          builder: (context, state) => OrderBuilderScreen(
            tableId: state.pathParameters['tableId'] ?? '',
          ),
        ),
        GoRoute(
          path: '/active-orders',
          builder: (context, state) => const ActiveOrdersQueue(),
        ),
        GoRoute(
          path: '/settlement/:tableId',
          builder: (context, state) => BillSettlementScreen(
            tableId: state.pathParameters['tableId'] ?? '',
          ),
        ),
      ],
    ),
    GoRoute(
      path: '/unauthorized',
      builder: (context, state) => const Scaffold(
        body: CcEmptyState(
          icon: Icons.gpp_bad,
          title: 'Access Unauthorized',
          description: 'You do not have required cashier/waiter credentials to open this app.',
        ),
      ),
    ),
  ],
);
