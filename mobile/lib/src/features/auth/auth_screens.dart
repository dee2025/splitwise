import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/api_client.dart';
import '../../shared/providers.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(next.error!)));
      }
    });
    final auth = ref.watch(authControllerProvider);

    return AuthScaffold(
      title: 'Welcome back',
      subtitle: 'Sign in to continue splitting expenses',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                  labelText: 'Email address',
                  prefixIcon: Icon(Icons.mail_outline)),
              validator: (value) {
                final email = value?.trim() ?? '';
                if (email.isEmpty) return 'Email is required';
                if (!email.contains('@')) return 'Enter a valid email';
                return null;
              },
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _password,
              obscureText: !_showPassword,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  onPressed: () =>
                      setState(() => _showPassword = !_showPassword),
                  icon: Icon(_showPassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined),
                ),
              ),
              validator: (value) {
                if ((value ?? '').isEmpty) {
                  return 'Password is required';
                }
                if ((value ?? '').length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            if (auth.verificationEmail != null) ...[
              const SizedBox(height: 14),
              OtpVerificationPanel(email: auth.verificationEmail!),
            ],
            const SizedBox(height: 22),
            FilledButton(
              onPressed: auth.submitting
                  ? null
                  : () {
                      if (_formKey.currentState?.validate() != true) return;
                      ref.read(authControllerProvider.notifier).login(
                            email: _email.text,
                            password: _password.text,
                          );
                    },
              child:
                  auth.submitting ? const ButtonSpinner() : const Text('Login'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: auth.submitting
                  ? null
                  : () => ref
                      .read(authControllerProvider.notifier)
                      .loginWithGoogle(),
              icon: const Icon(Icons.g_mobiledata),
              label: const Text('Continue with Google'),
            ),
            TextButton(
              onPressed: () => context.go('/signup'),
              child: const Text('Create a new account'),
            ),
          ],
        ),
      ),
    );
  }
}

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(next.error!)));
      }
    });
    final auth = ref.watch(authControllerProvider);

    return AuthScaffold(
      title: 'Create account',
      subtitle: 'Join MoneySplit and manage shared costs',
      child: auth.verificationEmail != null
          ? OtpVerificationPanel(
              email: auth.verificationEmail!, showBackToLogin: true)
          : Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _name,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                        labelText: 'Full name',
                        prefixIcon: Icon(Icons.person_outline)),
                    validator: (value) {
                      if ((value ?? '').trim().length < 2) {
                        return 'Enter your full name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                        labelText: 'Email address',
                        prefixIcon: Icon(Icons.mail_outline)),
                    validator: (value) {
                      final email = value?.trim() ?? '';
                      if (email.isEmpty) return 'Email is required';
                      if (!email.contains('@')) return 'Enter a valid email';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _password,
                    obscureText: !_showPassword,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        onPressed: () =>
                            setState(() => _showPassword = !_showPassword),
                        icon: Icon(_showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                      ),
                    ),
                    validator: (value) {
                      final password = value ?? '';
                      if (password.length < 6) {
                        return 'Use at least 6 characters';
                      }
                      if (!RegExp(r'(?=.*[a-zA-Z])(?=.*[0-9])')
                          .hasMatch(password)) {
                        return 'Use letters and numbers';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 22),
                  FilledButton(
                    onPressed: auth.submitting
                        ? null
                        : () {
                            if (_formKey.currentState?.validate() != true) {
                              return;
                            }
                            ref.read(authControllerProvider.notifier).signup(
                                  fullName: _name.text,
                                  email: _email.text,
                                  password: _password.text,
                                );
                          },
                    child: auth.submitting
                        ? const ButtonSpinner()
                        : const Text('Sign up'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: auth.submitting
                        ? null
                        : () => ref
                            .read(authControllerProvider.notifier)
                            .loginWithGoogle(),
                    icon: const Icon(Icons.g_mobiledata),
                    label: const Text('Continue with Google'),
                  ),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('Already have an account? Login'),
                  ),
                ],
              ),
            ),
    );
  }
}

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.title,
    required this.subtitle,
    required this.child,
    super.key,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const CircleAvatar(
                        radius: 28,
                        backgroundColor: Color(0xff4f46e5),
                        backgroundImage: NetworkImage('$apiBaseUrl/logo.png'),
                      ),
                      const SizedBox(height: 18),
                      Text(title,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 6),
                      Text(subtitle,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 24),
                      child,
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class OtpVerificationPanel extends ConsumerStatefulWidget {
  const OtpVerificationPanel({
    required this.email,
    this.showBackToLogin = false,
    super.key,
  });

  final String email;
  final bool showBackToLogin;

  @override
  ConsumerState<OtpVerificationPanel> createState() =>
      _OtpVerificationPanelState();
}

class _OtpVerificationPanelState extends ConsumerState<OtpVerificationPanel> {
  final _otp = TextEditingController();

  @override
  void dispose() {
    _otp.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color:
                Theme.of(context).colorScheme.primary.withValues(alpha: 0.28)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.password_outlined, size: 42),
            const SizedBox(height: 10),
            Text('Enter verification code',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(
              'We sent a 6-digit OTP to ${widget.email}. It expires in 10 minutes.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _otp,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(fontWeight: FontWeight.w800, letterSpacing: 8),
              decoration: const InputDecoration(
                counterText: '',
                hintText: '000000',
                labelText: 'OTP',
              ),
            ),
            const SizedBox(height: 14),
            FilledButton(
              onPressed: auth.submitting ? null : _verify,
              child: auth.submitting
                  ? const ButtonSpinner()
                  : const Text('Verify and continue'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: auth.submitting
                  ? null
                  : () => ref
                      .read(authControllerProvider.notifier)
                      .resendVerification(widget.email),
              icon: const Icon(Icons.refresh_outlined),
              label: const Text('Resend code'),
            ),
            if (widget.showBackToLogin)
              TextButton(
                onPressed: () => context.go('/login'),
                child: const Text('Back to login'),
              ),
          ],
        ),
      ),
    );
  }

  void _verify() {
    if (_otp.text.trim().length != 6) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Enter the 6-digit OTP')));
      return;
    }
    ref.read(authControllerProvider.notifier).verifyEmailOtp(
          email: widget.email,
          otp: _otp.text,
        );
  }
}

class ButtonSpinner extends StatelessWidget {
  const ButtonSpinner({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 18,
      height: 18,
      child: CircularProgressIndicator(strokeWidth: 2),
    );
  }
}
