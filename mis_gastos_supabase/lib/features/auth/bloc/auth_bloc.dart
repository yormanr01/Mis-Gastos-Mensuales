import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_event.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:mis_gastos_supabase/repositories/auth_repository_supabase.dart'
    show AppAuthException, AuthRepositorySupabase;

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc(this._repository) : super(const AuthInitial()) {
    on<AuthUserChanged>(_onUserChanged);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthProfileRefreshRequested>(_onProfileRefreshRequested);
    on<AuthPasswordUpdateRequested>(_onPasswordUpdateRequested);
    _userSub = _repository.userStream.listen((user) {
      add(AuthUserChanged(user));
    });
  }

  Future<void> _onProfileRefreshRequested(
    AuthProfileRefreshRequested event,
    Emitter<AuthState> emit,
  ) async {
    final user = await _repository.getCurrentUser();
    if (user != null) {
      emit(AuthAuthenticated(user));
    }
  }

  Future<void> _onPasswordUpdateRequested(
    AuthPasswordUpdateRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _repository.updatePassword(event.newPassword);
      // Tras cambiar contraseña, el usuario sigue Auth, 
      // pero el Bloc puede emitir el mismo estado para confirmar éxito si fuera necesario.
      // Aquí el listener en la UI capturará el éxito al no haber excepción.
    } catch (e) {
      // Si quisiéramos un estado de error específico para password lo haríamos,
      // pero por ahora lanzamos la excepción para el BlocListener o try/catch en UI.
      rethrow;
    }
  }

  final AuthRepositorySupabase _repository;
  StreamSubscription<AppUser?>? _userSub;

  void _onUserChanged(AuthUserChanged event, Emitter<AuthState> emit) {
    if (event.user != null) {
      emit(AuthAuthenticated(event.user!));
    } else {
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _repository.signOut();
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoginInProgress());
    try {
      await _repository.signInWithEmailAndPassword(
        email: event.email,
        password: event.password,
      );
    } on AppAuthException catch (e) {
      emit(AuthUnauthenticated(loginError: e.message));
    } catch (_) {
      emit(const AuthUnauthenticated(loginError: 'Error al iniciar sesión.'));
    }
  }

  @override
  Future<void> close() {
    _userSub?.cancel();
    return super.close();
  }
}
