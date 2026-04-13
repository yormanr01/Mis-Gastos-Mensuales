/// Variables inyectadas en compilación (local y Vercel).
///
/// Local (Windows): en `mis_gastos_supabase` crea `.env` (ver `env.example`) y ejecuta
/// `.\run_web.ps1`
///
/// Manual:
/// `flutter run -d chrome --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...`
class SupabaseEnv {
  static const String url = String.fromEnvironment('SUPABASE_URL');
  static const String anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  static bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;
}
