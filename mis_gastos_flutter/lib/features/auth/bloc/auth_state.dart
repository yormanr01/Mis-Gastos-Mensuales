import 'package:equatable/equatable.dart';
import 'package:mis_gastos_flutter/models/app_user.dart';

sealed class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Esperando el primer evento del stream de Firebase Auth.
final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.user);

  final AppUser user;

  @override
  List<Object?> get props => [user];
}

/// Sin sesión (o sesión cerrada tras perfil inválido / inactivo).
final class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated({this.loginError});

  final String? loginError;

  @override
  List<Object?> get props => [loginError];
}

final class AuthLoginInProgress extends AuthState {
  const AuthLoginInProgress();
}
