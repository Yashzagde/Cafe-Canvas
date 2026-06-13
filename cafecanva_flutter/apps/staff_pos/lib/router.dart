import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'features/screens.dart';

final GoRouter staffPosRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) {
      return null; // Let user access login Pad
    }

    final role = AuthService.userRole?.toLowerCase();
    if (role == null) {
      Supabase.instance.client.auth.signOut();
      return '/unauthorized';
    }

    final path = state.matchedLocation;
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
