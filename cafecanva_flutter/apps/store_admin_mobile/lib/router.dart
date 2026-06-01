import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/screens.dart';

final GoRouter storeAdminMobileRouter = GoRouter(
  initialLocation: '/',
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
  ],
);
