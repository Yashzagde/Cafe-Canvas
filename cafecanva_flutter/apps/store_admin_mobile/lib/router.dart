import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'features/screens.dart';

final GoRouter storeAdminMobileRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) {
      return null; // Let user access login Pad or bypass
    }

    final role = session.user.appMetadata['role'] as String?;
    if (role != 'manager' && role != 'owner') {
      Supabase.instance.client.auth.signOut();
      return '/unauthorized';
    }
    return null;
  },
  routes: [
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
      builder: (context, state) => const Scaffold(
        body: CcEmptyState(
          icon: Icons.gpp_bad,
          title: 'Access Unauthorized',
          description: 'You do not have required manager/owner credentials to open this app.',
        ),
      ),
    ),
  ],
);
