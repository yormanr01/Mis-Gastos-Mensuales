import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Configuración inyectada en tiempo de compilación (local y Netlify).
///
/// Local (PowerShell):
/// `flutter run -d chrome --dart-define=FIREBASE_API_KEY=... --dart-define=...`
///
/// Netlify: el script `scripts/netlify-build-flutter.sh` mapea
/// `NEXT_PUBLIC_FIREBASE_*` a estas claves.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (!kIsWeb) {
      throw UnsupportedError('Este proyecto solo está configurado para web.');
    }
    return web;
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: String.fromEnvironment('FIREBASE_API_KEY'),
    appId: String.fromEnvironment('FIREBASE_APP_ID'),
    messagingSenderId: String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID'),
    projectId: String.fromEnvironment('FIREBASE_PROJECT_ID'),
    authDomain: String.fromEnvironment('FIREBASE_AUTH_DOMAIN'),
    storageBucket: String.fromEnvironment('FIREBASE_STORAGE_BUCKET'),
  );
}
