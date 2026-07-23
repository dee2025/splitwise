import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'features/auth/auth_screens.dart';
import 'features/groups/groups_screen.dart';
import 'features/home/home_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/panel/panel_shell.dart';
import 'features/profile/profile_screen.dart';
import 'shared/providers.dart';

class MoneySplitApp extends ConsumerWidget {
  const MoneySplitApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final themeMode = ref.watch(themeModeProvider);
    final router = GoRouter(
      initialLocation: '/home',
      redirect: (context, state) {
        final isAuthPath = state.matchedLocation == '/login' ||
            state.matchedLocation == '/signup';
        if (auth.loading) {
          return state.matchedLocation == '/splash' ? null : '/splash';
        }
        if (!auth.isAuthenticated && !isAuthPath) {
          return '/login';
        }
        if (auth.isAuthenticated &&
            (isAuthPath || state.matchedLocation == '/splash')) {
          return '/home';
        }
        return null;
      },
      routes: [
        GoRoute(
            path: '/splash', builder: (context, state) => const SplashScreen()),
        GoRoute(
            path: '/login', builder: (context, state) => const LoginScreen()),
        GoRoute(
            path: '/signup', builder: (context, state) => const SignupScreen()),
        StatefulShellRoute.indexedStack(
          builder: (context, state, shell) => PanelShell(shell: shell),
          branches: [
            StatefulShellBranch(routes: [
              GoRoute(
                  path: '/home',
                  builder: (context, state) => const HomeScreen()),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(
                path: '/groups',
                builder: (context, state) => const GroupsScreen(),
                routes: [
                  GoRoute(
                    path: ':groupId',
                    builder: (context, state) => GroupDetailScreen(
                        groupId: state.pathParameters['groupId']!),
                  ),
                ],
              ),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(
                  path: '/notifications',
                  builder: (context, state) => const NotificationsScreen()),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(
                  path: '/profile',
                  builder: (context, state) => const ProfileScreen()),
            ]),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      title: 'MoneySplit',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xff4f46e5),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xfff8fafc),
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(
              borderRadius: BorderRadius.all(Radius.circular(14))),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 1,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xff4f46e5),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xff020617),
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(
              borderRadius: BorderRadius.all(Radius.circular(14))),
        ),
        cardTheme: CardThemeData(
          color: const Color(0xff0f172a),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
