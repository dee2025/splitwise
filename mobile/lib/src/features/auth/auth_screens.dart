import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.error!)));
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
              decoration: const InputDecoration(labelText: 'Email address', prefixIcon: Icon(Icons.mail_outline)),
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
                  onPressed: () => setState(() => _showPassword = !_showPassword),
                  icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                ),
              ),
              validator: (value) {
                if ((value ?? '').isEmpty) return 'Password is required';
                if ((value ?? '').length < 6) return 'Password must be at least 6 characters';
                return null;
              },
            ),
            if (auth.verificationEmail != null) ...[
              const SizedBox(height: 14),
              VerificationNotice(email: auth.verificationEmail!),
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
              child: auth.submitting ? const ButtonSpinner() : const Text('Login'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: auth.submitting ? null : () => ref.read(authControllerProvider.notifier).loginWithGoogle(),
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
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.error!)));
      }
    });
    final auth = ref.watch(authControllerProvider);

    return AuthScaffold(
      title: 'Create account',
      subtitle: 'Join MoneySplit and manage shared costs',
      child: auth.verificationEmail != null
          ? VerificationComplete(email: auth.verificationEmail!)
          : Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _name,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: 'Full name', prefixIcon: Icon(Icons.person_outline)),
                    validator: (value) {
                      if ((value ?? '').trim().length < 2) return 'Enter your full name';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(labelText: 'Email address', prefixIcon: Icon(Icons.mail_outline)),
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
                        onPressed: () => setState(() => _showPassword = !_showPassword),
                        icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                      ),
                    ),
                    validator: (value) {
                      final password = value ?? '';
                      if (password.length < 6) return 'Use at least 6 characters';
                      if (!RegExp(r'(?=.*[a-zA-Z])(?=.*[0-9])').hasMatch(password)) {
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
                            if (_formKey.currentState?.validate() != true) return;
                            ref.read(authControllerProvider.notifier).signup(
                                  fullName: _name.text,
                                  email: _email.text,
                                  password: _password.text,
                                );
                          },
                    child: auth.submitting ? const ButtonSpinner() : const Text('Sign up'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: auth.submitting ? null : () => ref.read(authControllerProvider.notifier).loginWithGoogle(),
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
                        child: Text('MS', style: TextStyle(fontWeight: FontWeight.w800)),
                      ),
                      const SizedBox(height: 18),
                      Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 6),
                      Text(subtitle, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
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

class VerificationNotice extends ConsumerWidget {
  const VerificationNotice({required this.email, super.key});

  final String email;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.35)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Email verification required', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text('Verify $email before signing in.'),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => ref.read(authControllerProvider.notifier).resendVerification(email),
                child: const Text('Resend verification email'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class VerificationComplete extends ConsumerWidget {
  const VerificationComplete({required this.email, super.key});

  final String email;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.mark_email_read_outlined, size: 56, color: Colors.greenAccent),
        const SizedBox(height: 12),
        Text('Check your inbox', textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Text('We sent a verification link to $email. The link expires in 24 hours.', textAlign: TextAlign.center),
        const SizedBox(height: 18),
        OutlinedButton(
          onPressed: () => ref.read(authControllerProvider.notifier).resendVerification(email),
          child: const Text('Resend email'),
        ),
        TextButton(
          onPressed: () => context.go('/login'),
          child: const Text('Back to login'),
        ),
      ],
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
