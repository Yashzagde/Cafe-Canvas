import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/screens.dart';

final GoRouter storefrontRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SlugEntryScreen(),
    ),
    GoRoute(
      path: '/:slug',
      builder: (context, state) => StorefrontHomeScreen(
        slug: state.pathParameters['slug'] ?? 'default-slug',
      ),
    ),
    GoRoute(
      path: '/:slug/item/:itemId',
      builder: (context, state) => ItemDetailScreen(
        slug: state.pathParameters['slug'] ?? 'default-slug',
        itemId: state.pathParameters['itemId'] ?? '',
      ),
    ),
    GoRoute(
      path: '/:slug/cart',
      builder: (context, state) => CartScreen(
        slug: state.pathParameters['slug'] ?? 'default-slug',
      ),
    ),
    GoRoute(
      path: '/:slug/track/:orderId',
      builder: (context, state) => TrackScreen(
        slug: state.pathParameters['slug'] ?? 'default-slug',
        orderId: state.pathParameters['orderId'] ?? '',
      ),
    ),
  ],
);
