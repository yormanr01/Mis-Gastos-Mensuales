import 'package:equatable/equatable.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';

sealed class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.user);

  final AppUser user;

  @override
  List<Object?> get props => [user];
}

final class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated({this.loginError});

  final String? loginError;

  @override
  List<Object?> get props => [loginError];
}

final class AuthLoginInProgress extends AuthState {
  const AuthLoginInProgress();
}
