import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'features/screens.dart';
import 'package:hive/hive.dart';

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

    // If logged in, redirect root or unauthorized to portal choice
    if (path == '/' || path == '/unauthorized') {
      return '/portal-choice';
    }

    // If accessing floor (waiter POS) and no staff ID is selected, redirect to selector
    if (path == '/floor') {
      final selectedStaffId = Hive.box('session').get('selected_staff_id');
      if (selectedStaffId == null) {
        return '/waiter-staff-select';
      }
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/portal-choice',
      builder: (context, state) => const PortalChoiceScreen(),
    ),
    GoRoute(
      path: '/waiter-staff-select',
      builder: (context, state) => const WaiterStaffSelectScreen(),
    ),
    GoRoute(
      path: '/kds',
      builder: (context, state) => const KdsTableWiseScreen(),
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
