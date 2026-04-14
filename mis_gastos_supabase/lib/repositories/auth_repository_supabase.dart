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
        displayName: map['display_name'] as String?,
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

  Future<AppUser?> getCurrentUser() async {
    final user = _client.auth.currentUser;
    if (user == null) return null;

    final row = await _client
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();

    if (row == null) return null;

    final map = Map<String, dynamic>.from(row);
    return AppUser(
      id: user.id,
      email: (map['email'] as String?) ?? user.email ?? '',
      displayName: map['display_name'] as String?,
      role: AppUser.roleFromDb(map['role'] as String?),
      status: AppUser.statusFromDb(map['status'] as String?),
    );
  }

  Future<void> updatePassword(String newPassword) async {
    try {
      await _client.auth.updateUser(UserAttributes(password: newPassword));
    } catch (e) {
      throw AppAuthException('No se pudo actualizar la contraseña: $e');
    }
  }

  Future<void> adminUpdateUserPassword(String userId, String newPassword) async {
    try {
      await _client.functions.invoke(
        'admin-change-password',
        body: {'userId': userId, 'newPassword': newPassword},
      );
    } catch (e) {
      throw AppAuthException('Fallo administrativo: $e');
    }
  }

  Future<void> adminDeleteUser(String userId) async {
    try {
      await _client.functions.invoke(
        'admin-delete-user',
        body: {'userId': userId},
      );
    } catch (e) {
      throw AppAuthException('Fallo al eliminar usuario: $e');
    }
  }
}

class AppAuthException implements Exception {
  AppAuthException(this.message);
  final String message;

  @override
  String toString() => message;
}
