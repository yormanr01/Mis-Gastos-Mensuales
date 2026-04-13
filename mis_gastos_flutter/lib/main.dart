import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mis_gastos_flutter/bootstrap/url_strategy_stub.dart'
    if (dart.library.html) 'package:mis_gastos_flutter/bootstrap/url_strategy_web.dart'
        as url_strategy;
import 'package:mis_gastos_flutter/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_flutter/firebase_options.dart';
import 'package:mis_gastos_flutter/mis_gastos_app.dart';
import 'package:mis_gastos_flutter/repositories/auth_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  url_strategy.configureUrlStrategy();

  if (DefaultFirebaseOptions.web.projectId.isEmpty && kDebugMode) {
    debugPrint(
      'Firebase: define FIREBASE_* con --dart-define (ver scripts/netlify-build-flutter.sh).',
    );
  }

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  final authRepository = AuthRepository();
  final authBloc = AuthBloc(authRepository);

  runApp(MisGastosApp(authBloc: authBloc));
}
