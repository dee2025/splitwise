import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/api_client.dart';
import '../../shared/providers.dart';

final _emailPattern = RegExp(
  r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$",
);

String? validateEmailAddress(String? value) {
  final email = (value ?? '').trim();
  if (email.isEmpty) return 'Email is required';
  if (email.length > 254 ||
      email.contains('..') ||
      !_emailPattern.hasMatch(email)) {
    return 'Enter a valid email address';
  }
  return null;
}

String? validateNewPassword(String? value) {
  final password = value ?? '';
  if (password.isEmpty) return 'Password is required';
  if (password.length < 8) return 'Use at least 8 characters';
  if (password.length > 72) return 'Use no more than 72 characters';
  if (!RegExp(r'[a-zA-Z]').hasMatch(password) ||
      !RegExp(r'[0-9]').hasMatch(password)) {
    return 'Include at least one letter and one number';
  }
  const commonPasswords = {
    'password',
    'password1',
    'password123',
    '12345678',
    '123456789',
    'qwerty123',
    'admin123',
    'moneysplit',
  };
  if (commonPasswords.contains(password.toLowerCase())) {
    return 'Choose a less common password';
  }
  return null;
}

String? validateLoginPassword(String? value) {
  final password = value ?? '';
  if (password.isEmpty) return 'Password is required';
  if (password.length > 256) return 'Password is too long';
  return null;
}

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
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.email],
              autocorrect: false,
              enableSuggestions: false,
              decoration: const InputDecoration(
                  labelText: 'Email address',
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.mail_outline)),
              validator: validateEmailAddress,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _password,
              obscureText: !_showPassword,
              textInputAction: TextInputAction.done,
              autofillHints: const [AutofillHints.password],
              enableSuggestions: false,
              autocorrect: false,
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
              validator: validateLoginPassword,
              onFieldSubmitted: (_) => _submitLogin(auth.submitting),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: auth.submitting
                    ? null
                    : () => context.go(
                          '/forgot-password',
                          extra: _email.text.trim(),
                        ),
                child: const Text('Forgot password?'),
              ),
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
                      _submitLogin(false);
                    },
              child: auth.submitting
                  ? const ButtonSpinner()
                  : const Text('Sign in securely'),
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

  void _submitLogin(bool submitting) {
    if (submitting || _formKey.currentState?.validate() != true) return;
    FocusScope.of(context).unfocus();
    ref.read(authControllerProvider.notifier).login(
          email: _email.text,
          password: _password.text,
        );
  }
}

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({this.initialEmail = '', super.key});

  final String initialEmail;

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();
  late final TextEditingController _email;
  final _otp = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _codeSent = false;
  bool _showPassword = false;
  int _resendSeconds = 0;
  Timer? _resendTimer;

  @override
  void initState() {
    super.initState();
    _email = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    _email.dispose();
    _otp.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _resendTimer?.cancel();
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
      title: 'Reset password',
      subtitle: _codeSent
          ? 'Enter the code from your email and choose a new password'
          : 'We will email you a secure reset code',
      child: _codeSent
          ? Form(
              key: _resetFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Code sent to ${_email.text.trim()}',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _otp,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    decoration: const InputDecoration(
                      labelText: '6-digit reset code',
                      counterText: '',
                      prefixIcon: Icon(Icons.password_outlined),
                    ),
                    validator: (value) => (value ?? '').trim().length == 6
                        ? null
                        : 'Enter the 6-digit code',
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _password,
                    obscureText: !_showPassword,
                    autofillHints: const [AutofillHints.newPassword],
                    enableSuggestions: false,
                    autocorrect: false,
                    decoration: InputDecoration(
                      labelText: 'New password',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        onPressed: () =>
                            setState(() => _showPassword = !_showPassword),
                        icon: Icon(_showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                      ),
                    ),
                    validator: validateNewPassword,
                  ),
                  const SizedBox(height: 10),
                  PasswordRequirements(password: _password),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _confirmPassword,
                    obscureText: !_showPassword,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: const InputDecoration(
                      labelText: 'Confirm new password',
                      prefixIcon: Icon(Icons.lock_reset_outlined),
                    ),
                    validator: (value) => value == _password.text
                        ? null
                        : (value ?? '').isEmpty
                            ? 'Confirm your new password'
                            : 'Passwords do not match',
                  ),
                  const SizedBox(height: 22),
                  FilledButton(
                    onPressed: auth.submitting ? null : _submitReset,
                    child: auth.submitting
                        ? const ButtonSpinner()
                        : const Text('Reset password'),
                  ),
                  TextButton(
                    onPressed: auth.submitting || _resendSeconds > 0
                        ? null
                        : _sendCode,
                    child: Text(_resendSeconds > 0
                        ? 'Resend code in ${_resendSeconds}s'
                        : 'Resend code'),
                  ),
                  TextButton(
                    onPressed: auth.submitting
                        ? null
                        : () => setState(() => _codeSent = false),
                    child: const Text('Use a different email'),
                  ),
                ],
              ),
            )
          : Form(
              key: _emailFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    autocorrect: false,
                    enableSuggestions: false,
                    decoration: const InputDecoration(
                      labelText: 'Email address',
                      prefixIcon: Icon(Icons.mail_outline),
                    ),
                    validator: validateEmailAddress,
                  ),
                  const SizedBox(height: 22),
                  FilledButton(
                    onPressed: auth.submitting ? null : _sendCode,
                    child: auth.submitting
                        ? const ButtonSpinner()
                        : const Text('Send reset code'),
                  ),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('Back to login'),
                  ),
                ],
              ),
            ),
    );
  }

  Future<void> _sendCode() async {
    if (!_codeSent && _emailFormKey.currentState?.validate() != true) return;
    final sent = await ref
        .read(authControllerProvider.notifier)
        .requestPasswordReset(_email.text);
    if (!mounted || !sent) return;
    setState(() => _codeSent = true);
    _startResendCooldown();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('If the account exists, a reset code was sent.')),
    );
  }

  void _startResendCooldown() {
    _resendTimer?.cancel();
    setState(() => _resendSeconds = 60);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _resendSeconds <= 1) {
        timer.cancel();
        if (mounted) setState(() => _resendSeconds = 0);
        return;
      }
      setState(() => _resendSeconds -= 1);
    });
  }

  Future<void> _submitReset() async {
    if (_resetFormKey.currentState?.validate() != true) return;
    final reset = await ref.read(authControllerProvider.notifier).resetPassword(
          email: _email.text,
          otp: _otp.text,
          newPassword: _password.text,
        );
    if (!mounted || !reset) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Password reset. Sign in to continue.')),
    );
    context.go('/login');
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
  final _confirmPassword = TextEditingController();
  bool _showPassword = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
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
                    autofillHints: const [AutofillHints.name],
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                        labelText: 'Full name',
                        prefixIcon: Icon(Icons.person_outline)),
                    validator: (value) {
                      final name = (value ?? '').trim();
                      if (name.length < 2) {
                        return 'Enter your full name';
                      }
                      if (name.length > 80) return 'Use 80 characters or fewer';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    autocorrect: false,
                    enableSuggestions: false,
                    decoration: const InputDecoration(
                        labelText: 'Email address',
                        prefixIcon: Icon(Icons.mail_outline)),
                    validator: validateEmailAddress,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _password,
                    obscureText: !_showPassword,
                    autofillHints: const [AutofillHints.newPassword],
                    enableSuggestions: false,
                    autocorrect: false,
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
                    validator: validateNewPassword,
                  ),
                  const SizedBox(height: 10),
                  PasswordRequirements(password: _password),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: _confirmPassword,
                    obscureText: !_showPassword,
                    textInputAction: TextInputAction.done,
                    autofillHints: const [AutofillHints.newPassword],
                    decoration: const InputDecoration(
                      labelText: 'Confirm password',
                      prefixIcon: Icon(Icons.lock_reset_outlined),
                    ),
                    validator: (value) {
                      if ((value ?? '').isEmpty) return 'Confirm your password';
                      if (value != _password.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                    onFieldSubmitted: (_) => _submitSignup(auth.submitting),
                  ),
                  const SizedBox(height: 22),
                  FilledButton(
                    onPressed: auth.submitting
                        ? null
                        : () {
                            _submitSignup(false);
                          },
                    child: auth.submitting
                        ? const ButtonSpinner()
                        : const Text('Create secure account'),
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

  void _submitSignup(bool submitting) {
    if (submitting || _formKey.currentState?.validate() != true) return;
    FocusScope.of(context).unfocus();
    ref.read(authControllerProvider.notifier).signup(
          fullName: _name.text,
          email: _email.text,
          password: _password.text,
        );
  }
}

class PasswordRequirements extends StatelessWidget {
  const PasswordRequirements({required this.password, super.key});

  final TextEditingController password;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: password,
      builder: (context, value, _) {
        final checks = [
          ('8+ characters', value.text.length >= 8),
          ('One letter', RegExp(r'[a-zA-Z]').hasMatch(value.text)),
          ('One number', RegExp(r'[0-9]').hasMatch(value.text)),
        ];
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: checks.map((check) {
            final passed = check.$2;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
              decoration: BoxDecoration(
                color:
                    passed ? const Color(0xffecfdf5) : const Color(0xfff8fafc),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                    color: passed
                        ? const Color(0xffa7f3d0)
                        : const Color(0xffe2e8f0)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(passed ? Icons.check_circle : Icons.circle_outlined,
                      size: 13,
                      color: passed
                          ? const Color(0xff059669)
                          : const Color(0xff94a3b8)),
                  const SizedBox(width: 5),
                  Text(check.$1,
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: passed
                              ? const Color(0xff047857)
                              : const Color(0xff64748b))),
                ],
              ),
            );
          }).toList(),
        );
      },
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
    final authTheme = ThemeData(
      useMaterial3: true,
      fontFamily: 'Roboto',
      colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xff059669), brightness: Brightness.light),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xfff8fafc),
        labelStyle: const TextStyle(
            color: Color(0xff475569), fontWeight: FontWeight.w600),
        hintStyle: const TextStyle(color: Color(0xff94a3b8)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 17),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xffe2e8f0))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xffe2e8f0))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xff10b981), width: 1.5)),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xfff43f5e))),
      ),
      filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              textStyle: const TextStyle(
                  fontFamily: 'Roboto',
                  fontWeight: FontWeight.w800,
                  fontSize: 15))),
      outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              side: const BorderSide(color: Color(0xffe2e8f0)),
              textStyle: const TextStyle(
                  fontFamily: 'Roboto', fontWeight: FontWeight.w700))),
    );

    return Theme(
      data: authTheme,
      child: Scaffold(
        body: DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xff061b17),
                  Color(0xff0b2f27),
                  Color(0xff07111d)
                ]),
          ),
          child: Stack(
            children: [
              Positioned(
                  top: -90,
                  right: -70,
                  child: Container(
                      width: 240,
                      height: 240,
                      decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: const Color(0xff34d399)
                                  .withValues(alpha: .08),
                              width: 38)))),
              SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 460),
                      child: Column(
                        children: [
                          Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const CircleAvatar(
                                    radius: 23,
                                    backgroundColor: Color(0xff10b981),
                                    backgroundImage:
                                        NetworkImage('$apiBaseUrl/logo.png')),
                                const SizedBox(width: 12),
                                const Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('MoneySplit',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18,
                                              fontWeight: FontWeight.w800)),
                                      Text('SECURE ACCESS',
                                          style: TextStyle(
                                              color: Color(0xff6ee7b7),
                                              fontSize: 9,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 1.5))
                                    ]),
                              ]),
                          const SizedBox(height: 28),
                          Text(title,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 30,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -1)),
                          const SizedBox(height: 8),
                          Text(subtitle,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  color: Color(0xffa7c4bc),
                                  fontSize: 14,
                                  height: 1.5)),
                          const SizedBox(height: 24),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(22),
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(26),
                                border: Border.all(
                                    color: Colors.white.withValues(alpha: .8)),
                                boxShadow: const [
                                  BoxShadow(
                                      color: Color(0x40000000),
                                      blurRadius: 45,
                                      offset: Offset(0, 22))
                                ]),
                            child: child,
                          ),
                          const SizedBox(height: 18),
                          const Wrap(
                            alignment: WrapAlignment.center,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 7,
                            runSpacing: 4,
                            children: [
                              Icon(Icons.verified_user_outlined,
                                  size: 15, color: Color(0xff6ee7b7)),
                              Text('Protected with encrypted authentication',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      color: Color(0xff94a3b8),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
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
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
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
