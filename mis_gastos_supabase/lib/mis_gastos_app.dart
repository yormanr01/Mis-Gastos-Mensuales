import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/app_router.dart';
import 'package:mis_gastos_supabase/core/go_router_refresh_stream.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart' as app_auth;
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/repositories/records_repository.dart';
import 'package:mis_gastos_supabase/theme/app_theme.dart';
import 'package:mis_gastos_supabase/theme/theme_cubit.dart';
import 'package:mis_gastos_supabase/repositories/auth_repository_supabase.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import 'package:toastification/toastification.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

class MisGastosApp extends StatefulWidget {
  const MisGastosApp({
    super.key,
    required this.authRepository,
    required this.authBloc,
  });

  final AuthRepositorySupabase authRepository;
  final AuthBloc authBloc;

  @override
  State<MisGastosApp> createState() => _MisGastosAppState();
}

class _MisGastosAppState extends State<MisGastosApp> {
  late final GoRouterRefreshStream _routerRefresh;
  late final GoRouter _router;
  late final StreamSubscription<sb.AuthState> _authSub;

  @override
  void initState() {
    super.initState();
    _routerRefresh = GoRouterRefreshStream(widget.authBloc.stream);
    _router = createAppRouter(widget.authBloc, _routerRefresh);

    // Escuchar eventos de recuperación de contraseña de Supabase
    _authSub = sb.Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (data.event == sb.AuthChangeEvent.passwordRecovery) {
        _router.go('/reset-password');
      }
    });
  }

  @override
  void dispose() {
    _authSub.cancel();
    _routerRefresh.dispose();
    widget.authBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => RecordsRepository()),
        RepositoryProvider.value(value: widget.authRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AppDataCubit(context.read<RecordsRepository>()),
          ),
          BlocProvider.value(value: widget.authBloc),
          BlocProvider(create: (_) => ThemeCubit()),
        ],
        child: BlocListener<AuthBloc, app_auth.AuthState>(
          listener: (context, state) async {
            final data = context.read<AppDataCubit>();
            if (state is app_auth.AuthAuthenticated) {
              await data.loadAll();
              FlutterNativeSplash.remove();
            } else if (state is app_auth.AuthUnauthenticated) {
              data.clearData();
              FlutterNativeSplash.remove();
            }
          },
          child: BlocBuilder<ThemeCubit, ThemeMode>(
            builder: (context, themeMode) {
              return ToastificationWrapper(
                child: MaterialApp.router(
                  title: 'Mis Gastos Mensuales',
                  theme: buildAppTheme(brightness: Brightness.light),
                  darkTheme: buildAppTheme(brightness: Brightness.dark),
                  themeMode: themeMode,
                  routerConfig: _router,
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
