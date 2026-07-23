import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'api_client.dart';
import 'models.dart';
import 'providers.dart';

enum _TopBarMenuAction { profile, logout, toggleTheme }

class AppTopBar extends ConsumerWidget implements PreferredSizeWidget {
  const AppTopBar({
    this.actions = const [],
    this.bottom,
    super.key,
  });

  final List<Widget> actions;
  final PreferredSizeWidget? bottom;

  @override
  Size get preferredSize {
    final bottomHeight = bottom?.preferredSize.height ?? 0;
    return Size.fromHeight(kToolbarHeight + bottomHeight);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode != ThemeMode.light;

    return AppBar(
      titleSpacing: 16,
      title: const _BrandTitle(),
      actions: [
        ...actions,
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: PopupMenuButton<_TopBarMenuAction>(
            tooltip: 'Account menu',
            offset: const Offset(0, 10),
            onSelected: (action) async {
              switch (action) {
                case _TopBarMenuAction.profile:
                  context.go('/profile');
                case _TopBarMenuAction.logout:
                  await ref.read(authControllerProvider.notifier).logout();
                case _TopBarMenuAction.toggleTheme:
                  ref.read(themeModeProvider.notifier).state =
                      isDark ? ThemeMode.light : ThemeMode.dark;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: _TopBarMenuAction.profile,
                child: _MenuRow(
                  icon: Icons.person_outline,
                  label: 'Profile',
                ),
              ),
              PopupMenuItem(
                value: _TopBarMenuAction.toggleTheme,
                child: _MenuRow(
                  icon: Icons.dark_mode_outlined,
                  label: 'Dark theme',
                  trailing: IgnorePointer(
                    child: Switch(
                      value: isDark,
                      onChanged: (_) {},
                    ),
                  ),
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: _TopBarMenuAction.logout,
                child: _MenuRow(
                  icon: Icons.logout_outlined,
                  label: 'Logout',
                ),
              ),
            ],
            child: _UserAvatar(user: user),
          ),
        ),
      ],
      bottom: bottom,
    );
  }
}

class _BrandTitle extends StatelessWidget {
  const _BrandTitle();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            absoluteAssetUrl('/logo.png'),
            width: 32,
            height: 32,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'MS',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          'MoneySplit',
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(fontWeight: FontWeight.w800),
        ),
      ],
    );
  }
}

class _UserAvatar extends StatelessWidget {
  const _UserAvatar({required this.user});

  final AppUser? user;

  @override
  Widget build(BuildContext context) {
    final avatar = user?.avatar;
    return CircleAvatar(
      radius: 18,
      backgroundImage:
          avatar == null ? null : NetworkImage(absoluteAssetUrl(avatar)),
      child: avatar == null ? Text(_initials(user?.fullName ?? 'User')) : null,
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.icon,
    required this.label,
    this.trailing,
  });

  final IconData icon;
  final String label;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(label)),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

String _initials(String name) {
  final parts = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .toList();
  if (parts.isEmpty) return 'U';
  return parts.take(2).map((part) => part[0]).join().toUpperCase();
}
