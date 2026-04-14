import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late int _year;
  bool _showWater = true;
  bool _showElectricity = true;
  bool _showInternet = true;

  @override
  void initState() {
    super.initState();
    _year = DateTime.now().year;
  }

  int _monthToIndex(String month) {
    const m = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return m.indexOf(month);
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

        // Group data points
        final Map<int, double> mapW = {};
        for (final r in w) mapW[_monthToIndex(r.month)] = r.totalToPay;
        
        final Map<int, double> mapE = {};
        for (final r in e) mapE[_monthToIndex(r.month)] = r.totalToPay;

        final Map<int, double> mapI = {};
        for (final r in i) mapI[_monthToIndex(r.month)] = r.totalToPay;

        // Generate spots
        final spotsW = List.generate(12, (index) => FlSpot(index.toDouble(), mapW[index] ?? 0));
        final spotsE = List.generate(12, (index) => FlSpot(index.toDouble(), mapE[index] ?? 0));
        final spotsI = List.generate(12, (index) => FlSpot(index.toDouble(), mapI[index] ?? 0));

        double maxY = 0;
        final listForMaxY = <Map<int, double>>[];
        if (_showWater) listForMaxY.add(mapW);
        if (_showElectricity) listForMaxY.add(mapE);
        if (_showInternet) listForMaxY.add(mapI);
        
        for (final m in listForMaxY) {
          for (final val in m.values) {
            if (val > maxY) maxY = val;
          }
        }
        if (maxY == 0) maxY = 100;
        maxY = maxY * 1.2; // Extra top padding

        return ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, authState) {
                    String title = 'Resumen';
                    if (authState is AuthAuthenticated) {
                      final name = authState.user.displayName;
                      if (name != null && name.isNotEmpty) {
                        title = 'Hola, $name';
                      }
                    }
                    return Text(
                      title,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    );
                  },
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      value: _year,
                      hint: const Text('Año'),
                      icon: const Icon(Icons.calendar_today, size: 16),
                      items: yearList
                          .map((y) => DropdownMenuItem(value: y, child: Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Text('$y', style: const TextStyle(fontWeight: FontWeight.bold)),
                          )))
                          .toList(),
                      onChanged: (v) {
                        if (v != null) setState(() => _year = v);
                      },
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Dashboard Cards
            LayoutBuilder(
              builder: (context, constraints) {
                final double width = constraints.maxWidth;
                final crossAxisCount = width > 800 ? 4 : (width > 600 ? 2 : 1);
                return GridView.count(
                  crossAxisCount: crossAxisCount,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: width > 800 ? 1.5 : 2.5,
                  children: [
                     _StatSummaryCard(
                        title: 'Total Servicios',
                        value: formatMoney(total),
                        icon: Icons.account_balance_wallet,
                        color: Theme.of(context).colorScheme.primary,
                        isTotal: true,
                      ),
                    _StatSummaryCard(
                      title: 'Agua',
                      value: formatMoney(sumWater),
                      icon: Icons.water_drop,
                      color: Colors.lightBlue,
                    ),
                    _StatSummaryCard(
                      title: 'Electricidad',
                      value: formatMoney(sumElec),
                      icon: Icons.lightbulb,
                      color: Colors.amber.shade700,
                    ),
                    _StatSummaryCard(
                      title: 'Internet',
                      value: formatMoney(sumNet),
                      icon: Icons.wifi,
                      color: Colors.teal,
                    ),
                  ],
                );
              }
            ),
            const SizedBox(height: 32),
            Text(
              'Histórico de Consumo $_year',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [
                _LegendItem(
                  color: Colors.lightBlue,
                  label: 'Agua',
                  isVisible: _showWater,
                  onTap: () => setState(() => _showWater = !_showWater),
                ),
                _LegendItem(
                  color: Colors.amber.shade700,
                  label: 'Luz',
                  isVisible: _showElectricity,
                  onTap: () => setState(() => _showElectricity = !_showElectricity),
                ),
                _LegendItem(
                  color: Colors.teal,
                  label: 'Internet',
                  isVisible: _showInternet,
                  onTap: () => setState(() => _showInternet = !_showInternet),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 350,
              child: Card(
                elevation: 0,
                color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.only(right: 32, left: 0, top: 32, bottom: 16),
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (value) {
                          return FlLine(
                            color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
                            strokeWidth: 1,
                            dashArray: [5, 5],
                          );
                        },
                      ),
                      titlesData: FlTitlesData(
                        show: true,
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 30,
                            interval: 1,
                            getTitlesWidget: (value, meta) {
                              const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                              if (value.toInt() >= 0 && value.toInt() < 12) {
                                return SideTitleWidget(
                                  meta: meta,
                                  space: 10,
                                  child: Text(
                                    months[value.toInt()],
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    )
                                  ),
                                );
                              }
                              return const SizedBox.shrink();
                            },
                          ),
                        ),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            interval: maxY / 5,
                            reservedSize: 60,
                            getTitlesWidget: (value, meta) {
                              if (value == maxY) return const SizedBox.shrink();
                              return SideTitleWidget(
                                meta: meta,
                                child: Text(
                                  '\$${value.toInt()}',
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    fontSize: 12,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      minX: 0,
                      maxX: 11,
                      minY: 0,
                      maxY: maxY,
                      lineBarsData: [
                        if (_showWater) _buildLineChartBarData(spotsW, Colors.lightBlue),
                        if (_showElectricity) _buildLineChartBarData(spotsE, Colors.amber.shade700),
                        if (_showInternet) _buildLineChartBarData(spotsI, Colors.teal),
                      ],
                      lineTouchData: LineTouchData(
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipItems: (touchedSpots) {
                            return touchedSpots.map((LineBarSpot touchedSpot) {
                              final style = TextStyle(color: touchedSpot.bar.color, fontWeight: FontWeight.bold);
                              return LineTooltipItem('\$${touchedSpot.y.toStringAsFixed(2)}', style);
                            }).toList();
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Center(
              child: Text(
                'Usa la barra de opciones para registrar consumos o ver el historial.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.outline,
                    ),
              ),
            ),
          ],
        );
      },
    );
  }

  LineChartBarData _buildLineChartBarData(List<FlSpot> spots, Color color) {
    return LineChartBarData(
      spots: spots,
      isCurved: true,
      color: color,
      barWidth: 3,
      isStrokeCapRound: true,
      dotData: const FlDotData(show: true),
      belowBarData: BarAreaData(
        show: true,
        color: color.withValues(alpha: 0.1),
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final bool isVisible;
  final VoidCallback onTap;

  const _LegendItem({
    required this.color,
    required this.label,
    required this.isVisible,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.circle, color: isVisible ? color : Colors.grey.shade400, size: 12),
            const SizedBox(width: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: isVisible ? Theme.of(context).colorScheme.onSurface : Colors.grey.shade500,
                decoration: isVisible ? TextDecoration.none : TextDecoration.lineThrough,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatSummaryCard extends StatelessWidget {
  const _StatSummaryCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    this.isTotal = false,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final bool isTotal;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: isTotal ? 4 : 0,
      color: isTotal ? color : Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isTotal ? Colors.white.withValues(alpha: 0.2) : color.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: isTotal ? Colors.white : color, size: 24),
                ),
              ],
            ),
            const Spacer(),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: isTotal ? Colors.white70 : Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 4),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: isTotal ? Colors.white : Theme.of(context).colorScheme.onSurface,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
