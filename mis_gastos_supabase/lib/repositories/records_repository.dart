import 'dart:convert';

import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/utils/record_sort.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

List<Map<String, dynamic>> _mapList(dynamic response) {
  final list = response as List<dynamic>;
  return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
}

void _sortWater(List<WaterRecord> list) {
  list.sort(
    (a, b) => compareYearMonthDesc(
      (year: a.year, month: a.month),
      (year: b.year, month: b.month),
    ),
  );
}

void _sortElec(List<ElectricityRecord> list) {
  list.sort(
    (a, b) => compareYearMonthDesc(
      (year: a.year, month: a.month),
      (year: b.year, month: b.month),
    ),
  );
}

void _sortNet(List<InternetRecord> list) {
  list.sort(
    (a, b) => compareYearMonthDesc(
      (year: a.year, month: a.month),
      (year: b.year, month: b.month),
    ),
  );
}

class RecordsRepository {
  RecordsRepository({SupabaseClient? client})
    : _c = client ?? Supabase.instance.client;

  final SupabaseClient _c;
  SharedPreferences? _prefs;

  static const _kCacheWater = 'cache_water_records';
  static const _kCacheElec = 'cache_electricity_records';
  static const _kCacheNet = 'cache_internet_records';
  static const _kCacheFixed = 'cache_fixed_values';
  static const _kPendingOps = 'pending_sync_operations';

  Future<SharedPreferences> _sp() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  Future<List<Map<String, dynamic>>> _readList(String key) async {
    final raw = (await _sp()).getString(key);
    if (raw == null || raw.isEmpty) return const [];
    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((e) => Map<String, dynamic>.from(e as Map<dynamic, dynamic>))
        .toList();
  }

  Future<void> _writeList(String key, List<Map<String, dynamic>> rows) async {
    await (await _sp()).setString(key, jsonEncode(rows));
  }

  Future<void> _writeFixed(FixedValues v) async {
    await (await _sp()).setString(_kCacheFixed, jsonEncode(v.toMap()));
  }

  Future<void> _enqueue(Map<String, dynamic> op) async {
    final ops = await _readList(_kPendingOps);
    ops.add(op);
    await _writeList(_kPendingOps, ops);
  }

  Future<void> _replaceById(
    String key,
    String id,
    Map<String, dynamic> row,
  ) async {
    final list = await _readList(key);
    final idx = list.indexWhere((e) => e['id'] == id);
    if (idx >= 0) {
      list[idx] = row;
    } else {
      list.add(row);
    }
    await _writeList(key, list);
  }

  Future<void> _removeById(String key, String id) async {
    final list = await _readList(key);
    list.removeWhere((e) => e['id'] == id);
    await _writeList(key, list);
  }

  Future<int> pendingOperationsCount() async {
    return (await _readList(_kPendingOps)).length;
  }

  Future<int> syncPendingChanges() async {
    final ops = await _readList(_kPendingOps);
    if (ops.isEmpty) return 0;

    final remaining = <Map<String, dynamic>>[];
    var synced = 0;

    for (final op in ops) {
      try {
        final type = op['type'] as String;
        final payload = Map<String, dynamic>.from(
          (op['payload'] as Map?) ?? const {},
        );
        switch (type) {
          case 'upsert_water':
            await _c.from('water_records').upsert(payload, onConflict: 'id');
            break;
          case 'delete_water':
            await _c.from('water_records').delete().eq('id', op['id']);
            break;
          case 'upsert_electricity':
            await _c
                .from('electricity_records')
                .upsert(payload, onConflict: 'id');
            break;
          case 'delete_electricity':
            await _c.from('electricity_records').delete().eq('id', op['id']);
            break;
          case 'upsert_internet':
            await _c.from('internet_records').upsert(payload, onConflict: 'id');
            break;
          case 'delete_internet':
            await _c.from('internet_records').delete().eq('id', op['id']);
            break;
          case 'update_fixed_values':
            await _c.from('app_settings').update(payload).eq('id', 1);
            break;
          default:
            remaining.add(op);
            continue;
        }
        synced++;
      } catch (_) {
        remaining.add(op);
      }
    }

    await _writeList(_kPendingOps, remaining);
    return synced;
  }

  Future<FixedValues> fetchFixedValues() async {
    try {
      final row = await _c
          .from('app_settings')
          .select()
          .eq('id', 1)
          .maybeSingle();
      if (row == null) {
        return const FixedValues();
      }
      final m = Map<String, dynamic>.from(row);
      final fixed = FixedValues.fromMap(m);
      await _writeFixed(fixed);
      return fixed;
    } catch (_) {
      final raw = (await _sp()).getString(_kCacheFixed);
      if (raw == null || raw.isEmpty) return const FixedValues();
      return FixedValues.fromMap(
        Map<String, dynamic>.from(jsonDecode(raw) as Map<dynamic, dynamic>),
      );
    }
  }

  Future<void> updateFixedValues(FixedValues v) async {
    final payload = v.toMap();
    await _writeFixed(v);
    try {
      await _c.from('app_settings').update(payload).eq('id', 1);
    } catch (_) {
      await _enqueue({'type': 'update_fixed_values', 'payload': payload});
    }
  }

  Future<List<WaterRecord>> fetchWater() async {
    try {
      final rows = _mapList(await _c.from('water_records').select());
      await _writeList(_kCacheWater, rows);
      final list = rows.map(WaterRecord.fromRow).toList();
      _sortWater(list);
      return list;
    } catch (_) {
      final rows = await _readList(_kCacheWater);
      final list = rows.map(WaterRecord.fromRow).toList();
      _sortWater(list);
      return list;
    }
  }

  Future<List<ElectricityRecord>> fetchElectricity() async {
    try {
      final rows = _mapList(await _c.from('electricity_records').select());
      await _writeList(_kCacheElec, rows);
      final list = rows.map(ElectricityRecord.fromRow).toList();
      _sortElec(list);
      return list;
    } catch (_) {
      final rows = await _readList(_kCacheElec);
      final list = rows.map(ElectricityRecord.fromRow).toList();
      _sortElec(list);
      return list;
    }
  }

  Future<List<InternetRecord>> fetchInternet() async {
    try {
      final rows = _mapList(await _c.from('internet_records').select());
      await _writeList(_kCacheNet, rows);
      final list = rows.map(InternetRecord.fromRow).toList();
      _sortNet(list);
      return list;
    } catch (_) {
      final rows = await _readList(_kCacheNet);
      final list = rows.map(InternetRecord.fromRow).toList();
      _sortNet(list);
      return list;
    }
  }

  Future<WaterRecord> insertWater(WaterRecord r) async {
    final payload = r.toInsert();
    try {
      final row = Map<String, dynamic>.from(
        await _c
            .from('water_records')
            .upsert(payload, onConflict: 'id')
            .select()
            .single(),
      );
      await _replaceById(_kCacheWater, row['id'] as String, row);
      return WaterRecord.fromRow(row);
    } catch (_) {
      await _replaceById(_kCacheWater, r.id, r.toRow());
      await _enqueue({'type': 'upsert_water', 'payload': payload});
      return r;
    }
  }

  Future<void> updateWater(WaterRecord r) async {
    final payload = r.toInsert();
    await _replaceById(_kCacheWater, r.id, r.toRow());
    try {
      await _c.from('water_records').upsert(payload, onConflict: 'id');
    } catch (_) {
      await _enqueue({'type': 'upsert_water', 'payload': payload});
    }
  }

  Future<void> deleteWater(String id) async {
    await _removeById(_kCacheWater, id);
    try {
      await _c.from('water_records').delete().eq('id', id);
    } catch (_) {
      await _enqueue({'type': 'delete_water', 'id': id});
    }
  }

  Future<ElectricityRecord> insertElectricity(ElectricityRecord r) async {
    final payload = r.toInsert();
    try {
      final row = Map<String, dynamic>.from(
        await _c
            .from('electricity_records')
            .upsert(payload, onConflict: 'id')
            .select()
            .single(),
      );
      await _replaceById(_kCacheElec, row['id'] as String, row);
      return ElectricityRecord.fromRow(row);
    } catch (_) {
      await _replaceById(_kCacheElec, r.id, r.toRow());
      await _enqueue({'type': 'upsert_electricity', 'payload': payload});
      return r;
    }
  }

  Future<void> updateElectricity(ElectricityRecord r) async {
    final payload = r.toInsert();
    await _replaceById(_kCacheElec, r.id, r.toRow());
    try {
      await _c.from('electricity_records').upsert(payload, onConflict: 'id');
    } catch (_) {
      await _enqueue({'type': 'upsert_electricity', 'payload': payload});
    }
  }

  Future<void> deleteElectricity(String id) async {
    await _removeById(_kCacheElec, id);
    try {
      await _c.from('electricity_records').delete().eq('id', id);
    } catch (_) {
      await _enqueue({'type': 'delete_electricity', 'id': id});
    }
  }

  Future<InternetRecord> insertInternet(InternetRecord r) async {
    final payload = r.toInsert();
    try {
      final row = Map<String, dynamic>.from(
        await _c
            .from('internet_records')
            .upsert(payload, onConflict: 'id')
            .select()
            .single(),
      );
      await _replaceById(_kCacheNet, row['id'] as String, row);
      return InternetRecord.fromRow(row);
    } catch (_) {
      await _replaceById(_kCacheNet, r.id, r.toRow());
      await _enqueue({'type': 'upsert_internet', 'payload': payload});
      return r;
    }
  }

  Future<void> updateInternet(InternetRecord r) async {
    final payload = r.toInsert();
    await _replaceById(_kCacheNet, r.id, r.toRow());
    try {
      await _c.from('internet_records').upsert(payload, onConflict: 'id');
    } catch (_) {
      await _enqueue({'type': 'upsert_internet', 'payload': payload});
    }
  }

  Future<void> deleteInternet(String id) async {
    await _removeById(_kCacheNet, id);
    try {
      await _c.from('internet_records').delete().eq('id', id);
    } catch (_) {
      await _enqueue({'type': 'delete_internet', 'id': id});
    }
  }

  Future<void> restoreBackup({
    required List<WaterRecord> water,
    required List<ElectricityRecord> electricity,
    required List<InternetRecord> internet,
    required FixedValues fixedValues,
  }) async {
    await updateFixedValues(fixedValues);
    for (final r in water) {
      await insertWater(r);
    }
    for (final r in electricity) {
      await insertElectricity(r);
    }
    for (final r in internet) {
      await insertInternet(r);
    }
  }
}
