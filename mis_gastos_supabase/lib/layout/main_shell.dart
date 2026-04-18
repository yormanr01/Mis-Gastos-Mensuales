import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/auth/auth_extensions.dart';
import 'package:mis_gastos_supabase/core/ui_utils.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_event.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/widgets/service_form_dialogs.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});

  final Widget child;

  static const _navPaths = [
    '/',
    '/agua',
    '/electricidad',
    '/internet',
    '/historial',
  ];

  int _indexForPath(String path) {
    final i = _navPaths.indexOf(path);
    return i < 0 ? 0 : i;
  }

  String _pathForIndex(int i) => _navPaths[i];

  String _title(String path) {
    return switch (path) {
      '/' => 'Panel principal',
      '/agua' => 'Agua',
      '/electricidad' => 'Electricidad',
      '/internet' => 'Internet',
      '/historial' => 'Historial consolidado',
      '/ajustes' => 'Ajustes',
      '/acerca' => 'Acerca de',
      _ => 'Mis Gastos',
    };
  }

  Widget? _fab(BuildContext context, String path) {
    if (!canEditContent(context)) return null;
    final cubit = context.read<AppDataCubit>();
    Future<void> openWater() async {
      await showWaterFormDialog(
        context,
        fixed: cubit.state.fixedValues,
        onSubmit: cubit.addWater,
      );
    }

    Future<void> openElec() async {
      await showElectricityFormDialog(
        context,
        fixed: cubit.state.fixedValues,
        allElectric: cubit.state.electricity,
        onSubmit: cubit.addElectricity,
      );
    }

    Future<void> openNet() async {
      await showInternetFormDialog(
        context,
        fixed: cubit.state.fixedValues,
        onSubmit: cubit.addInternet,
      );
    }

    return switch (path) {
      '/agua' => FloatingActionButton(
        onPressed: openWater,
        child: const Icon(Icons.add),
      ),
      '/electricidad' => FloatingActionButton(
        onPressed: openElec,
        child: const Icon(Icons.add),
      ),
      '/internet' => FloatingActionButton(
        onPressed: openNet,
        child: const Icon(Icons.add),
      ),
      _ => null,
    };
  }

  @override
  Widget build(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
    final idx = _indexForPath(path);
    final isDesktop = MediaQuery.sizeOf(context).width >= 600;

    return BlocListener<AppDataCubit, AppDataState>(
      listenWhen: (p, c) =>
          (c.errorMessage != null && c.errorMessage != p.errorMessage) ||
          (c.successMessage != null && c.successMessage != p.successMessage),
      listener: (context, state) {
        if (state.errorMessage != null) {
          UiUtils.showTopSnackBar(context, state.errorMessage!, isError: true);
          context.read<AppDataCubit>().clearError();
        }
        if (state.successMessage != null) {
          final isDelete = state.successMessage!.toLowerCase().contains(
            'eliminado',
          );
          UiUtils.showTopSnackBar(
            context,
            state.successMessage!,
            isDelete: isDelete,
          );
          context.read<AppDataCubit>().clearSuccess();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(_title(path)),
          actions: [
            PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'ajustes':
                    context.push('/ajustes');
                  case 'acerca':
                    context.push('/acerca');
                  case 'logout':
                    context.read<AuthBloc>().add(const AuthLogoutRequested());
                }
              },
              itemBuilder: (context) {
                final user = currentUser(context);
                final items = <PopupMenuEntry<String>>[
                  PopupMenuItem(
                    enabled: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.user.displayName ?? 'Usuario',
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                        Text(
                          user?.user.email ?? '',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  ),
                  const PopupMenuDivider(),
                ];
                if (user?.user.role == UserRole.edicion ||
                    user?.user.role == UserRole.administrador) {
                  items.add(
                    const PopupMenuItem(
                      value: 'ajustes',
                      child: ListTile(
                        leading: Icon(Icons.settings),
                        title: Text('Ajustes'),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  );
                }
                items.addAll([
                  const PopupMenuItem(
                    value: 'acerca',
                    child: ListTile(
                      leading: Icon(Icons.info_outline),
                      title: Text('Acerca de'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                  const PopupMenuDivider(),
                  const PopupMenuItem(
                    value: 'logout',
                    child: ListTile(
                      leading: Icon(Icons.logout),
                      title: Text('Cerrar sesión'),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ]);
                return items;
              },
            ),
          ],
        ),
        body: isDesktop
            ? Row(
                children: [
                  NavigationRail(
                    selectedIndex: idx,
                    onDestinationSelected: (i) {
                      context.go(_pathForIndex(i));
                    },
                    labelType: NavigationRailLabelType.all,
                    destinations: const [
                      NavigationRailDestination(
                        icon: Icon(Icons.dashboard_outlined),
                        selectedIcon: Icon(Icons.dashboard),
                        label: Text('Inicio'),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.water_drop_outlined),
                        selectedIcon: Icon(Icons.water_drop),
                        label: Text('Agua'),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.lightbulb_outline),
                        selectedIcon: Icon(Icons.lightbulb),
                        label: Text('Luz'),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.wifi_outlined),
                        selectedIcon: Icon(Icons.wifi),
                        label: Text('Internet'),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.history),
                        label: Text('Historial'),
                      ),
                    ],
                  ),
                  const VerticalDivider(thickness: 1, width: 1),
                  Expanded(child: child),
                ],
              )
            : child,
        floatingActionButton: _fab(context, path),
        floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        bottomNavigationBar: isDesktop
            ? null
            : NavigationBar(
                selectedIndex: idx,
                onDestinationSelected: (i) {
                  context.go(_pathForIndex(i));
                },
                destinations: const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    selectedIcon: Icon(Icons.dashboard),
                    label: 'Inicio',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.water_drop_outlined),
                    selectedIcon: Icon(Icons.water_drop),
                    label: 'Agua',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.lightbulb_outline),
                    selectedIcon: Icon(Icons.lightbulb),
                    label: 'Luz',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.wifi_outlined),
                    selectedIcon: Icon(Icons.wifi),
                    label: 'Internet',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.history),
                    label: 'Historial',
                  ),
                ],
              ),
      ),
    );
  }
}
