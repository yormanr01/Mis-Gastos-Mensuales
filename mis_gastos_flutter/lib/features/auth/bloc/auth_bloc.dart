import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:mis_gastos_flutter/features/auth/bloc/auth_event.dart';
import 'package:mis_gastos_flutter/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_flutter/models/app_user.dart';
import 'package:mis_gastos_flutter/repositories/auth_repository.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc(this._repository) : super(const AuthInitial()) {
    on<AuthUserChanged>(_onUserChanged);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<AuthLoginRequested>(_onLoginRequested);
    _userSub = _repository.userStream.listen((user) {
      add(AuthUserChanged(user));
    });
  }

  final AuthRepository _repository;
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
    } on AuthException catch (e) {
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
