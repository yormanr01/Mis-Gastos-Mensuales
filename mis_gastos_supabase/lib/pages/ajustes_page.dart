import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/models/records.dart';

class AjustesPage extends StatefulWidget {
  const AjustesPage({super.key});

  @override
  State<AjustesPage> createState() => _AjustesPageState();
}

class _AjustesPageState extends State<AjustesPage> {
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
    final auth = context.watch<AuthBloc>().state;
    if (auth is! AuthAuthenticated || auth.user.role != UserRole.edicion) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Descuentos por defecto en formularios nuevos',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 16),
        Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _water,
                decoration: const InputDecoration(
                  labelText: 'Descuento agua',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) =>
                    v == null || double.tryParse(v.replaceAll(',', '.')) == null
                        ? 'Número inválido'
                        : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _elec,
                decoration: const InputDecoration(
                  labelText: 'Descuento electricidad',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) =>
                    v == null || double.tryParse(v.replaceAll(',', '.')) == null
                        ? 'Número inválido'
                        : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _net,
                decoration: const InputDecoration(
                  labelText: 'Descuento internet',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) =>
                    v == null || double.tryParse(v.replaceAll(',', '.')) == null
                        ? 'Número inválido'
                        : null,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  final v = FixedValues(
                    waterDiscount:
                        double.parse(_water.text.replaceAll(',', '.')),
                    electricityDiscount:
                        double.parse(_elec.text.replaceAll(',', '.')),
                    internetDiscount:
                        double.parse(_net.text.replaceAll(',', '.')),
                  );
                  await context.read<AppDataCubit>().saveFixedValues(v);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Ajustes guardados')),
                    );
                    context.pop();
                  }
                },
                child: const Text('Guardar'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
