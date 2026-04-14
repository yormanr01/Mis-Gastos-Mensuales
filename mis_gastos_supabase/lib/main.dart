import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mis_gastos_supabase/bootstrap/url_strategy_stub.dart'
    if (dart.library.html) 'package:mis_gastos_supabase/bootstrap/url_strategy_web.dart'
        as url_strategy;
import 'package:mis_gastos_supabase/config/supabase_env.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/mis_gastos_app.dart';
import 'package:mis_gastos_supabase/repositories/auth_repository_supabase.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  url_strategy.configureUrlStrategy();

  if (!SupabaseEnv.isConfigured) {
    if (kDebugMode) {
      debugPrint(
        'Define SUPABASE_URL y SUPABASE_ANON_KEY con --dart-define '
        '(o en Vercel → Environment Variables).',
      );
    }
    runApp(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Text(
                'Falta configurar Supabase.\n\n'
                'flutter run -d chrome \\\n'
                '  --dart-define=SUPABASE_URL=https://xxx.supabase.co \\\n'
                '  --dart-define=SUPABASE_ANON_KEY=eyJ...',
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ),
      ),
    );
    return;
  }

  await Supabase.initialize(
    url: SupabaseEnv.url,
    anonKey: SupabaseEnv.anonKey,
  );

  final authRepository = AuthRepositorySupabase();
  final authBloc = AuthBloc(authRepository);

  runApp(MisGastosApp(
    authRepository: authRepository,
    authBloc: authBloc,
  ));
}
