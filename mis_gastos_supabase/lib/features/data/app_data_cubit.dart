import 'dart:async';
import 'dart:math';

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
    this.successMessage,
    this.pendingChanges = 0,
    this.syncing = false,
  });

  final List<WaterRecord> water;
  final List<ElectricityRecord> electricity;
  final List<InternetRecord> internet;
  final FixedValues fixedValues;
  final bool loading;
  final String? errorMessage;
  final String? successMessage;
  final int pendingChanges;
  final bool syncing;

  AppDataState copyWith({
    List<WaterRecord>? water,
    List<ElectricityRecord>? electricity,
    List<InternetRecord>? internet,
    FixedValues? fixedValues,
    bool? loading,
    String? errorMessage,
    bool clearError = false,
    String? successMessage,
    bool clearSuccess = false,
    int? pendingChanges,
    bool? syncing,
  }) {
    return AppDataState(
      water: water ?? this.water,
      electricity: electricity ?? this.electricity,
      internet: internet ?? this.internet,
      fixedValues: fixedValues ?? this.fixedValues,
      loading: loading ?? this.loading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess
          ? null
          : (successMessage ?? this.successMessage),
      pendingChanges: pendingChanges ?? this.pendingChanges,
      syncing: syncing ?? this.syncing,
    );
  }

  @override
  List<Object?> get props => [
    water,
    electricity,
    internet,
    fixedValues,
    loading,
    errorMessage,
    successMessage,
    pendingChanges,
    syncing,
  ];
}

class AppDataCubit extends Cubit<AppDataState> {
  AppDataCubit(this._repo) : super(const AppDataState()) {
    _syncTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      syncPendingChanges(silent: true);
    });
  }

  final RecordsRepository _repo;
  late final Timer _syncTimer;

  void clearError() => emit(state.copyWith(clearError: true));
  void clearSuccess() => emit(state.copyWith(clearSuccess: true));

  Future<void> loadAll() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      await _repo.syncPendingChanges();
      final w = await _repo.fetchWater();
      final e = await _repo.fetchElectricity();
      final i = await _repo.fetchInternet();
      final f = await _repo.fetchFixedValues();
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          water: w,
          electricity: e,
          internet: i,
          fixedValues: f,
          loading: false,
          pendingChanges: pending,
        ),
      );
    } catch (e) {
      emit(
        state.copyWith(
          loading: false,
          errorMessage: 'No se pudieron cargar los datos: $e',
        ),
      );
    }
  }

  void clearData() {
    emit(const AppDataState());
  }

  @override
  Future<void> close() {
    _syncTimer.cancel();
    return super.close();
  }

  Future<void> syncPendingChanges({bool silent = false}) async {
    if (state.syncing) return;
    emit(state.copyWith(syncing: true));
    try {
      final synced = await _repo.syncPendingChanges();
      final pending = await _repo.pendingOperationsCount();
      if (synced > 0) {
        final w = await _repo.fetchWater();
        final e = await _repo.fetchElectricity();
        final i = await _repo.fetchInternet();
        final f = await _repo.fetchFixedValues();
        emit(
          state.copyWith(
            water: w,
            electricity: e,
            internet: i,
            fixedValues: f,
            pendingChanges: pending,
            syncing: false,
            successMessage: silent
                ? state.successMessage
                : 'Se sincronizaron $synced cambios pendientes.',
          ),
        );
        return;
      }
      emit(state.copyWith(pendingChanges: pending, syncing: false));
    } catch (_) {
      emit(state.copyWith(syncing: false));
    }
  }

  Future<void> saveFixedValues(FixedValues v) async {
    try {
      await _repo.updateFixedValues(v);
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          fixedValues: v,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Ajustes guardados localmente. Se sincronizarán al reconectar.'
              : null,
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: 'Error al guardar ajustes: $e'));
    }
  }

  Future<void> addWater(WaterRecord draft) async {
    final dup = state.water.any(
      (r) => r.year == draft.year && r.month == draft.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe un registro de agua para ${draft.month} ${draft.year}.',
        ),
      );
      return;
    }
    try {
      final created = await _repo.insertWater(_ensureWaterId(draft));
      final list = [...state.water, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          water: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Registro de agua guardado localmente. Se sincronizará al reconectar.'
              : 'Registro de agua agregado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateWater(WaterRecord r) async {
    final dup = state.water.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe otro registro de agua para ${r.month} ${r.year}.',
        ),
      );
      return;
    }
    try {
      await _repo.updateWater(r);
      final list = state.water.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          water: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Actualización de agua guardada localmente. Se sincronizará al reconectar.'
              : 'Registro de agua actualizado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteWater(String id) async {
    try {
      await _repo.deleteWater(id);
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          water: state.water.where((x) => x.id != id).toList(),
          pendingChanges: pending,
          clearError: true,
          successMessage: pending > 0
              ? 'Eliminación de agua pendiente de sincronización.'
              : 'Registro de agua eliminado.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> addElectricity(ElectricityRecord draft) async {
    final dup = state.electricity.any(
      (r) => r.year == draft.year && r.month == draft.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe un registro de electricidad para ${draft.month} ${draft.year}.',
        ),
      );
      return;
    }
    try {
      final created = await _repo.insertElectricity(
        _ensureElectricityId(draft),
      );
      final list = [...state.electricity, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          electricity: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Registro de electricidad guardado localmente. Se sincronizará al reconectar.'
              : 'Registro de electricidad agregado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateElectricity(ElectricityRecord r) async {
    final dup = state.electricity.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe otro registro de electricidad para ${r.month} ${r.year}.',
        ),
      );
      return;
    }
    try {
      await _repo.updateElectricity(r);
      final list = state.electricity.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          electricity: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Actualización de electricidad guardada localmente. Se sincronizará al reconectar.'
              : 'Registro de electricidad actualizado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteElectricity(String id) async {
    try {
      await _repo.deleteElectricity(id);
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          electricity: state.electricity.where((x) => x.id != id).toList(),
          pendingChanges: pending,
          clearError: true,
          successMessage: pending > 0
              ? 'Eliminación de electricidad pendiente de sincronización.'
              : 'Registro de electricidad eliminado.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> addInternet(InternetRecord draft) async {
    final dup = state.internet.any(
      (r) => r.year == draft.year && r.month == draft.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe un registro de internet para ${draft.month} ${draft.year}.',
        ),
      );
      return;
    }
    try {
      final created = await _repo.insertInternet(_ensureInternetId(draft));
      final list = [...state.internet, created];
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          internet: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Registro de internet guardado localmente. Se sincronizará al reconectar.'
              : 'Registro de internet agregado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> updateInternet(InternetRecord r) async {
    final dup = state.internet.any(
      (x) => x.id != r.id && x.year == r.year && x.month == r.month,
    );
    if (dup) {
      emit(
        state.copyWith(
          errorMessage:
              'Ya existe otro registro de internet para ${r.month} ${r.year}.',
        ),
      );
      return;
    }
    try {
      await _repo.updateInternet(r);
      final list = state.internet.map((x) => x.id == r.id ? r : x).toList();
      list.sort((a, b) => _cmp(a.year, a.month, b.year, b.month));
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          internet: list,
          clearError: true,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Actualización de internet guardada localmente. Se sincronizará al reconectar.'
              : 'Registro de internet actualizado exitosamente.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> deleteInternet(String id) async {
    try {
      await _repo.deleteInternet(id);
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          internet: state.internet.where((x) => x.id != id).toList(),
          pendingChanges: pending,
          clearError: true,
          successMessage: pending > 0
              ? 'Eliminación de internet pendiente de sincronización.'
              : 'Registro de internet eliminado.',
        ),
      );
    } catch (e) {
      emit(state.copyWith(errorMessage: '$e'));
    }
  }

  Future<void> restoreBackup({
    required List<WaterRecord> water,
    required List<ElectricityRecord> electricity,
    required List<InternetRecord> internet,
    required FixedValues fixedValues,
  }) async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final safeWater = water.map(_ensureWaterId).toList();
      final safeElectricity = electricity.map(_ensureElectricityId).toList();
      final safeInternet = internet.map(_ensureInternetId).toList();
      await _repo.restoreBackup(
        water: safeWater,
        electricity: safeElectricity,
        internet: safeInternet,
        fixedValues: fixedValues,
      );
      await syncPendingChanges(silent: true);
      final refreshedWater = await _repo.fetchWater();
      final refreshedElectricity = await _repo.fetchElectricity();
      final refreshedInternet = await _repo.fetchInternet();
      final refreshedFixed = await _repo.fetchFixedValues();
      final pending = await _repo.pendingOperationsCount();
      emit(
        state.copyWith(
          loading: false,
          water: refreshedWater,
          electricity: refreshedElectricity,
          internet: refreshedInternet,
          fixedValues: refreshedFixed,
          pendingChanges: pending,
          successMessage: pending > 0
              ? 'Respaldo restaurado localmente. Pendiente de sincronización.'
              : 'Respaldo restaurado correctamente.',
        ),
      );
    } catch (e) {
      emit(
        state.copyWith(
          loading: false,
          errorMessage: 'No se pudo restaurar el respaldo: $e',
        ),
      );
    }
  }

  int _cmp(int y1, String m1, int y2, String m2) {
    if (y1 != y2) return y2.compareTo(y1);
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months.indexOf(m2).compareTo(months.indexOf(m1));
  }

  String _tempId() {
    final rng = Random();
    String hex(int n) =>
        List.generate(n, (_) => rng.nextInt(16).toRadixString(16)).join();
    return '${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + rng.nextInt(4)).toRadixString(16)}${hex(3)}-${hex(12)}';
  }

  WaterRecord _ensureWaterId(WaterRecord r) => r.id.isNotEmpty
      ? r
      : WaterRecord(
          id: _tempId(),
          year: r.year,
          month: r.month,
          totalInvoiced: r.totalInvoiced,
          discount: r.discount,
          totalToPay: r.totalToPay,
          status: r.status,
        );

  ElectricityRecord _ensureElectricityId(ElectricityRecord r) => r.id.isNotEmpty
      ? r
      : ElectricityRecord(
          id: _tempId(),
          year: r.year,
          month: r.month,
          totalInvoiced: r.totalInvoiced,
          kwhConsumption: r.kwhConsumption,
          kwhCost: r.kwhCost,
          previousMeter: r.previousMeter,
          currentMeter: r.currentMeter,
          consumptionMeter: r.consumptionMeter,
          discount: r.discount,
          totalToPay: r.totalToPay,
          status: r.status,
        );

  InternetRecord _ensureInternetId(InternetRecord r) => r.id.isNotEmpty
      ? r
      : InternetRecord(
          id: _tempId(),
          year: r.year,
          month: r.month,
          monthlyCost: r.monthlyCost,
          discount: r.discount,
          totalToPay: r.totalToPay,
          status: r.status,
        );
}
