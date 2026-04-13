import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/app_router.dart';
import 'package:mis_gastos_supabase/core/go_router_refresh_stream.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/repositories/records_repository.dart';
import 'package:mis_gastos_supabase/theme/app_theme.dart';

class MisGastosApp extends StatefulWidget {
  const MisGastosApp({
    super.key,
    required this.authBloc,
  });

  final AuthBloc authBloc;

  @override
  State<MisGastosApp> createState() => _MisGastosAppState();
}

class _MisGastosAppState extends State<MisGastosApp> {
  late final GoRouterRefreshStream _routerRefresh;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _routerRefresh = GoRouterRefreshStream(widget.authBloc.stream);
    _router = createAppRouter(widget.authBloc, _routerRefresh);
  }

  @override
  void dispose() {
    _routerRefresh.dispose();
    widget.authBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepositoryProvider(
      create: (_) => RecordsRepository(),
      child: BlocProvider(
        create: (context) =>
            AppDataCubit(context.read<RecordsRepository>()),
        child: BlocProvider.value(
          value: widget.authBloc,
          child: BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              final data = context.read<AppDataCubit>();
              if (state is AuthAuthenticated) {
                data.loadAll();
              } else if (state is AuthUnauthenticated) {
                data.clearData();
              }
            },
            child: MaterialApp.router(
              title: 'Mis Gastos Mensuales',
              theme: buildAppTheme(brightness: Brightness.light),
              darkTheme: buildAppTheme(brightness: Brightness.dark),
              themeMode: ThemeMode.system,
              routerConfig: _router,
            ),
          ),
        ),
      ),
    );
  }
}
