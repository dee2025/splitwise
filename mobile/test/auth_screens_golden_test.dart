import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:moneysplit_mobile/src/features/auth/auth_controller.dart';
import 'package:moneysplit_mobile/src/features/auth/auth_screens.dart';
import 'package:moneysplit_mobile/src/shared/api_client.dart';
import 'package:moneysplit_mobile/src/shared/providers.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = _TestHttpOverrides();
  setUpAll(() async {
    const fontRoot =
        r'C:\Users\user\flutter\bin\cache\artifacts\material_fonts';
    await _loadFont('Roboto', [
      '$fontRoot\\roboto-regular.ttf',
      '$fontRoot\\roboto-medium.ttf',
      '$fontRoot\\roboto-bold.ttf',
      '$fontRoot\\roboto-black.ttf',
    ]);
    await _loadFont('MaterialIcons', [
      '$fontRoot\\materialicons-regular.otf',
    ]);
  });

  Future<void> render(
    WidgetTester tester,
    Widget screen,
    String golden,
  ) async {
    await tester.binding.setSurfaceSize(const Size(412, 915));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    final tokenStore = TokenStore(const FlutterSecureStorage());
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(
            (ref) => AuthController(
              api: MoneySplitApi(tokenStore),
              tokenStore: tokenStore,
            ),
          ),
        ],
        child: MaterialApp(
          debugShowCheckedModeBanner: false,
          home: screen,
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 500));
    await expectLater(find.byType(MaterialApp), matchesGoldenFile(golden));
  }

  testWidgets('login screen', (tester) async {
    await render(tester, const LoginScreen(), 'goldens/app-login.png');
  });

  testWidgets('signup screen', (tester) async {
    await render(tester, const SignupScreen(), 'goldens/app-signup.png');
  });
}

Future<void> _loadFont(String family, List<String> paths) async {
  final loader = FontLoader(family);
  for (final path in paths) {
    final bytes = await File(path).readAsBytes();
    loader.addFont(Future.value(ByteData.sublistView(bytes)));
  }
  await loader.load();
}

class _TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) => _TestHttpClient();
}

class _TestHttpClient extends Fake implements HttpClient {
  bool _autoUncompress = true;

  @override
  bool get autoUncompress => _autoUncompress;

  @override
  set autoUncompress(bool value) => _autoUncompress = value;

  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _TestHttpClientRequest();
}

class _TestHttpClientRequest extends Fake implements HttpClientRequest {
  @override
  Future<HttpClientResponse> close() async => _TestHttpClientResponse();
}

class _TestHttpClientResponse extends Stream<List<int>>
    implements HttpClientResponse {
  static final bytes = base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  );

  @override
  int get statusCode => HttpStatus.ok;

  @override
  int get contentLength => bytes.length;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int>)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.value(bytes).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
