import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/core/go_router_refresh_stream.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/pages/home_page.dart';
import 'package:mis_gastos_supabase/pages/login_page.dart';

GoRouter createAppRouter(
  AuthBloc authBloc,
  GoRouterRefreshStream refresh,
) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (BuildContext context, GoRouterState state) {
      final loc = state.matchedLocation;
      final s = authBloc.state;

      if (s is AuthInitial) return null;

      if (s is AuthAuthenticated) {
        if (loc == '/login') return '/';
        return null;
      }

      if (s is AuthLoginInProgress) {
        if (loc != '/login') return '/login';
        return null;
      }

      if (s is AuthUnauthenticated) {
        if (loc != '/login') return '/login';
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
    ],
  );
}
