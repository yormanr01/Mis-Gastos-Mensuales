import 'package:equatable/equatable.dart';

enum UserRole { edicion, visualizacion, administrador }

enum UserStatus { activo, inactivo }

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.email,
    required this.role,
    required this.status,
    this.displayName,
  });

  final String id;
  final String email;
  final String? displayName;
  final UserRole role;
  final UserStatus status;

  static UserRole roleFromDb(String? value) {
    switch (value) {
      case 'Edición':
        return UserRole.edicion;
      case 'Visualización':
        return UserRole.visualizacion;
      case 'Administrador':
        return UserRole.administrador;
      default:
        return UserRole.visualizacion;
    }
  }

  static UserStatus statusFromDb(String? value) {
    switch (value) {
      case 'Inactivo':
        return UserStatus.inactivo;
      case 'Activo':
      default:
        return UserStatus.activo;
    }
  }

  @override
  List<Object?> get props => [id, email, displayName, role, status];
}
