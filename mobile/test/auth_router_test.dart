import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:moneysplit_mobile/src/app.dart';
import 'package:moneysplit_mobile/src/features/auth/auth_controller.dart';
import 'package:moneysplit_mobile/src/shared/api_client.dart';
import 'package:moneysplit_mobile/src/shared/providers.dart';

class _FakeAuthController extends AuthController {
  _FakeAuthController()
      : super(
          api: MoneySplitApi(TokenStore(const FlutterSecureStorage())),
          tokenStore: TokenStore(const FlutterSecureStorage()),
        ) {
    state = const AuthState(loading: false);
  }

  void setSubmitting(bool submitting) {
    state = state.copyWith(submitting: submitting);
  }
}

void main() {
  testWidgets('auth state updates keep the forgot-password route open',
      (tester) async {
    final previousFlutterErrorHandler = FlutterError.onError;
    FlutterError.onError = (details) {
      if (details.exception is NetworkImageLoadException) return;
      previousFlutterErrorHandler?.call(details);
    };
    addTearDown(() => FlutterError.onError = previousFlutterErrorHandler);

    final auth = _FakeAuthController();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith((ref) => auth),
        ],
        child: const MoneySplitApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
    await tester.tap(find.text('Forgot password?'));
    await tester.pumpAndSettle();
    expect(find.text('Reset password'), findsOneWidget);

    auth.setSubmitting(true);
    await tester.pump();

    expect(find.text('Reset password'), findsOneWidget);
    expect(find.text('Login'), findsNothing);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
