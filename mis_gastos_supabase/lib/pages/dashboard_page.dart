import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late int _year;

  @override
  void initState() {
    super.initState();
    _year = DateTime.now().year;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AppDataCubit, AppDataState>(
      builder: (context, state) {
        if (state.loading && state.water.isEmpty && state.electricity.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final w = state.water.where((r) => r.year == _year);
        final e = state.electricity.where((r) => r.year == _year);
        final i = state.internet.where((r) => r.year == _year);

        double sumWater = w.fold(0.0, (a, r) => a + r.totalToPay);
        double sumElec = e.fold(0.0, (a, r) => a + r.totalToPay);
        double sumNet = i.fold(0.0, (a, r) => a + r.totalToPay);
        final total = sumWater + sumElec + sumNet;

        final years = <int>{_year, DateTime.now().year};
        for (final r in state.water) {
          years.add(r.year);
        }
        for (final r in state.electricity) {
          years.add(r.year);
        }
        for (final r in state.internet) {
          years.add(r.year);
        }
        final yearList = years.toList()..sort((a, b) => b.compareTo(a));

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                const Text('Año: '),
                DropdownButton<int>(
                  value: _year,
                  items: yearList
                      .map((y) => DropdownMenuItem(value: y, child: Text('$y')))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _year = v);
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            _StatCard(
              title: 'Agua',
              value: formatMoney(sumWater),
              color: Colors.lightBlue,
            ),
            _StatCard(
              title: 'Electricidad',
              value: formatMoney(sumElec),
              color: Colors.amber.shade700,
            ),
            _StatCard(
              title: 'Internet',
              value: formatMoney(sumNet),
              color: Colors.teal,
            ),
            Card(
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total servicios',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      formatMoney(total),
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Usa la barra inferior para registrar consumos o ver el historial.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.outline,
                  ),
            ),
          ],
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.title,
    required this.value,
    required this.color,
  });

  final String title;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withValues(alpha: 0.2), child: Icon(Icons.circle, color: color, size: 16)),
        title: Text(title),
        trailing: Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
    );
  }
}
