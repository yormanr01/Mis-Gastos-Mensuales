import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/core/go_router_refresh_stream.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/layout/main_shell.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/pages/acerca_page.dart';
import 'package:mis_gastos_supabase/pages/agua_page.dart';
import 'package:mis_gastos_supabase/pages/ajustes_page.dart';
import 'package:mis_gastos_supabase/pages/dashboard_page.dart';
import 'package:mis_gastos_supabase/pages/electricidad_page.dart';
import 'package:mis_gastos_supabase/pages/historial_page.dart';
import 'package:mis_gastos_supabase/pages/internet_page.dart';
import 'package:mis_gastos_supabase/pages/login_page.dart';

String? _guardAjustes(BuildContext context, GoRouterState state) {
  final s = context.read<AuthBloc>().state;
  if (s is! AuthAuthenticated || s.user.role != UserRole.edicion) {
    return '/';
  }
  return null;
}

GoRouter createAppRouter(
  AuthBloc authBloc,
  GoRouterRefreshStream refresh,
) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (BuildContext context, GoRouterState state) {
      final loc = state.matchedLocation;
      final authState = authBloc.state;

      if (authState is AuthInitial) return null;

      if (authState is AuthAuthenticated) {
        if (loc == '/login') return '/';
        return null;
      }

      if (authState is AuthLoginInProgress) {
        if (loc != '/login') return '/login';
        return null;
      }

      if (authState is AuthUnauthenticated) {
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
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/agua',
            builder: (context, state) => const AguaPage(),
          ),
          GoRoute(
            path: '/electricidad',
            builder: (context, state) => const ElectricidadPage(),
          ),
          GoRoute(
            path: '/internet',
            builder: (context, state) => const InternetPage(),
          ),
          GoRoute(
            path: '/historial',
            builder: (context, state) => const HistorialPage(),
          ),
          GoRoute(
            path: '/ajustes',
            redirect: _guardAjustes,
            builder: (context, state) => const AjustesPage(),
          ),
          GoRoute(
            path: '/acerca',
            builder: (context, state) => const AcercaPage(),
          ),
        ],
      ),
    ],
  );
}
