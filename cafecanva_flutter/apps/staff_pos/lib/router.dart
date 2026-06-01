import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/screens.dart';

final GoRouter staffPosRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
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
);
