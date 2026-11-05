import 'package:flutter_test/flutter_test.dart';
import 'package:moneysplit_mobile/src/features/auth/auth_screens.dart';

void main() {
  group('email validation', () {
    test('accepts normal and tagged addresses', () {
      expect(validateEmailAddress('person@example.com'), isNull);
      expect(validateEmailAddress('first.last+tag@sub.example.co.in'), isNull);
    });

    test('rejects malformed addresses', () {
      for (final email in [
        '',
        'person@',
        '@example.com',
        'a..b@example.com',
        'person@example'
      ]) {
        expect(validateEmailAddress(email), isNotNull, reason: email);
      }
    });
  });

  group('password validation', () {
    test('requires length, a letter, and a number for new passwords', () {
      expect(validateNewPassword('Secure123'), isNull);
      expect(validateNewPassword('short1'), isNotNull);
      expect(validateNewPassword('abcdefgh'), isNotNull);
      expect(validateNewPassword('12345678'), isNotNull);
      expect(validateNewPassword('password123'), isNotNull);
    });

    test('does not apply new-password rules to existing account login', () {
      expect(validateLoginPassword('abc123'), isNull);
      expect(validateLoginPassword(''), isNotNull);
    });
  });
}
