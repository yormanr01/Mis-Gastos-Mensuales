import 'package:mis_gastos_supabase/models/app_user.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepositorySupabase {
  AuthRepositorySupabase({SupabaseClient? client})
      : _client = client ?? Supabase.instance.client;

  final SupabaseClient _client;

  Stream<AppUser?> get userStream {
    return _client.auth.onAuthStateChange.asyncMap((data) async {
      final session = data.session;
      final user = session?.user;
      if (user == null) return null;

      final row = await _client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      if (row == null) {
        await _client.auth.signOut();
        return null;
      }

      final map = Map<String, dynamic>.from(row);
      final status = AppUser.statusFromDb(map['status'] as String?);
      if (status != UserStatus.activo) {
        await _client.auth.signOut();
        return null;
      }

      return AppUser(
        id: user.id,
        email: (map['email'] as String?) ?? user.email ?? '',
        role: AppUser.roleFromDb(map['role'] as String?),
        status: status,
      );
    });
  }

  Future<void> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      final user = res.user;
      if (user == null) {
        throw AppAuthException('No se pudo iniciar sesión.');
      }

      final row = await _client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      if (row == null) {
        await _client.auth.signOut();
        throw AppAuthException('No se encontró el perfil del usuario.');
      }

      final map = Map<String, dynamic>.from(row);
      final status = AppUser.statusFromDb(map['status'] as String?);
      if (status != UserStatus.activo) {
        await _client.auth.signOut();
        throw AppAuthException('Esta cuenta de usuario está inactiva.');
      }
    } on AppAuthException {
      rethrow;
    } on AuthApiException catch (e) {
      final msg = e.message.toLowerCase();
      if (msg.contains('invalid') ||
          msg.contains('credentials') ||
          msg.contains('email')) {
        throw AppAuthException('Credenciales inválidas. Inténtalo de nuevo.');
      }
      throw AppAuthException(e.message);
    }
  }

  Future<void> signOut() => _client.auth.signOut();
}

class AppAuthException implements Exception {
  AppAuthException(this.message);
  final String message;

  @override
  String toString() => message;
}
