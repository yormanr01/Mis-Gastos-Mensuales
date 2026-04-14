import 'package:flutter/material.dart';

abstract final class AppColors {
  static const Color skyBlue = Color(0xFF87CEEB);
  static const Color aliceBlue = Color(0xFFF0F8FF);
  static const Color teal = Color(0xFF008080);
}

ThemeData buildAppTheme({Brightness brightness = Brightness.light}) {
  final isDark = brightness == Brightness.dark;
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.teal,
      brightness: brightness,
      primary: AppColors.teal,
      secondary: AppColors.skyBlue,
      surface: isDark ? const Color(0xFF121212) : AppColors.aliceBlue,
    ),
  ).copyWith(
    scaffoldBackgroundColor: isDark ? const Color(0xFF121212) : AppColors.aliceBlue,
    inputDecorationTheme: InputDecorationTheme(
      border: const OutlineInputBorder(),
      filled: true,
      fillColor: isDark ? const Color(0xFF1A1A1A) : Colors.white,
    ),
  );
}
