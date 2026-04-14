import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/core/ui_utils.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/models/records.dart';
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
            dividerColor: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
          ),
          const Expanded(
            child: TabBarView(
              children: [
                _DescuentosTab(),
                _ThemeTab(),
                _AccountsTab(),
              ],
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
        Text(
          'Descuentos por defecto',
          style: Theme.of(context).textTheme.titleLarge,
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
                decoration: const InputDecoration(labelText: 'Descuento agua'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) => v == null || double.tryParse(v.replaceAll(',', '.')) == null ? 'Número inválido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _elec,
                decoration: const InputDecoration(labelText: 'Descuento electricidad'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) => v == null || double.tryParse(v.replaceAll(',', '.')) == null ? 'Número inválido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _net,
                decoration: const InputDecoration(labelText: 'Descuento internet'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) => v == null || double.tryParse(v.replaceAll(',', '.')) == null ? 'Número inválido' : null,
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  final v = FixedValues(
                    waterDiscount: double.parse(_water.text.replaceAll(',', '.')),
                    electricityDiscount: double.parse(_elec.text.replaceAll(',', '.')),
                    internetDiscount: double.parse(_net.text.replaceAll(',', '.')),
                  );
                  await context.read<AppDataCubit>().saveFixedValues(v);
                  if (context.mounted) {
                    UiUtils.showTopSnackBar(context, 'Ajustes de descuento guardados');
                  }
                },
                icon: const Icon(Icons.save),
                label: const Text('Guardar Descuentos'),
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
             Text(
              'Tema de la Aplicación',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Personaliza cómo luce la vista de la interfaz.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 24),
            RadioListTile<ThemeMode>(
              title: const Text('Preferencia del Sistema'),
              subtitle: const Text('Sigue automáticamente la configuración de tu sistema operativo.'),
              value: ThemeMode.system,
              groupValue: mode,
              onChanged: (v) => context.read<ThemeCubit>().setTheme(v!),
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Modo Claro'),
              value: ThemeMode.light,
              groupValue: mode,
              onChanged: (v) => context.read<ThemeCubit>().setTheme(v!),
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Modo Oscuro'),
              value: ThemeMode.dark,
              groupValue: mode,
              onChanged: (v) => context.read<ThemeCubit>().setTheme(v!),
            ),
          ],
        );
      },
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
            _loading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() => _loading = false);
          UiUtils.showTopSnackBar(context, 'No se pudieron cargar los perfiles. Revisa permisos DB.', isError: true);
        }
      }
    } else {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateProfile(String id, String field, String value) async {
    try {
      await _client.from('profiles').update({field: value}).eq('id', id);
      UiUtils.showTopSnackBar(context, 'Perfil actualizado correctamente.');
      _loadProfiles();
    } catch (e) {
      UiUtils.showTopSnackBar(context, 'Error al actualizar perfil.', isError: true);
    }
  }

  Future<void> _deleteProfile(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('¿Eliminar perfil?'),
        content: const Text('Esto quitará el acceso de la aplicación a esta persona y borrará su registro público permanentemente.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.error),
            onPressed: () => Navigator.pop(c, true),
             child: const Text('Eliminar')
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      if (mounted) setState(() => _loading = true);
      await _client.from('profiles').delete().eq('id', id);
      if (mounted) UiUtils.showTopSnackBar(context, 'Perfil eliminado con éxito.');
      _loadProfiles();
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        UiUtils.showTopSnackBar(context, 'Error al purgar cuenta: $e', isError: true);
      }
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
                  color: Theme.of(context).colorScheme.tertiaryContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(8)
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline, color: Theme.of(context).colorScheme.tertiary, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Si la confirmación de correo está activada en Supabase, el usuario deberá revisar su bandeja de entrada antes de poder entrar.',
                        style: TextStyle(color: Theme.of(context).colorScheme.onTertiaryContainer, fontSize: 13),
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
                validator: (v) => v!.isEmpty || !v.contains('@') ? 'Correo no válido' : null,
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
                value: role,
                decoration: const InputDecoration(labelText: 'Rol Inicial'),
                items: const [
                  DropdownMenuItem(value: 'Administrador', child: Text('Administrador')),
                  DropdownMenuItem(value: 'Edición', child: Text('Edición')),
                  DropdownMenuItem(value: 'Visualización', child: Text('Visualización')),
                ],
                onChanged: (v) { if (v != null) role = v; },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c), child: const Text('Cancelar')),
          FilledButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              Navigator.pop(c);
              try {
                if (mounted) setState(() => _loading = true);
                final res = await _client.auth.signUp(
                  email: email.text.trim(), 
                  password: password.text,
                  data: {
                    'role': role,
                    'full_name': fullName.text.trim(),
                  },
                );

                if (mounted) {
                  if (res.session == null) {
                    UiUtils.showTopSnackBar(
                      context, 
                      'Usuario registrado. Debe confirmar su correo para activar la cuenta.',
                    );
                  } else {
                    UiUtils.showTopSnackBar(context, 'Usuario registrado con éxito.');
                  }
                  _loadProfiles();
                }
              } catch (e) {
                if (mounted) {
                  UiUtils.showTopSnackBar(context, 'Fallo al registrar: $e', isError: true);
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
          color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_circle, size: 32),
                    const SizedBox(width: 12),
                    Text('Mi Cuenta', style: Theme.of(context).textTheme.titleLarge),
                  ],
                ),
                const SizedBox(height: 16),
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
                  onPressed: () async {
                    try {
                      setState(() => _loading = true);
                      await _client.from('profiles').update({
                        'display_name': _displayNameController.text.trim()
                      }).eq('id', user.id);
                      if (mounted) {
                        UiUtils.showTopSnackBar(context, 'Nombre actualizado con éxito.');
                      }
                    } catch (e) {
                      if (mounted) {
                        UiUtils.showTopSnackBar(context, 'Error al actualizar nombre.', isError: true);
                      }
                    } finally {
                      if (mounted) setState(() => _loading = false);
                    }
                  },
                  icon: const Icon(Icons.check),
                  label: const Text('Guardar Nombre'),
                ),
                const SizedBox(height: 24),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(user.email, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Rol de sistema: ${user.role.name.toUpperCase()}'),
                ),
                Text(
                  'ID: ${user.id}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.outline),
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
              Text('Gestión de Perfiles', style: Theme.of(context).textTheme.titleLarge),
              FilledButton.icon(
                onPressed: _showRegisterDialog,
                icon: const Icon(Icons.person_add),
                label: const Text('Añadir'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Como rol con permisos de edición, puedes crear nuevas cuentas, asignar roles y eliminar usuarios del sistema.',
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
              side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
            ),
            child: Column(
              children: _profiles.map((p) {
                final pId = p['id'] as String;
                final pEmail = p['email'] as String? ?? 'Sin email';
                final pRole = p['role'] as String? ?? 'Visualización';
                final pStatus = p['status'] as String? ?? 'Activo';

                // Skip showing the current admin as modifiable? No, they can modify themselves if they want, but could lock themselves out. We will show all.

                return ExpansionTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                    child: Text(pEmail[0].toUpperCase(), style: TextStyle(color: Theme.of(context).colorScheme.primary)),
                  ),
                  title: Text(pEmail, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('$pRole • $pStatus'),
                  children: [
                    Container(
                      color: Theme.of(context).colorScheme.surfaceContainerLowest,
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: pRole,
                              decoration: const InputDecoration(labelText: 'Rol del usuario'),
                              items: const [
                                DropdownMenuItem(value: 'Administrador', child: Text('Administrador')),
                                DropdownMenuItem(value: 'Edición', child: Text('Edición')),
                                DropdownMenuItem(value: 'Visualización', child: Text('Visualización')),
                              ],
                              onChanged: (v) {
                                if (v != null && v != pRole) _updateProfile(pId, 'role', v);
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: pStatus,
                              decoration: const InputDecoration(labelText: 'Estado activo'),
                              items: const [
                                DropdownMenuItem(value: 'Activo', child: Text('Activo')),
                                DropdownMenuItem(value: 'Inactivo', child: Text('Inactivo')),
                              ],
                              onChanged: (v) {
                                if (v != null && v != pStatus) _updateProfile(pId, 'status', v);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (user.id != pId)
                            IconButton(
                              tooltip: 'Eliminar esta cuenta',
                              color: Theme.of(context).colorScheme.error,
                              icon: const Icon(Icons.delete_forever),
                              onPressed: () => _deleteProfile(pId),
                            ),
                        ],
                      ),
                    )
                  ],
                );
              }).toList(),
            ),
          )
        ],
      ],
    );
  }
}
