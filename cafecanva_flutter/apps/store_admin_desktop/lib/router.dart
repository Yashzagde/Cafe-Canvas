import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/screens.dart';

final GoRouter storeAdminDesktopRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const DesktopDashboardScreen(),
    ),
    GoRoute(
      path: '/menu',
      builder: (context, state) => const DesktopMenuEditorScreen(),
    ),
    GoRoute(
      path: '/staff',
      builder: (context, state) => const DesktopStaffManagementScreen(),
    ),
  ],
);
