import 'dart:async';

import 'package:flutter/foundation.dart';

/// Permite que [GoRouter] reevalúe `redirect` cuando cambia el stream del [AuthBloc].
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
