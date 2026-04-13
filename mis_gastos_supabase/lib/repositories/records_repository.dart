import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/utils/record_sort.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

List<Map<String, dynamic>> _mapList(dynamic response) {
  final list = response as List<dynamic>;
  return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
}

void _sortWater(List<WaterRecord> list) {
  list.sort((a, b) => compareYearMonthDesc(
        (year: a.year, month: a.month),
        (year: b.year, month: b.month),
      ));
}

void _sortElec(List<ElectricityRecord> list) {
  list.sort((a, b) => compareYearMonthDesc(
        (year: a.year, month: a.month),
        (year: b.year, month: b.month),
      ));
}

void _sortNet(List<InternetRecord> list) {
  list.sort((a, b) => compareYearMonthDesc(
        (year: a.year, month: a.month),
        (year: b.year, month: b.month),
      ));
}

class RecordsRepository {
  RecordsRepository({SupabaseClient? client})
      : _c = client ?? Supabase.instance.client;

  final SupabaseClient _c;

  Future<FixedValues> fetchFixedValues() async {
    final row = await _c.from('app_settings').select().eq('id', 1).maybeSingle();
    if (row == null) {
      return const FixedValues();
    }
    final m = Map<String, dynamic>.from(row);
    return FixedValues(
      waterDiscount: (m['water_discount'] as num?)?.toDouble() ?? 0,
      electricityDiscount: (m['electricity_discount'] as num?)?.toDouble() ?? 0,
      internetDiscount: (m['internet_discount'] as num?)?.toDouble() ?? 0,
    );
  }

  Future<void> updateFixedValues(FixedValues v) async {
    await _c.from('app_settings').update({
      'water_discount': v.waterDiscount,
      'electricity_discount': v.electricityDiscount,
      'internet_discount': v.internetDiscount,
    }).eq('id', 1);
  }

  Future<List<WaterRecord>> fetchWater() async {
    final rows = _mapList(await _c.from('water_records').select());
    final list = rows.map(WaterRecord.fromRow).toList();
    _sortWater(list);
    return list;
  }

  Future<List<ElectricityRecord>> fetchElectricity() async {
    final rows = _mapList(await _c.from('electricity_records').select());
    final list = rows.map(ElectricityRecord.fromRow).toList();
    _sortElec(list);
    return list;
  }

  Future<List<InternetRecord>> fetchInternet() async {
    final rows = _mapList(await _c.from('internet_records').select());
    final list = rows.map(InternetRecord.fromRow).toList();
    _sortNet(list);
    return list;
  }

  Future<WaterRecord> insertWater(WaterRecord r) async {
    final row = Map<String, dynamic>.from(await _c
        .from('water_records')
        .insert(r.toInsert())
        .select()
        .single());
    return WaterRecord.fromRow(row);
  }

  Future<void> updateWater(WaterRecord r) async {
    await _c.from('water_records').update(r.toUpdate()).eq('id', r.id);
  }

  Future<void> deleteWater(String id) async {
    await _c.from('water_records').delete().eq('id', id);
  }

  Future<ElectricityRecord> insertElectricity(ElectricityRecord r) async {
    final row = Map<String, dynamic>.from(await _c
        .from('electricity_records')
        .insert(r.toInsert())
        .select()
        .single());
    return ElectricityRecord.fromRow(row);
  }

  Future<void> updateElectricity(ElectricityRecord r) async {
    await _c.from('electricity_records').update(r.toUpdate()).eq('id', r.id);
  }

  Future<void> deleteElectricity(String id) async {
    await _c.from('electricity_records').delete().eq('id', id);
  }

  Future<InternetRecord> insertInternet(InternetRecord r) async {
    final row = Map<String, dynamic>.from(await _c
        .from('internet_records')
        .insert(r.toInsert())
        .select()
        .single());
    return InternetRecord.fromRow(row);
  }

  Future<void> updateInternet(InternetRecord r) async {
    await _c.from('internet_records').update(r.toUpdate()).eq('id', r.id);
  }

  Future<void> deleteInternet(String id) async {
    await _c.from('internet_records').delete().eq('id', id);
  }
}
