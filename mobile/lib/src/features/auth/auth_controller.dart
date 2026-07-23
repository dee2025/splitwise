import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../shared/api_client.dart';
import '../../shared/models.dart';

const googleServerClientId = String.fromEnvironment(
  'GOOGLE_SERVER_CLIENT_ID',
  defaultValue: '888884092284-kvpqvogq4ks1h7m437e3u9d5tkadefvt.apps.googleusercontent.com',
);

class AuthState {
  const AuthState({
    this.loading = true,
    this.submitting = false,
    this.user,
    this.error,
    this.verificationEmail,
  });

  final bool loading;
  final bool submitting;
  final AppUser? user;
  final String? error;
  final String? verificationEmail;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    bool? loading,
    bool? submitting,
    AppUser? user,
    bool clearUser = false,
    String? error,
    bool clearError = false,
    String? verificationEmail,
    bool clearVerificationEmail = false,
  }) {
    return AuthState(
      loading: loading ?? this.loading,
      submitting: submitting ?? this.submitting,
      user: clearUser ? null : user ?? this.user,
      error: clearError ? null : error ?? this.error,
      verificationEmail: clearVerificationEmail ? null : verificationEmail ?? this.verificationEmail,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController({
    required MoneySplitApi api,
    required TokenStore tokenStore,
  })  : _api = api,
        _tokenStore = tokenStore,
        super(const AuthState());

  final MoneySplitApi _api;
  final TokenStore _tokenStore;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: googleServerClientId == '' ? null : googleServerClientId,
    scopes: const ['email', 'profile'],
  );

  Future<void> restore() async {
    final token = await _tokenStore.read();
    if (token == null || token.isEmpty) {
      state = const AuthState(loading: false);
      return;
    }

    try {
      final json = await _api.getJson('/api/auth/check');
      if (json['isAuthenticated'] == true && json['user'] is Map<String, dynamic>) {
        state = AuthState(loading: false, user: AppUser.fromJson(json['user'] as Map<String, dynamic>));
      } else {
        await _tokenStore.clear();
        state = const AuthState(loading: false);
      }
    } catch (_) {
      await _tokenStore.clear();
      state = const AuthState(loading: false);
    }
  }

  Future<void> login({required String email, required String password}) async {
    state = state.copyWith(submitting: true, clearError: true, clearVerificationEmail: true);
    try {
      final json = await _api.postJson('/api/auth/login', {
        'email': email.trim(),
        'password': password,
        'client': 'flutter',
      });
      await _completeAuth(json);
    } on ApiException catch (error) {
      final verificationEmail = error.statusCode == 403 && error.errors.containsKey('email') ? email.trim() : null;
      state = state.copyWith(
        submitting: false,
        error: error.message,
        verificationEmail: verificationEmail,
      );
    } catch (_) {
      state = state.copyWith(submitting: false, error: 'Login failed');
    }
  }

  Future<void> signup({
    required String fullName,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(submitting: true, clearError: true);
    try {
      final json = await _api.postJson('/api/auth/signup', {
        'fullName': fullName.trim(),
        'email': email.trim(),
        'password': password,
      });
      if (json['requiresEmailVerification'] == true) {
        final user = json['user'];
        state = state.copyWith(
          submitting: false,
          verificationEmail: user is Map<String, dynamic> ? stringOf(user['email'], fallback: email.trim()) : email.trim(),
        );
        return;
      }
      await _completeAuth(json);
    } on ApiException catch (error) {
      state = state.copyWith(submitting: false, error: error.message);
    } catch (_) {
      state = state.copyWith(submitting: false, error: 'Signup failed');
    }
  }

  Future<void> loginWithGoogle() async {
    state = state.copyWith(submitting: true, clearError: true);
    try {
      if (googleServerClientId.trim().isEmpty) {
        throw const ApiException(
          'Google server client ID is not configured. Use the Web OAuth client ID as GOOGLE_SERVER_CLIENT_ID.',
        );
      }
      final account = await _googleSignIn.signIn();
      if (account == null) {
        state = state.copyWith(submitting: false);
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw const ApiException(
          'Google sign-in did not return an ID token. Confirm GOOGLE_SERVER_CLIENT_ID is the Web OAuth client ID, not the Android client ID.',
        );
      }
      final json = await _api.postJson('/api/auth/google-login', {
        'credential': idToken,
        'client': 'flutter',
      });
      await _completeAuth(json);
    } on ApiException catch (error) {
      state = state.copyWith(submitting: false, error: error.message);
    } catch (_) {
      state = state.copyWith(submitting: false, error: 'Google sign-in failed');
    }
  }

  Future<void> resendVerification(String email) async {
    state = state.copyWith(submitting: true, clearError: true);
    try {
      await _api.postJson('/api/auth/resend-verification', {'email': email.trim()});
      state = state.copyWith(submitting: false, verificationEmail: email.trim());
    } on ApiException catch (error) {
      state = state.copyWith(submitting: false, error: error.message);
    }
  }

  Future<void> logout() async {
    try {
      await _api.postJson('/api/auth/logout', {});
    } catch (_) {
      // Local token cleanup is the important part for native logout.
    }
    await _googleSignIn.signOut();
    await _tokenStore.clear();
    state = const AuthState(loading: false);
  }

  Future<void> setUser(AppUser user) async {
    state = state.copyWith(user: user);
  }

  Future<void> _completeAuth(Map<String, dynamic> json) async {
    final token = json['token']?.toString();
    final user = json['user'];
    if (token == null || token.isEmpty || user is! Map<String, dynamic>) {
      throw const ApiException(
        'Mobile auth token was not returned by the server. Deploy the mobile-token backend changes or run the app against your local Next.js API.',
      );
    }
    await _tokenStore.write(token);
    state = AuthState(loading: false, user: AppUser.fromJson(user));
  }
}
