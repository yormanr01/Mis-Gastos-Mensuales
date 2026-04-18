import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/core/ui_utils.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_event.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/repositories/auth_repository_supabase.dart';
import 'package:mis_gastos_supabase/theme/theme_cubit.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AjustesPage extends StatelessWidget {
  const AjustesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          TabBar(
            tabs: const [
              Tab(text: 'Descuentos', icon: Icon(Icons.percent)),
              Tab(text: 'Diseño', icon: Icon(Icons.palette)),
              Tab(text: 'Cuentas', icon: Icon(Icons.manage_accounts)),
            ],
            dividerColor: Theme.of(
              context,
            ).colorScheme.outlineVariant.withValues(alpha: 0.5),
          ),
          const Expanded(
            child: TabBarView(
              children: [_DescuentosTab(), _ThemeTab(), _AccountsTab()],
            ),
          ),
        ],
      ),
    );
  }
}

class _DescuentosTab extends StatefulWidget {
  const _DescuentosTab();
  @override
  State<_DescuentosTab> createState() => _DescuentosTabState();
}

class _DescuentosTabState extends State<_DescuentosTab> {
  final _water = TextEditingController();
  final _elec = TextEditingController();
  final _net = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  var _seeded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_seeded) return;
    _seeded = true;
    final s = context.read<AppDataCubit>().state.fixedValues;
    _water.text = '${s.waterDiscount}';
    _elec.text = '${s.electricityDiscount}';
    _net.text = '${s.internetDiscount}';
  }

  @override
  void dispose() {
    _water.dispose();
    _elec.dispose();
    _net.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Row(
          children: [
            Icon(
              Icons.savings_outlined,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 12),
            Text(
              'Descuentos por defecto',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Configura montos base a descontar automáticamente al añadir nuevos registros.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _water,
                decoration: const InputDecoration(
                  labelText: 'Descuento Agua (\$)',
                  prefixIcon: Icon(Icons.water_drop_outlined),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _elec,
                decoration: const InputDecoration(
                  labelText: 'Descuento Electricidad (\$)',
                  prefixIcon: Icon(Icons.bolt),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _net,
                decoration: const InputDecoration(
                  labelText: 'Descuento Internet (\$)',
                  prefixIcon: Icon(Icons.lan_outlined),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: () {
                  final water = double.tryParse(_water.text) ?? 0.0;
                  final elec = double.tryParse(_elec.text) ?? 0.0;
                  final net = double.tryParse(_net.text) ?? 0.0;
                  context.read<AppDataCubit>().saveFixedValues(
                    FixedValues(
                      waterDiscount: water,
                      electricityDiscount: elec,
                      internetDiscount: net,
                    ),
                  );
                  UiUtils.showTopSnackBar(
                    context,
                    'Descuentos actualizados localmente.',
                  );
                },
                icon: const Icon(Icons.save),
                label: const Text('Guardar Configuración'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ThemeTab extends StatelessWidget {
  const _ThemeTab();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeMode>(
      builder: (context, mode) {
        return ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Row(
              children: [
                Icon(
                  Icons.palette_outlined,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Text(
                  'Tema de la Aplicación',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Personaliza cómo luce la vista de la interfaz.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _ThemeModeButton(
                  icon: Icons.brightness_auto,
                  label: 'Auto',
                  selected: mode == ThemeMode.system,
                  onTap: () =>
                      context.read<ThemeCubit>().setTheme(ThemeMode.system),
                ),
                const SizedBox(height: 12),
                _ThemeModeButton(
                  icon: Icons.light_mode,
                  label: 'Claro',
                  selected: mode == ThemeMode.light,
                  onTap: () =>
                      context.read<ThemeCubit>().setTheme(ThemeMode.light),
                ),
                const SizedBox(height: 12),
                _ThemeModeButton(
                  icon: Icons.dark_mode,
                  label: 'Oscuro',
                  selected: mode == ThemeMode.dark,
                  onTap: () =>
                      context.read<ThemeCubit>().setTheme(ThemeMode.dark),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

class _ThemeModeButton extends StatelessWidget {
  const _ThemeModeButton({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final style = selected
        ? FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          )
        : OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          );

    return SizedBox(
      width: double.infinity,
      child: selected
          ? FilledButton.icon(
              style: style,
              onPressed: onTap,
              icon: Icon(icon),
              label: Text(label),
            )
          : OutlinedButton.icon(
              style: style,
              onPressed: onTap,
              icon: Icon(icon),
              label: Text(label),
            ),
    );
  }
}

class _AccountsTab extends StatefulWidget {
  const _AccountsTab();
  @override
  State<_AccountsTab> createState() => _AccountsTabState();
}

class _AccountsTabState extends State<_AccountsTab> {
  final _client = Supabase.instance.client;
  final _displayNameController = TextEditingController();
  final Map<String, TextEditingController> _profileNameControllers = {};
  List<Map<String, dynamic>> _profiles = [];
  bool _loading = true;
  bool _seeded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_seeded) return;
    final auth = context.read<AuthBloc>().state;
    if (auth is AuthAuthenticated) {
      _displayNameController.text = auth.user.displayName ?? '';
      _seeded = true;
    }
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    for (final c in _profileNameControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    final auth = context.read<AuthBloc>().state;
    if (auth is AuthAuthenticated && auth.user.role == UserRole.administrador) {
      try {
        final res = await _client.from('profiles').select().order('email');
        if (mounted) {
          setState(() {
            _profiles = List<Map<String, dynamic>>.from(res as List);
            for (final p in _profiles) {
              final id = p['id'] as String;
              final name = p['display_name'] as String? ?? '';
              if (!_profileNameControllers.containsKey(id)) {
                _profileNameControllers[id] = TextEditingController(text: name);
              } else {
                if (_profileNameControllers[id]!.text != name) {
                  _profileNameControllers[id]!.text = name;
                }
              }
            }
            _loading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() => _loading = false);
          UiUtils.showTopSnackBar(
            context,
            'No se pudieron cargar los perfiles. Revisa permisos DB.',
            isError: true,
          );
        }
      }
    } else {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateProfile(String id, String field, String value) async {
    final auth = context.read<AuthBloc>().state;
    final currentUserId = auth is AuthAuthenticated ? auth.user.id : null;

    try {
      if (mounted) setState(() => _loading = true);

      await _client.from('profiles').update({field: value}).eq('id', id);

      if (id == currentUserId && mounted) {
        context.read<AuthBloc>().add(const AuthProfileRefreshRequested());
      }

      if (mounted) {
        UiUtils.showTopSnackBar(context, 'Cambios guardados correctamente.');
      }
      await _loadProfiles();
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        UiUtils.showTopSnackBar(
          context,
          'Fallo al actualizar perfil: $e',
          isError: true,
        );
      }
    }
  }

  Future<void> _resetUserPassword(String email) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Restablecer contraseña'),
        content: Text(
          'Se enviará un correo a $email con las instrucciones para crear una nueva contraseña.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Enviar correo'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      if (mounted) setState(() => _loading = true);
      await _client.auth.resetPasswordForEmail(
        email,
        redirectTo: 'https://misgastosmensuales.vercel.app',
      );
      if (mounted) {
        UiUtils.showTopSnackBar(
          context,
          'Correo de restablecimiento enviado con éxito.',
        );
      }
    } catch (e) {
      if (mounted) {
        String message = 'Error al solicitar restablecimiento: $e';
        if (e.toString().contains('email rate limit exceeded')) {
          message =
              'Límite de envíos alcanzado. Por favor, espera un minuto antes de intentar de nuevo.';
        }
        UiUtils.showTopSnackBar(context, message, isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
        _loadProfiles();
      }
    }
  }

  Future<void> _deleteProfile(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('¿Eliminar perfil?'),
        content: const Text(
          'Esto quitará el acceso de la aplicación a esta persona y borrará su registro público permanentemente.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      if (mounted) setState(() => _loading = true);
      await context.read<AuthRepositorySupabase>().adminDeleteUser(id);
      if (mounted) {
        UiUtils.showTopSnackBar(context, 'Cuenta eliminada permanentemente.');
      }
      await _loadProfiles();
    } catch (e) {
      if (mounted) {
        UiUtils.showTopSnackBar(
          context,
          'Error al purgar cuenta: $e',
          isError: true,
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showChangeUserPasswordDialog(String id, String email) async {
    final password = TextEditingController();
    final confirm = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Cambiar contraseña'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Introduce una nueva contraseña para $email.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Nueva contraseña',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Requerido';
                  if (v.length < 6) return 'Mínimo 6 caracteres';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: confirm,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Confirmar contraseña',
                  prefixIcon: Icon(Icons.lock_reset),
                ),
                validator: (v) {
                  if (v != password.text) return 'No coinciden';
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState!.validate()) {
                Navigator.pop(c, true);
              }
            },
            child: const Text('Cambiar'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      password.dispose();
      confirm.dispose();
      return;
    }

    try {
      if (mounted) setState(() => _loading = true);
      await context.read<AuthRepositorySupabase>().adminUpdateUserPassword(
        id,
        password.text,
      );
      if (mounted) {
        UiUtils.showTopSnackBar(
          context,
          'Contraseña actualizada correctamente.',
        );
      }
      await _loadProfiles();
    } catch (e) {
      if (mounted) {
        UiUtils.showTopSnackBar(
          context,
          'Error al cambiar contraseña: $e',
          isError: true,
        );
      }
    } finally {
      password.dispose();
      confirm.dispose();
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _showRegisterDialog() async {
    final email = TextEditingController();
    final password = TextEditingController();
    final fullName = TextEditingController();
    var role = 'Visualización';
    var formKey = GlobalKey<FormState>();

    await showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Registrar Nuevo Usuario'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(
                    context,
                  ).colorScheme.tertiaryContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Theme.of(context).colorScheme.tertiary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Si la confirmación de correo está activada en Supabase, el usuario deberá revisar su bandeja de entrada antes de poder entrar.',
                        style: TextStyle(
                          color: Theme.of(
                            context,
                          ).colorScheme.onTertiaryContainer,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: fullName,
                decoration: const InputDecoration(
                  labelText: 'Nombre Completo',
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                validator: (v) => v!.isEmpty ? 'Ingresa un nombre' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: email,
                decoration: const InputDecoration(
                  labelText: 'Correo electrónico',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                validator: (v) =>
                    v!.isEmpty || !v.contains('@') ? 'Correo no válido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Contraseña temporal',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
                validator: (v) => v!.length < 6 ? 'Mínimo 6 caracteres' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: role,
                decoration: const InputDecoration(labelText: 'Rol Inicial'),
                items: const [
                  DropdownMenuItem(
                    value: 'Administrador',
                    child: Text('Administrador'),
                  ),
                  DropdownMenuItem(value: 'Edición', child: Text('Edición')),
                  DropdownMenuItem(
                    value: 'Visualización',
                    child: Text('Visualización'),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) role = v;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(c);
              try {
                if (mounted) setState(() => _loading = true);
                final res = await _client.auth.signUp(
                  email: email.text.trim(),
                  password: password.text,
                  data: {'role': role, 'full_name': fullName.text.trim()},
                );

                if (mounted) {
                  if (res.session == null) {
                    UiUtils.showTopSnackBar(
                      context,
                      'Usuario registrado. Debe confirmar su correo para activar la cuenta.',
                    );
                  } else {
                    UiUtils.showTopSnackBar(
                      context,
                      'Usuario registrado con éxito.',
                    );
                  }
                  _loadProfiles();
                }
              } catch (e) {
                if (mounted) {
                  UiUtils.showTopSnackBar(
                    context,
                    'Fallo al registrar: $e',
                    isError: true,
                  );
                }
              } finally {
                if (mounted) setState(() => _loading = false);
              }
            },
            child: const Text('Crear y Salir'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthBloc>().state;
    if (auth is! AuthAuthenticated) return const SizedBox.shrink();

    final user = auth.user;
    final isAdmin = user.role == UserRole.administrador;

    if (_loading) return const Center(child: CircularProgressIndicator());

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Card(
          elevation: 0,
          color: Theme.of(
            context,
          ).colorScheme.primaryContainer.withValues(alpha: 0.3),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_circle, size: 32),
                    const SizedBox(width: 12),
                    Text(
                      'Mi Cuenta',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _displayNameController,
                  decoration: const InputDecoration(
                    labelText: 'Nombre para mostrar',
                    prefixIcon: Icon(Icons.person_outline),
                    hintText: 'Ej. Juan Pérez',
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => _updateProfile(
                    user.id,
                    'display_name',
                    _displayNameController.text.trim(),
                  ),
                  icon: const Icon(Icons.check),
                  label: const Text('Guardar Nombre'),
                ),
                const SizedBox(height: 24),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    user.email,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    'Rol de sistema: ${user.role.name.toUpperCase()}',
                  ),
                ),
                Text(
                  'ID: ${user.id}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: () => GoRouter.of(context).push('/reset-password'),
                  icon: const Icon(Icons.password),
                  label: const Text('Cambiar Contraseña'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
        if (isAdmin) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.group_outlined,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Gestión de Perfiles',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              FilledButton.icon(
                onPressed: _showRegisterDialog,
                icon: const Icon(Icons.person_add),
                label: const Text('Añadir'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Como rol con permisos de Administrador, puedes crear nuevas cuentas, asignar roles, modificar nombres y eliminar usuarios del sistema.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 24),
          Card(
            clipBehavior: Clip.antiAlias,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: Column(
              children: _profiles.map((p) {
                final pId = p['id'] as String;
                final pEmail = p['email'] as String? ?? 'Sin email';
                final pName = p['display_name'] as String? ?? '';
                final pRole = p['role'] as String? ?? 'Visualización';
                final pStatus = p['status'] as String? ?? 'Activo';

                return ExpansionTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(
                      context,
                    ).colorScheme.surfaceContainerHighest,
                    child: Text(
                      (pName.isNotEmpty ? pName[0] : pEmail[0]).toUpperCase(),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                  title: Text(
                    pName.isNotEmpty ? pName : pEmail,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    pName.isNotEmpty ? '$pEmail • $pRole' : '$pRole • $pStatus',
                  ),
                  children: [
                    Container(
                      color: Theme.of(
                        context,
                      ).colorScheme.surfaceContainerLowest,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _profileNameControllers[pId],
                                  decoration: const InputDecoration(
                                    labelText: 'Nombre Completo',
                                    prefixIcon: Icon(Icons.badge_outlined),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton.filledTonal(
                                tooltip: 'Guardar nombre',
                                onPressed: () {
                                  final newName =
                                      _profileNameControllers[pId]?.text
                                          .trim() ??
                                      '';
                                  _updateProfile(pId, 'display_name', newName);
                                },
                                icon: const Icon(Icons.save_outlined),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  initialValue: pRole,
                                  decoration: const InputDecoration(
                                    labelText: 'Rol del usuario',
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'Administrador',
                                      child: Text('Administrador'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'Edición',
                                      child: Text('Edición'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'Visualización',
                                      child: Text('Visualización'),
                                    ),
                                  ],
                                  onChanged: (v) {
                                    if (v != null && v != pRole) {
                                      _updateProfile(pId, 'role', v);
                                    }
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: DropdownButtonFormField<String>(
                                  initialValue: pStatus,
                                  decoration: const InputDecoration(
                                    labelText: 'Estado activo',
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'Activo',
                                      child: Text('Activo'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'Inactivo',
                                      child: Text('Inactivo'),
                                    ),
                                  ],
                                  onChanged: (v) {
                                    if (v != null && v != pStatus) {
                                      _updateProfile(pId, 'status', v);
                                    }
                                  },
                                ),
                              ),
                              IconButton(
                                tooltip: 'Cambiar contraseña',
                                color: Theme.of(context).colorScheme.primary,
                                icon: const Icon(Icons.key),
                                onPressed: () =>
                                    _showChangeUserPasswordDialog(pId, pEmail),
                              ),
                              IconButton(
                                tooltip: 'Enviar correo restablecimiento',
                                color: Theme.of(context).colorScheme.tertiary,
                                icon: const Icon(Icons.lock_reset),
                                onPressed: () => _resetUserPassword(pEmail),
                              ),
                              if (user.id != pId) ...[
                                IconButton(
                                  tooltip: 'Eliminar esta cuenta',
                                  color: Theme.of(context).colorScheme.error,
                                  icon: const Icon(Icons.delete_forever),
                                  onPressed: () => _deleteProfile(pId),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ],
    );
  }
}
