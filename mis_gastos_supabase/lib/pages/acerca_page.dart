import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AcercaPage extends StatelessWidget {
  const AcercaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(
          'Mis Gastos Mensuales',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 8),
        Text(
          'Aplicación web (Flutter + PWA) con Supabase para registrar '
          'consumos de agua, electricidad e internet.',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 24),
        FilledButton.tonal(
          onPressed: () => context.pop(),
          child: const Text('Volver'),
        ),
      ],
    );
  }
}
