import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:mis_gastos_supabase/models/app_user.dart';

bool canEditContent(BuildContext context) {
  final s = context.read<AuthBloc>().state;
  return s is AuthAuthenticated && s.user.role == UserRole.edicion;
}

AuthAuthenticated? currentUser(BuildContext context) {
  final s = context.read<AuthBloc>().state;
  return s is AuthAuthenticated ? s : null;
}
