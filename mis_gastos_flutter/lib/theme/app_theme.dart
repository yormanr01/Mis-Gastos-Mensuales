import 'package:flutter/material.dart';

/// Paleta alineada con docs/blueprint.md (cielo, gris claro, teal).
abstract final class AppColors {
  static const Color skyBlue = Color(0xFF87CEEB);
  static const Color aliceBlue = Color(0xFFF0F8FF);
  static const Color teal = Color(0xFF008080);
}

ThemeData buildAppTheme({Brightness brightness = Brightness.light}) {
  final seed = AppColors.teal;
  final base = ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: ColorScheme.fromSeed(
      seedColor: seed,
      brightness: brightness,
      primary: AppColors.teal,
      secondary: AppColors.skyBlue,
      surface: AppColors.aliceBlue,
    ),
  );
  return base.copyWith(
    scaffoldBackgroundColor: AppColors.aliceBlue,
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
      filled: true,
    ),
  );
}
