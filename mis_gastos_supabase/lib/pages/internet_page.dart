import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/auth/auth_extensions.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';
import 'package:mis_gastos_supabase/widgets/service_form_dialogs.dart';

class InternetPage extends StatefulWidget {
  const InternetPage({super.key});

  @override
  State<InternetPage> createState() => _InternetPageState();
}

class _InternetPageState extends State<InternetPage> {
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
            ? state.internet
            : state.internet.where((r) {
                return r.month.toLowerCase().contains(q) ||
                    r.year.toString().contains(q);
              }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: TextField(
                controller: _search,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Buscar por mes o año',
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20),
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
                    )                    : ListView.separated(
                      padding: const EdgeInsets.all(24),
                      itemCount: list.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (context, i) {
                        final r = list[i];
                        return Card(
                          elevation: 0,
                          color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(20),
                            onTap: () async {
                              await showInternetFormDialog(
                                context,
                                fixed: state.fixedValues,
                                existing: r,
                                isReadOnly: !edit,
                                onSubmit: (draft) {
                                  context.read<AppDataCubit>().updateInternet(draft);
                                },
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                              child: ListTile(
                                leading: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.teal.withValues(alpha: 0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.wifi, color: Colors.teal),
                                ),
                                title: Text(
                                  '${r.month} ${r.year}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Text(
                                  'Mensual ${formatMoney(r.monthlyCost)} · Total ${formatMoney(r.totalToPay)}',
                                  style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                                ),
                                trailing: edit
                                    ? Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            tooltip: 'Cambiar estado',
                                            icon: Icon(
                                              r.status == 'Pagado' ? Icons.check_circle : Icons.pending_actions,
                                              color: r.status == 'Pagado' ? Colors.green : Colors.orange,
                                            ),
                                            onPressed: () {
                                              final newStatus = r.status == 'Pagado' ? 'Pendiente' : 'Pagado';
                                              context.read<AppDataCubit>().updateInternet(
                                                InternetRecord(
                                                  id: r.id,
                                                  year: r.year,
                                                  month: r.month,
                                                  monthlyCost: r.monthlyCost,
                                                  discount: r.discount,
                                                  totalToPay: r.totalToPay,
                                                  status: newStatus,
                                                ),
                                              );
                                            },
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline),
                                            color: Theme.of(context).colorScheme.error,
                                            onPressed: () async {
                                              final ok = await showDialog<bool>(
                                                context: context,
                                                builder: (ctx) => AlertDialog(
                                                  title: const Text('Eliminar'),
                                                  content: const Text(
                                                    '¿Eliminar este registro de internet?',
                                                  ),
                                                  actions: [
                                                    TextButton(
                                                      onPressed: () =>
                                                          Navigator.pop(ctx, false),
                                                      child: const Text('No'),
                                                    ),
                                                    FilledButton(
                                                      style: FilledButton.styleFrom(
                                                        backgroundColor: Theme.of(context).colorScheme.error,
                                                      ),
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
                                                    .deleteInternet(r.id);
                                              }
                                            },
                                          ),
                                          const Icon(Icons.chevron_right),
                                        ],
                                      )
                                    : const Icon(Icons.chevron_right),
                              ),
                            ),
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
