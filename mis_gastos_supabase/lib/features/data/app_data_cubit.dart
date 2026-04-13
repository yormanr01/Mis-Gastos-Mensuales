import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mis_gastos_supabase/models/records.dart';
import 'package:mis_gastos_supabase/repositories/records_repository.dart';

class AppDataState extends Equatable {
  const AppDataState({
    this.water = const [],
    this.electricity = const [],
    this.internet = const [],
    this.fixedValues = const FixedValues(),
    this.loading = false,
    this.errorMessage,
  });

  final List<WaterRecord> water;
  final List<ElectricityRecord> electricity;
  final List<InternetRecord> internet;
  final FixedValues fixedValues;
  final bool loading;
  final String? errorMessage;

  AppDataState copyWith({
    List<WaterRecord>? water,
    List<ElectricityRecord>? electricity,
    List<InternetRecord>? internet,
    FixedValues? fixedValues,
    bool? loading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AppDataState(
      water: water ?? this.water,
      electricity: electricity ?? this.electricity,
      internet: internet ?? this.internet,
      fixedValues: fixedValues ?? this.fixedValues,
      loading: loading ?? this.loading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  List<Object?> get props =>
      [water, electricity, internet, fixedValues, loading, errorMessage];
}

class AppDataCubit extends Cubit<AppDataState> {
  AppDataCubit(this._repo) : super(const AppDataState());

  final RecordsRepository _repo;

  void clearError() => emit(state.copyWith(clearError: true));

  Future<void> loadAll() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final w = await _repo.fetchWater();
      final e = await _repo.fetchElectricity();
      final i = await _repo.fetchInternet();
      final f = await _repo.fetchFixedValues();
      emit(state.copyWith(
        water: w,
        electricity: e,
        internet: i,
        fixedValues: f,
        loading: false,
      ));
    } catch (e) {
      emit(state.copyWith(
        loading: false,
        errorMessage: 'No se pudieron cargar los datos: $e',
      ));
    }
  }

  void clearData() {
    emit(const AppDataState());
  }

  Future<void> saveFixedValues(FixedValues v) async {
    try {
      await _repo.updateFixedValues(v);
      emit(state.copyWith(fixedValues: v, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Error al guardar ajustes: $e'));
    }
  }

  Future<void> addWater(WaterRecord draft) async {
    final dup = state.water.any((r) => r.year == draft.year && r.month == draft.month);
    if (dup) {
      emit(state.copyWith(
        errorMessage: 'Ya existe un registro de agua para ${draft.month} ${draft.year}.',
      ));
      return;
    }
    try {
      final created = await _repo.insertWater(draft);
      final list = [...state.water, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(water: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateWater(WaterRecord r) async {
    final dup = state.water.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(state.copyWith(
        errorMessage: 'Ya existe otro registro de agua para ${r.month} ${r.year}.',
      ));
      return;
    }
    try {
      await _repo.updateWater(r);
      final list = state.water.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(water: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteWater(String id) async {
    try {
      await _repo.deleteWater(id);
      emit(state.copyWith(
        water: state.water.where((x) => x.id != id).toList(),
        clearError: true,
      ));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> addElectricity(ElectricityRecord draft) async {
    final dup =
        state.electricity.any((r) => r.year == draft.year && r.month == draft.month);
    if (dup) {
      emit(state.copyWith(
        errorMessage:
            'Ya existe un registro de electricidad para ${draft.month} ${draft.year}.',
      ));
      return;
    }
    try {
      final created = await _repo.insertElectricity(draft);
      final list = [...state.electricity, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(electricity: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateElectricity(ElectricityRecord r) async {
    final dup = state.electricity.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(state.copyWith(
        errorMessage:
            'Ya existe otro registro de electricidad para ${r.month} ${r.year}.',
      ));
      return;
    }
    try {
      await _repo.updateElectricity(r);
      final list = state.electricity.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(electricity: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteElectricity(String id) async {
    try {
      await _repo.deleteElectricity(id);
      emit(state.copyWith(
        electricity: state.electricity.where((x) => x.id != id).toList(),
        clearError: true,
      ));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> addInternet(InternetRecord draft) async {
    final dup =
        state.internet.any((r) => r.year == draft.year && r.month == draft.month);
    if (dup) {
      emit(state.copyWith(
        errorMessage:
            'Ya existe un registro de internet para ${draft.month} ${draft.year}.',
      ));
      return;
    }
    try {
      final created = await _repo.insertInternet(draft);
      final list = [...state.internet, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(internet: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateInternet(InternetRecord r) async {
    final dup = state.internet.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(state.copyWith(
        errorMessage:
            'Ya existe otro registro de internet para ${r.month} ${r.year}.',
      ));
      return;
    }
    try {
      await _repo.updateInternet(r);
      final list = state.internet.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      emit(state.copyWith(internet: list, clearError: true));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteInternet(String id) async {
    try {
      await _repo.deleteInternet(id);
      emit(state.copyWith(
        internet: state.internet.where((x) => x.id != id).toList(),
        clearError: true,
      ));
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  int _cmp(int y1, String m1, int y2, String m2) {
    if (y1 != y2) return y2.compareTo(y1);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months.indexOf(m2).compareTo(months.indexOf(m1));
  }
}
