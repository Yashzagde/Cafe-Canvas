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
      builder: (context, state) {
        final slug = state.pathParameters['slug'] ?? 'default-slug';
        // Extract table prefill query parameters from scanned QR codes
        final tableId = state.uri.queryParameters['table'];
        return StorefrontHomeScreen(
          slug: slug,
          prefilledTableId: tableId,
        );
      },
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
