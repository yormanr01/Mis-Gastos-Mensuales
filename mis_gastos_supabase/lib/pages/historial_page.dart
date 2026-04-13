import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/domain.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';

class HistorialPage extends StatefulWidget {
  const HistorialPage({super.key});

  @override
  State<HistorialPage> createState() => _HistorialPageState();
}

class _HistorialPageState extends State<HistorialPage> {
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AppDataCubit, AppDataState>(
      builder: (context, state) {
        final combined = _combine(state);
        final keys = combined.keys.toList()
          ..sort((a, b) {
            final pa = a.split('|');
            final pb = b.split('|');
            final ya = int.parse(pa[1]);
            final yb = int.parse(pb[1]);
            if (ya != yb) return yb.compareTo(ya);
            return months.indexOf(pb[0]).compareTo(months.indexOf(pa[0]));
          });

        final q = _search.text.trim().toLowerCase();
        final filtered = q.isEmpty
            ? keys
            : keys.where((k) {
                final p = k.split('|');
                return p[0].toLowerCase().contains(q) || p[1].contains(q);
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
              child: filtered.isEmpty
                  ? const Center(
                      child: Text(
                        'Añade registros en Agua, Electricidad e Internet.',
                        textAlign: TextAlign.center,
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, i) {
                        final key = filtered[i];
                        final row = combined[key]!;
                        final parts = key.split('|');
                        final month = parts[0];
                        final year = parts[1];
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '$month $year',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    Text(
                                      formatMoney(row.total),
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .primary,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ],
                                ),
                                const Divider(),
                                _rowLine(
                                  context,
                                  'Agua',
                                  row.water,
                                ),
                                _rowLine(
                                  context,
                                  'Electricidad',
                                  row.electricity,
                                ),
                                _rowLine(
                                  context,
                                  'Internet',
                                  row.internet,
                                ),
                              ],
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

  Widget _rowLine(BuildContext context, String label, double? v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          Text(
            formatMoney(v ?? 0),
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Map<String, _Row> _combine(AppDataState state) {
    final map = <String, _Row>{};
    void add(String month, int year, String kind, double amount) {
      final key = '$month|$year';
      map[key] = map[key] ?? _Row();
      final r = map[key]!;
      if (kind == 'w') {
        r.water = amount;
      } else if (kind == 'e') {
        r.electricity = amount;
      } else if (kind == 'i') {
        r.internet = amount;
      }
      r.total = (r.water ?? 0) + (r.electricity ?? 0) + (r.internet ?? 0);
    }

    for (final x in state.water) {
      add(x.month, x.year, 'w', x.totalToPay);
    }
    for (final x in state.electricity) {
      add(x.month, x.year, 'e', x.totalToPay);
    }
    for (final x in state.internet) {
      add(x.month, x.year, 'i', x.totalToPay);
    }
    return map;
  }
}

class _Row {
  double? water;
  double? electricity;
  double? internet;
  double total = 0;
}
