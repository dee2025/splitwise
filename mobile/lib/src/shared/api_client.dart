import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const apiBaseUrl = String.fromEnvironment(
  'MONEYSPLIT_API_BASE',
  defaultValue: 'https://www.moneysplit.in',
);

class TokenStore {
  TokenStore(this._storage);

  static const _key = 'moneysplit_token';
  final FlutterSecureStorage _storage;

  Future<String?> read() => _storage.read(key: _key);
  Future<void> write(String token) => _storage.write(key: _key, value: token);
  Future<void> clear() => _storage.delete(key: _key);
}

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.errors = const {}});

  final String message;
  final int? statusCode;
  final Map<String, dynamic> errors;

  @override
  String toString() => message;
}

class MoneySplitApi {
  MoneySplitApi(this._tokenStore)
      : dio = Dio(
          BaseOptions(
            baseUrl: apiBaseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 30),
            headers: const {
              'Accept': 'application/json',
              'X-MoneySplit-Client': 'flutter',
            },
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStore.read();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final TokenStore _tokenStore;
  final Dio dio;

  Future<Map<String, dynamic>> getJson(String path, {Map<String, dynamic>? query}) async {
    return _request(() => dio.get(path, queryParameters: query));
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    return _request(() => dio.post(path, data: body));
  }

  Future<Map<String, dynamic>> putJson(String path, Map<String, dynamic> body) async {
    return _request(() => dio.put(path, data: body));
  }

  Future<Map<String, dynamic>> deleteJson(String path, Map<String, dynamic> body) async {
    return _request(() => dio.delete(path, data: body));
  }

  Future<String> uploadImage(File file, String folder) async {
    final data = FormData.fromMap({
      'folder': folder,
      'file': await MultipartFile.fromFile(file.path),
    });
    final json = await _request(() => dio.post('/api/uploads/image', data: data));
    return json['path']?.toString() ?? '';
  }

  Future<Map<String, dynamic>> _request(Future<Response<dynamic>> Function() send) async {
    try {
      final response = await send();
      final data = response.data;
      if (data is Map<String, dynamic>) return data;
      return <String, dynamic>{};
    } on DioException catch (error) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        throw ApiException(
          data['error']?.toString() ?? data['message']?.toString() ?? 'Request failed',
          statusCode: error.response?.statusCode,
          errors: data['errors'] is Map<String, dynamic> ? data['errors'] as Map<String, dynamic> : const {},
        );
      }
      throw ApiException(error.message ?? 'Request failed', statusCode: error.response?.statusCode);
    }
  }
}

String absoluteAssetUrl(String? path) {
  if (path == null || path.isEmpty) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return '$apiBaseUrl$path';
}
