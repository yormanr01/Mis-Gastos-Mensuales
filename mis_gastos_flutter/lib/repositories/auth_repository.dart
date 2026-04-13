import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:mis_gastos_flutter/models/app_user.dart';

class AuthRepository {
  AuthRepository({
    fb.FirebaseAuth? firebaseAuth,
    FirebaseFirestore? firestore,
  })  : _auth = firebaseAuth ?? fb.FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance;

  final fb.FirebaseAuth _auth;
  final FirebaseFirestore _firestore;

  Stream<AppUser?> get userStream {
    return _auth.authStateChanges().asyncMap(_mapFirebaseUserToAppUser);
  }

  Future<AppUser?> _mapFirebaseUserToAppUser(fb.User? user) async {
    if (user == null) return null;

    final snap = await _firestore.collection('users').doc(user.uid).get();
    if (!snap.exists) {
      await _auth.signOut();
      return null;
    }

    final data = snap.data()!;
    final status = AppUser.statusFromFirestore(data['status'] as String?);
    if (status != UserStatus.activo) {
      await _auth.signOut();
      return null;
    }

    return AppUser(
      id: user.uid,
      email: (data['email'] as String?) ?? user.email ?? '',
      role: AppUser.roleFromFirestore(data['role'] as String?),
      status: status,
    );
  }

  Future<void> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final cred = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      final user = cred.user;
      if (user == null) {
        throw AuthException('No se pudo iniciar sesión.');
      }

      final snap = await _firestore.collection('users').doc(user.uid).get();
      if (!snap.exists) {
        await _auth.signOut();
        throw AuthException('No se encontró el perfil del usuario.');
      }

      final data = snap.data()!;
      final status = AppUser.statusFromFirestore(data['status'] as String?);
      if (status != UserStatus.activo) {
        await _auth.signOut();
        throw AuthException('Esta cuenta de usuario está inactiva.');
      }
    } on fb.FirebaseAuthException catch (e) {
      if (e.code == 'invalid-credential' ||
          e.code == 'user-not-found' ||
          e.code == 'wrong-password') {
        throw AuthException('Credenciales inválidas. Inténtalo de nuevo.');
      }
      throw AuthException(e.message ?? 'Error de autenticación.');
    }
  }

  Future<void> signOut() => _auth.signOut();
}

class AuthException implements Exception {
  AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}
