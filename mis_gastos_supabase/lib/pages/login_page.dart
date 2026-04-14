import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mis_gastos_supabase/core/ui_utils.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_bloc.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_event.dart';
import 'package:mis_gastos_supabase/features/auth/bloc/auth_state.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _showRecoveryDialog(BuildContext context) async {
    final emailController = TextEditingController(text: _email.text);
    bool isLoading = false;
    
    await showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setState) {
            return AlertDialog(
              title: const Text('Recuperar contraseña'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Ingresa tu correo para enviarte un enlace de recuperación.'),
                  const SizedBox(height: 16),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    enabled: !isLoading,
                    decoration: const InputDecoration(labelText: 'Correo electrónico'),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isLoading ? null : () => Navigator.pop(ctx),
                  child: const Text('Cancelar'),
                ),
                FilledButton(
                  onPressed: isLoading
                      ? null
                      : () async {
                          final email = emailController.text.trim();
                          if (email.isEmpty) return;
                          
                          setState(() => isLoading = true);
                          try {
                            await Supabase.instance.client.auth.resetPasswordForEmail(email);
                            if (ctx.mounted) {
                              Navigator.pop(ctx);
                              UiUtils.showTopSnackBar(context, 'Se ha enviado el enlace de recuperación a tu correo.');
                            }
                          } catch (e) {
                            if (ctx.mounted) {
                              UiUtils.showTopSnackBar(context, 'Error al procesar la solicitud.', isError: true);
                            }
                          } finally {
                            if (ctx.mounted) {
                              setState(() => isLoading = false);
                            }
                          }
                        },
                  child: isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Enviar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                final loading = state is AuthLoginInProgress;
                final errorText = state is AuthUnauthenticated
                    ? state.loginError
                    : null;

                return Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Icon(
                        Icons.account_balance_wallet_outlined,
                        size: 56,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Mis Gastos Mensuales',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        enabled: !loading,
                        decoration: const InputDecoration(
                          labelText: 'Correo electrónico',
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Introduce tu correo.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _password,
                        obscureText: true,
                        autofillHints: const [AutofillHints.password],
                        enabled: !loading,
                        decoration: const InputDecoration(
                          labelText: 'Contraseña',
                        ),
                        validator: (v) {
                          if (v == null || v.isEmpty) {
                            return 'Introduce tu contraseña.';
                          }
                          return null;
                        },
                      ),
                      if (errorText != null) ...[
                        const SizedBox(height: 16),
                        Text(
                          errorText,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      FilledButton(
                        onPressed: loading
                            ? null
                            : () {
                                if (!_formKey.currentState!.validate()) {
                                  return;
                                }
                                context.read<AuthBloc>().add(
                                      AuthLoginRequested(
                                        email: _email.text,
                                        password: _password.text,
                                      ),
                                    );
                              },
                        child: loading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Entrar'),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: loading ? null : () => _showRecoveryDialog(context),
                        child: const Text('¿Olvidaste tu contraseña?'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
