import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/auth/auth_extensions.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';
import 'package:mis_gastos_supabase/widgets/service_form_dialogs.dart';

class AguaPage extends StatefulWidget {
  const AguaPage({super.key});

  @override
  State<AguaPage> createState() => _AguaPageState();
}

class _AguaPageState extends State<AguaPage> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final edit = canEditContent(context);

    return BlocBuilder<AppDataCubit, AppDataState>(
      builder: (context, state) {
        final q = _search.text.trim().toLowerCase();
        final list = q.isEmpty
            ? state.water
            : state.water.where((r) {
                return r.month.toLowerCase().contains(q) ||
                    r.year.toString().contains(q);
              }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: TextField(
                controller: _search,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Buscar por mes o año',
                ),
                onChanged: (_) => setState(() {}),
              ),
            ),
            Expanded(
              child: list.isEmpty
                  ? Center(
                      child: Text(
                        state.loading
                            ? 'Cargando...'
                            : 'Sin registros. ${edit ? 'Pulsa + para añadir.' : ''}',
                        textAlign: TextAlign.center,
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: list.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final r = list[i];
                        return Card(
                          child: ListTile(
                            title: Text('${r.month} ${r.year}'),
                            subtitle: Text(
                              'Facturado ${formatMoney(r.totalInvoiced)} · '
                              'Desc ${formatMoney(r.discount)} · '
                              'Total ${formatMoney(r.totalToPay)} · ${r.status}',
                            ),
                            trailing: edit
                                ? Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.edit),
                                        onPressed: () async {
                                          await showWaterFormDialog(
                                            context,
                                            fixed: state.fixedValues,
                                            existing: r,
                                            onSubmit: (draft) {
                                              context
                                                  .read<AppDataCubit>()
                                                  .updateWater(draft);
                                            },
                                          );
                                        },
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline),
                                        onPressed: () async {
                                          final ok = await showDialog<bool>(
                                            context: context,
                                            builder: (ctx) => AlertDialog(
                                              title: const Text('Eliminar'),
                                              content: const Text(
                                                '¿Eliminar este registro de agua?',
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(ctx, false),
                                                  child: const Text('No'),
                                                ),
                                                FilledButton(
                                                  onPressed: () =>
                                                      Navigator.pop(ctx, true),
                                                  child: const Text('Sí'),
                                                ),
                                              ],
                                            ),
                                          );
                                          if (ok == true && context.mounted) {
                                            context
                                                .read<AppDataCubit>()
                                                .deleteWater(r.id);
                                          }
                                        },
                                      ),
                                    ],
                                  )
                                : null,
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }
}
