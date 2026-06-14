import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';
import 'features/kds_dashboard_screen.dart';

final GoRouter _router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) {
      // In KDS demo/presentation mode we allow bypassing if no session exists, 
      // or we can direct users to the login screen.
      return null; 
    }

    // Strict role-to-app binding
    final role = session.user.appMetadata['role'] as String?;
    if (role != 'kitchen') {
      Supabase.instance.client.auth.signOut();
      return '/unauthorized';
    }
    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const KdsDashboardScreen(locationId: 'demo-branch-7777'),
    ),
    GoRoute(
      path: '/unauthorized',
      builder: (context, state) => const Scaffold(
        body: CcEmptyState(
          icon: Icons.gpp_bad,
          title: 'Access Unauthorized',
          description: 'This device is not authorized to act as a Kitchen Display System.',
        ),
      ),
    ),
  ],
);

class KdsApp extends StatelessWidget {
  const KdsApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CafeCanva KDS',
      debugShowCheckedModeBanner: false,
      theme: buildLightTheme(),
      darkTheme: buildDarkTheme(),
      themeMode: ThemeMode.dark, // Default KDS to high-contrast Dark theme
      routerConfig: _router,
    );
  }
}
