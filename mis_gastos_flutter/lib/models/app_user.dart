import 'package:equatable/equatable.dart';

enum UserRole { edicion, visualizacion }

enum UserStatus { activo, inactivo }

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.email,
    required this.role,
    required this.status,
  });

  final String id;
  final String email;
  final UserRole role;
  final UserStatus status;

  static UserRole roleFromFirestore(String? value) {
    switch (value) {
      case 'Edición':
        return UserRole.edicion;
      case 'Visualización':
        return UserRole.visualizacion;
      default:
        return UserRole.visualizacion;
    }
  }

  static UserStatus statusFromFirestore(String? value) {
    switch (value) {
      case 'Inactivo':
        return UserStatus.inactivo;
      case 'Activo':
      default:
        return UserStatus.activo;
    }
  }

  @override
  List<Object?> get props => [id, email, role, status];
}
