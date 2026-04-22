import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mis_gastos_supabase/models/domain.dart';
import 'package:mis_gastos_supabase/models/records.dart';

Future<void> showWaterFormDialog(
  BuildContext context, {
  required FixedValues fixed,
  WaterRecord? existing,
  bool isReadOnly = false,
  required void Function(WaterRecord draft) onSubmit,
}) async {
  await showDialog<void>(
    context: context,
    builder: (ctx) => _WaterDialog(
      fixed: fixed,
      existing: existing,
      isReadOnly: isReadOnly,
      onSubmit: onSubmit,
    ),
  );
}

class _WaterDialog extends StatefulWidget {
  const _WaterDialog({
    required this.fixed,
    this.existing,
    this.isReadOnly = false,
    required this.onSubmit,
  });

  final FixedValues fixed;
  final WaterRecord? existing;
  final bool isReadOnly;
  final void Function(WaterRecord draft) onSubmit;

  @override
  State<_WaterDialog> createState() => _WaterDialogState();
}

class _WaterDialogState extends State<_WaterDialog> {
  final _formKey = GlobalKey<FormState>();
  late int _year;
  late String _month;
  late TextEditingController _invoiced;
  late TextEditingController _discount;
  late String _status;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    final now = DateTime.now();
    _year = e?.year ?? now.year;
    _month = e?.month ?? months[now.month - 1];
    _invoiced = TextEditingController(text: e != null ? '${e.totalInvoiced}' : '');
    _discount = TextEditingController(
      text: e != null ? '${e.discount}' : '${widget.fixed.waterDiscount}',
    );
    _status = e?.status ?? 'Pendiente';
  }

  @override
  void dispose() {
    _invoiced.dispose();
    _discount.dispose();
    super.dispose();
  }

  double get _totalToPay {
    final inv = double.tryParse(_invoiced.text) ?? 0;
    final disc = double.tryParse(_discount.text) ?? 0;
    final t = inv - disc;
    return t >= 0 ? t : 0;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.isReadOnly 
        ? 'Detalles — Agua' 
        : (widget.existing == null ? 'Nuevo registro — Agua' : 'Editar — Agua')),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  initialValue: _year,
                  decoration: const InputDecoration(labelText: 'Año'),
                  items: List.generate(10, (i) {
                    final y = DateTime.now().year + 1 - i;
                    return DropdownMenuItem(value: y, child: Text('$y'));
                  }),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _year = v ?? _year),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _month,
                  decoration: const InputDecoration(labelText: 'Mes'),
                  items: months
                      .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                      .toList(),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _month = v ?? _month),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _invoiced,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Total facturado'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[\d.,]')),
                  ],
                  onChanged: (_) => setState(() {}),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Requerido';
                    if (double.tryParse(v.replaceAll(',', '.')) == null) {
                      return 'Número inválido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _discount,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Descuento'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[\d.,]')),
                  ],
                  onChanged: (_) => setState(() {}),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Requerido';
                    if (double.tryParse(v.replaceAll(',', '.')) == null) {
                      return 'Número inválido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Total a pagar: ${_totalToPay.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('¿Está pagado?'),
                  subtitle: Text(_status == 'Pagado' ? 'Marcar como Pendiente' : 'Marcar como Pagado'),
                  value: _status == 'Pagado',
                  secondary: Icon(
                    _status == 'Pagado' ? Icons.check_circle : Icons.pending_actions,
                    color: _status == 'Pagado' ? Colors.green : Colors.orange,
                  ),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _status = v ? 'Pagado' : 'Pendiente'),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(widget.isReadOnly ? 'Cerrar' : 'Cancelar')),
        if (!widget.isReadOnly)
          FilledButton(
            onPressed: () async {
              if (!_formKey.currentState!.validate()) return;
              if (widget.existing != null) {
                final confirm = await _confirmSave(context);
                if (!confirm || !context.mounted) return;
              }
              final inv = double.parse(_invoiced.text.replaceAll(',', '.'));
              final disc = double.parse(_discount.text.replaceAll(',', '.'));
              final id = widget.existing?.id ?? '';
              widget.onSubmit(
                WaterRecord(
                  id: id,
                  year: _year,
                  month: _month,
                  totalInvoiced: inv,
                  discount: disc,
                  totalToPay: double.parse(_totalToPay.toStringAsFixed(2)),
                  status: _status,
                ),
              );
              Navigator.pop(context);
            },
            child: const Text('Guardar'),
          ),
      ],
    );
  }
}

Future<void> showElectricityFormDialog(
  BuildContext context, {
  required FixedValues fixed,
  required List<ElectricityRecord> allElectric,
  ElectricityRecord? existing,
  bool isReadOnly = false,
  required void Function(ElectricityRecord draft) onSubmit,
}) async {
  await showDialog<void>(
    context: context,
    builder: (ctx) => _ElectricityDialog(
      fixed: fixed,
      allElectric: allElectric,
      existing: existing,
      isReadOnly: isReadOnly,
      onSubmit: onSubmit,
    ),
  );
}

class _ElectricityDialog extends StatefulWidget {
  const _ElectricityDialog({
    required this.fixed,
    required this.allElectric,
    this.existing,
    this.isReadOnly = false,
    required this.onSubmit,
  });

  final FixedValues fixed;
  final List<ElectricityRecord> allElectric;
  final ElectricityRecord? existing;
  final bool isReadOnly;
  final void Function(ElectricityRecord draft) onSubmit;

  @override
  State<_ElectricityDialog> createState() => _ElectricityDialogState();
}

class _ElectricityDialogState extends State<_ElectricityDialog> {
  final _formKey = GlobalKey<FormState>();
  late int _year;
  late String _month;
  late TextEditingController _invoiced;
  late TextEditingController _kwh;
  late TextEditingController _prev;
  late TextEditingController _curr;
  late TextEditingController _discount;
  late String _status;

  int _lastMeterReading() {
    if (widget.allElectric.isEmpty) return 0;
    final sorted = [...widget.allElectric];
    sorted.sort((a, b) {
      if (a.year != b.year) return b.year.compareTo(a.year);
      return months.indexOf(b.month).compareTo(months.indexOf(a.month));
    });
    return sorted.first.currentMeter;
  }

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    final now = DateTime.now();
    _year = e?.year ?? now.year;
    _month = e?.month ?? months[now.month - 1];
    _invoiced = TextEditingController(text: e != null ? '${e.totalInvoiced}' : '');
    _kwh = TextEditingController(text: e != null ? '${e.kwhConsumption}' : '');
    _prev = TextEditingController(
      text: e != null ? '${e.previousMeter}' : '${_lastMeterReading()}',
    );
    _curr = TextEditingController(text: e != null ? '${e.currentMeter}' : '');
    _discount = TextEditingController(
      text: e != null ? '${e.discount}' : '${widget.fixed.electricityDiscount}',
    );
    _status = e?.status ?? 'Pendiente';
  }

  @override
  void dispose() {
    _invoiced.dispose();
    _kwh.dispose();
    _prev.dispose();
    _curr.dispose();
    _discount.dispose();
    super.dispose();
  }

  double get _kwhCost {
    final inv = double.tryParse(_invoiced.text.replaceAll(',', '.')) ?? 0;
    final kwh = double.tryParse(_kwh.text.replaceAll(',', '.')) ?? 0;
    if (inv <= 0 || kwh <= 0) return 0;
    return inv / kwh;
  }

  int get _consumptionMeter {
    final p = int.tryParse(_prev.text) ?? 0;
    final c = int.tryParse(_curr.text) ?? 0;
    if (c >= p) return c - p;
    return 0;
  }

  double get _totalToPay {
    final sub = _consumptionMeter * _kwhCost;
    final disc = double.tryParse(_discount.text.replaceAll(',', '.')) ?? 0;
    final t = sub - disc;
    return t >= 0 ? t : 0;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.isReadOnly 
        ? 'Detalles — Electricidad' 
        : (widget.existing == null ? 'Nuevo — Electricidad' : 'Editar — Electricidad')),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  initialValue: _year,
                  decoration: const InputDecoration(labelText: 'Año'),
                  items: List.generate(10, (i) {
                    final y = DateTime.now().year + 1 - i;
                    return DropdownMenuItem(value: y, child: Text('$y'));
                  }),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _year = v ?? _year),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _month,
                  decoration: const InputDecoration(labelText: 'Mes'),
                  items: months
                      .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                      .toList(),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _month = v ?? _month),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _invoiced,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Total facturado'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _kwh,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Consumo kWh'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _prev,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Contador anterior'),
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _curr,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Contador actual'),
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Requerido';
                    final p = int.tryParse(_prev.text) ?? 0;
                    final c = int.tryParse(v) ?? 0;
                    if (c < p) return 'El actual debe ser ≥ anterior';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _discount,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Descuento'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Costo/kWh: ${_kwhCost.toStringAsFixed(4)}\nConsumo medidor: $_consumptionMeter\nTotal: ${_totalToPay.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('¿Está pagado?'),
                  subtitle: Text(_status == 'Pagado' ? 'Marcar como Pendiente' : 'Marcar como Pagado'),
                  value: _status == 'Pagado',
                  secondary: Icon(
                    _status == 'Pagado' ? Icons.check_circle : Icons.pending_actions,
                    color: _status == 'Pagado' ? Colors.green : Colors.orange,
                  ),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _status = v ? 'Pagado' : 'Pendiente'),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(widget.isReadOnly ? 'Cerrar' : 'Cancelar')),
        if (!widget.isReadOnly)
          FilledButton(
            onPressed: () async {
              if (!_formKey.currentState!.validate()) return;
              if (widget.existing != null) {
                final confirm = await _confirmSave(context);
                if (!confirm || !context.mounted) return;
              }
              final inv = double.parse(_invoiced.text.replaceAll(',', '.'));
              final kwh = double.parse(_kwh.text.replaceAll(',', '.'));
              final p = int.parse(_prev.text);
              final c = int.parse(_curr.text);
              final disc = double.parse(_discount.text.replaceAll(',', '.'));
              final kCost = inv > 0 && kwh > 0 ? inv / kwh : 0.0;
              final cons = c >= p ? c - p : 0;
              final total = (cons * kCost - disc);
              final id = widget.existing?.id ?? '';
              widget.onSubmit(
                ElectricityRecord(
                  id: id,
                  year: _year,
                  month: _month,
                  totalInvoiced: inv,
                  kwhConsumption: kwh,
                  kwhCost: double.parse(kCost.toStringAsFixed(4)),
                  previousMeter: p,
                  currentMeter: c,
                  consumptionMeter: cons,
                  discount: disc,
                  totalToPay: double.parse((total >= 0 ? total : 0).toStringAsFixed(2)),
                  status: _status,
                ),
              );
              Navigator.pop(context);
            },
            child: const Text('Guardar'),
          ),
      ],
    );
  }
}

Future<void> showInternetFormDialog(
  BuildContext context, {
  required FixedValues fixed,
  InternetRecord? existing,
  bool isReadOnly = false,
  required void Function(InternetRecord draft) onSubmit,
}) async {
  await showDialog<void>(
    context: context,
    builder: (ctx) => _InternetDialog(
      fixed: fixed,
      existing: existing,
      isReadOnly: isReadOnly,
      onSubmit: onSubmit,
    ),
  );
}

class _InternetDialog extends StatefulWidget {
  const _InternetDialog({
    required this.fixed,
    this.existing,
    this.isReadOnly = false,
    required this.onSubmit,
  });

  final FixedValues fixed;
  final InternetRecord? existing;
  final bool isReadOnly;
  final void Function(InternetRecord draft) onSubmit;

  @override
  State<_InternetDialog> createState() => _InternetDialogState();
}

class _InternetDialogState extends State<_InternetDialog> {
  final _formKey = GlobalKey<FormState>();
  late int _year;
  late String _month;
  late TextEditingController _monthly;
  late TextEditingController _discount;
  late String _status;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    final now = DateTime.now();
    _year = e?.year ?? now.year;
    _month = e?.month ?? months[now.month - 1];
    _monthly = TextEditingController(text: e != null ? '${e.monthlyCost}' : '');
    _discount = TextEditingController(
      text: e != null ? '${e.discount}' : '${widget.fixed.internetDiscount}',
    );
    _status = e?.status ?? 'Pendiente';
  }

  @override
  void dispose() {
    _monthly.dispose();
    _discount.dispose();
    super.dispose();
  }

  double get _totalToPay {
    final m = double.tryParse(_monthly.text.replaceAll(',', '.')) ?? 0;
    final d = double.tryParse(_discount.text.replaceAll(',', '.')) ?? 0;
    final t = m - d;
    return t >= 0 ? t : 0;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.isReadOnly 
        ? 'Detalles — Internet' 
        : (widget.existing == null ? 'Nuevo — Internet' : 'Editar — Internet')),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  initialValue: _year,
                  decoration: const InputDecoration(labelText: 'Año'),
                  items: List.generate(10, (i) {
                    final y = DateTime.now().year + 1 - i;
                    return DropdownMenuItem(value: y, child: Text('$y'));
                  }),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _year = v ?? _year),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _month,
                  decoration: const InputDecoration(labelText: 'Mes'),
                  items: months
                      .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                      .toList(),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _month = v ?? _month),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _monthly,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Costo mensual'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _discount,
                  enabled: !widget.isReadOnly,
                  decoration: const InputDecoration(labelText: 'Descuento'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Total a pagar: ${_totalToPay.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('¿Está pagado?'),
                  subtitle: Text(_status == 'Pagado' ? 'Marcar como Pendiente' : 'Marcar como Pagado'),
                  value: _status == 'Pagado',
                  secondary: Icon(
                    _status == 'Pagado' ? Icons.check_circle : Icons.pending_actions,
                    color: _status == 'Pagado' ? Colors.green : Colors.orange,
                  ),
                  onChanged: widget.isReadOnly ? null : (v) => setState(() => _status = v ? 'Pagado' : 'Pendiente'),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(widget.isReadOnly ? 'Cerrar' : 'Cancelar')),
        if (!widget.isReadOnly)
          FilledButton(
            onPressed: () async {
              if (!_formKey.currentState!.validate()) return;
              if (widget.existing != null) {
                final confirm = await _confirmSave(context);
                if (!confirm || !context.mounted) return;
              }
              final m = double.parse(_monthly.text.replaceAll(',', '.'));
              final d = double.parse(_discount.text.replaceAll(',', '.'));
              final id = widget.existing?.id ?? '';
              widget.onSubmit(
                InternetRecord(
                  id: id,
                  year: _year,
                  month: _month,
                  monthlyCost: m,
                  discount: d,
                  totalToPay: double.parse(_totalToPay.toStringAsFixed(2)),
                  status: _status,
                ),
              );
              Navigator.pop(context);
            },
            child: const Text('Guardar'),
          ),
      ],
    );
  }
}

Future<bool> _confirmSave(BuildContext context) async {
  final res = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Confirmar actualización'),
      content: const Text('¿Estás seguro de que deseas actualizar los datos de este registro?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text('Confirmar'),
        ),
      ],
    ),
  );
  return res == true;
}
