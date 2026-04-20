import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/features/data/app_data_cubit.dart';
import 'package:mis_gastos_supabase/models/domain.dart';
import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/utils/formatters.dart';
import 'package:mis_gastos_supabase/utils/pdf_generator.dart';
import 'package:mis_gastos_supabase/core/ui_utils.dart';
import 'package:mis_gastos_supabase/widgets/service_form_dialogs.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';

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
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: TextField(
                controller: _search,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Buscar por mes o año',
                  filled: true,
                  fillColor: Theme.of(
                    context,
                  ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
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
              child: filtered.isEmpty
                  ? const Center(
                      child: Text(
                        'Añade registros en Agua, Electricidad e Internet.',
                        textAlign: TextAlign.center,
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(24),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 16),
                      itemBuilder: (context, i) {
                        final key = filtered[i];
                        final row = combined[key]!;
                        final parts = key.split('|');
                        final month = parts[0];
                        final year = parts[1];
                        return Card(
                          elevation: 0,
                          color: Theme.of(context)
                              .colorScheme
                              .surfaceContainerHighest
                              .withValues(alpha: 0.3),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          month,
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                        Text(
                                          year,
                                          style: TextStyle(
                                            color: Theme.of(
                                              context,
                                            ).colorScheme.onSurfaceVariant,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary
                                            .withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            formatMoney(row.total),
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleMedium
                                                ?.copyWith(
                                                  color: Theme.of(
                                                    context,
                                                  ).colorScheme.primary,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                          ),
                                          const SizedBox(width: 8),
                                          IconButton(
                                            visualDensity:
                                                VisualDensity.compact,
                                            icon: const Icon(
                                              Icons.picture_as_pdf,
                                              size: 20,
                                            ),
                                            color: Theme.of(
                                              context,
                                            ).colorScheme.primary,
                                            onPressed: () async {
                                              UiUtils.showTopSnackBar(
                                                context,
                                                'Generando reporte PDF...',
                                              );
                                              try {
                                                await PdfGenerator.generateMonthlySummary(
                                                  month: month,
                                                  year: int.parse(year),
                                                  water: row.waterRec,
                                                  electricity:
                                                      row.electricityRec,
                                                  internet: row.internetRec,
                                                  total: row.total,
                                                );
                                              } catch (e) {
                                                if (context.mounted) {
                                                  UiUtils.showTopSnackBar(
                                                    context,
                                                    'Error al generar PDF: $e',
                                                    isError: true,
                                                  );
                                                }
                                              }
                                            },
                                          ),
                                          IconButton(
                                            visualDensity:
                                                VisualDensity.compact,
                                            icon: const Icon(
                                              Icons.send,
                                              size: 20,
                                            ),
                                            color: Colors.green.shade700,
                                            onPressed: () async {
                                              UiUtils.showTopSnackBar(
                                                context,
                                                'Preparando mensaje para WhatsApp...',
                                              );
                                              final message =
                                                  _buildWhatsappReportText(
                                                    month,
                                                    year,
                                                    row,
                                                  );
                                              final uri = Uri(
                                                scheme: 'https',
                                                host: 'wa.me',
                                                queryParameters: {
                                                  'text': message,
                                                },
                                              );
                                              try {
                                                final launched =
                                                    await launchUrl(
                                                      uri,
                                                      mode: LaunchMode
                                                          .externalApplication,
                                                    );
                                                if (!launched &&
                                                    context.mounted) {
                                                  UiUtils.showTopSnackBar(
                                                    context,
                                                    'No se pudo abrir WhatsApp.',
                                                    isError: true,
                                                  );
                                                }
                                              } catch (e) {
                                                if (context.mounted) {
                                                  UiUtils.showTopSnackBar(
                                                    context,
                                                    'Error al abrir WhatsApp: $e',
                                                    isError: true,
                                                  );
                                                }
                                              }
                                            },
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                InkWell(
                                  onTap: row.waterRec == null
                                      ? null
                                      : () {
                                          final auth = context
                                              .read<AuthBloc>()
                                              .state;
                                          final canEdit =
                                              auth is AuthAuthenticated &&
                                              (auth.user.role ==
                                                      UserRole.administrador ||
                                                  auth.user.role ==
                                                      UserRole.edicion);

                                          showWaterFormDialog(
                                            context,
                                            fixed: state.fixedValues,
                                            existing: row.waterRec,
                                            isReadOnly: !canEdit,
                                            onSubmit: (draft) => context
                                                .read<AppDataCubit>()
                                                .updateWater(draft),
                                          );
                                        },
                                  borderRadius: BorderRadius.circular(8),
                                  child: _rowLine(
                                    context,
                                    'Agua',
                                    row.water,
                                    Icons.water_drop,
                                    Colors.lightBlue,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                InkWell(
                                  onTap: row.electricityRec == null
                                      ? null
                                      : () {
                                          final auth = context
                                              .read<AuthBloc>()
                                              .state;
                                          final canEdit =
                                              auth is AuthAuthenticated &&
                                              (auth.user.role ==
                                                      UserRole.administrador ||
                                                  auth.user.role ==
                                                      UserRole.edicion);

                                          showElectricityFormDialog(
                                            context,
                                            fixed: state.fixedValues,
                                            allElectric: state.electricity,
                                            existing: row.electricityRec,
                                            isReadOnly: !canEdit,
                                            onSubmit: (draft) => context
                                                .read<AppDataCubit>()
                                                .updateElectricity(draft),
                                          );
                                        },
                                  borderRadius: BorderRadius.circular(8),
                                  child: _rowLine(
                                    context,
                                    'Electricidad',
                                    row.electricity,
                                    Icons.lightbulb,
                                    Colors.amber.shade700,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                InkWell(
                                  onTap: row.internetRec == null
                                      ? null
                                      : () {
                                          final auth = context
                                              .read<AuthBloc>()
                                              .state;
                                          final canEdit =
                                              auth is AuthAuthenticated &&
                                              (auth.user.role ==
                                                      UserRole.administrador ||
                                                  auth.user.role ==
                                                      UserRole.edicion);

                                          showInternetFormDialog(
                                            context,
                                            fixed: state.fixedValues,
                                            existing: row.internetRec,
                                            isReadOnly: !canEdit,
                                            onSubmit: (draft) => context
                                                .read<AppDataCubit>()
                                                .updateInternet(draft),
                                          );
                                        },
                                  borderRadius: BorderRadius.circular(8),
                                  child: _rowLine(
                                    context,
                                    'Internet',
                                    row.internet,
                                    Icons.wifi,
                                    Colors.teal,
                                  ),
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

  Widget _rowLine(
    BuildContext context,
    String label,
    double? v,
    IconData icon,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 8),
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          const Spacer(),
          Text(
            formatMoney(v ?? 0),
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: 4),
          Icon(
            Icons.chevron_right,
            size: 14,
            color: Theme.of(context).colorScheme.outline,
          ),
        ],
      ),
    );
  }

  String _buildWhatsappReportText(String month, String year, _Row row) {
    final buffer = StringBuffer();
    buffer.writeln('*Resumen de servicios — $month $year*');
    buffer.writeln('');
    buffer.writeln('*AGUA:*');
    if (row.waterRec != null) {
      buffer.writeln(
        '• Monto facturado: ${formatMoney(row.waterRec!.totalInvoiced)}',
      );
      buffer.writeln('• Descuento: ${formatMoney(row.waterRec!.discount)}');
      buffer.writeln(
        '• Total a pagar: *${formatMoney(row.waterRec!.totalToPay)}*',
      );
    } else {
      buffer.writeln('- No disponible');
    }
    buffer.writeln('');
    buffer.writeln('*ELECTRICIDAD:*');
    if (row.electricityRec != null) {
      buffer.writeln(
        '• Lectura anterior: ${row.electricityRec!.previousMeter}',
      );
      buffer.writeln('• Lectura actual: ${row.electricityRec!.currentMeter}');
      buffer.writeln(
        '• Consumo medidor: ${row.electricityRec!.consumptionMeter}',
      );
      buffer.writeln(
        '• Precio kWh: ${formatMoney(row.electricityRec!.kwhCost)}',
      );
      buffer.writeln(
        '• Descuento: ${formatMoney(row.electricityRec!.discount)}',
      );
      buffer.writeln(
        '• Total a pagar: *${formatMoney(row.electricityRec!.totalToPay)}*',
      );
    } else {
      buffer.writeln('- No disponible');
    }
    buffer.writeln('');
    buffer.writeln('*INTERNET:*');
    if (row.internetRec != null) {
      buffer.writeln(
        '• Costo del plan: ${formatMoney(row.internetRec!.monthlyCost)}',
      );
      buffer.writeln('• Descuento: ${formatMoney(row.internetRec!.discount)}');
      buffer.writeln(
        '• Total a pagar: *${formatMoney(row.internetRec!.totalToPay)}*',
      );
    } else {
      buffer.writeln('- No disponible');
    }
    buffer.writeln('');
    buffer.writeln('TOTAL GENERAL DEL PERIODO: *${formatMoney(row.total)}*');
    return buffer.toString();
  }

  Map<String, _Row> _combine(AppDataState state) {
    final map = <String, _Row>{};
    for (final x in state.water) {
      final key = '${x.month}|${x.year}';
      map[key] = map[key] ?? _Row();
      map[key]!.water = x.totalToPay;
      map[key]!.waterRec = x;
    }
    for (final x in state.electricity) {
      final key = '${x.month}|${x.year}';
      map[key] = map[key] ?? _Row();
      map[key]!.electricity = x.totalToPay;
      map[key]!.electricityRec = x;
    }
    for (final x in state.internet) {
      final key = '${x.month}|${x.year}';
      map[key] = map[key] ?? _Row();
      map[key]!.internet = x.totalToPay;
      map[key]!.internetRec = x;
    }

    // Recalcular totales
    for (final r in map.values) {
      r.total = (r.water ?? 0) + (r.electricity ?? 0) + (r.internet ?? 0);
    }
    return map;
  }
}

class _Row {
  double? water;
  WaterRecord? waterRec;
  double? electricity;
  ElectricityRecord? electricityRec;
  double? internet;
  InternetRecord? internetRec;
  double total = 0;
}
