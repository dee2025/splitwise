import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../shared/api_client.dart';
import '../../shared/app_top_bar.dart';
import '../../shared/models.dart';
import '../../shared/providers.dart';
import '../../shared/screen_utils.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  var _loading = true;
  Object? _error;
  AppUser? _profile;
  Map<String, dynamic> _stats = const {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final json = await ref.read(apiProvider).getJson('/api/users/profile');
      setState(() {
        _profile = AppUser.fromJson(json['user'] as Map<String, dynamic>);
        _stats = json['stats'] is Map<String, dynamic>
            ? json['stats'] as Map<String, dynamic>
            : const {};
      });
    } catch (error) {
      _error = error;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: LoadingView());
    }
    if (_error != null || _profile == null) {
      return Scaffold(
          body: ErrorView(message: _error.toString(), onRetry: _load));
    }
    final profile = _profile!;

    return Scaffold(
      appBar: const AppTopBar(),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 42,
                      backgroundImage: profile.avatar == null
                          ? null
                          : NetworkImage(absoluteAssetUrl(profile.avatar)),
                      child: profile.avatar == null
                          ? Text(_initials(profile.fullName))
                          : null,
                    ),
                    const SizedBox(height: 12),
                    Text(profile.fullName,
                        style: Theme.of(context).textTheme.titleLarge),
                    Text('@${profile.username}'),
                    const SizedBox(height: 4),
                    Text(profile.email),
                  ],
                ),
              ),
            ),
            Row(
              children: [
                Expanded(
                    child: StatCard(
                        label: 'Groups',
                        value: '${_stats['groupsCount'] ?? 0}')),
                const SizedBox(width: 12),
                Expanded(
                    child: StatCard(
                        label: 'Expenses',
                        value: '${_stats['expenseCount'] ?? 0}')),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.edit_outlined),
                    title: const Text('Edit profile'),
                    onTap: () async {
                      final changed = await showProfileEditor(
                          context: context, ref: ref, profile: profile);
                      if (changed == true) _load();
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.password_outlined),
                    title: const Text('Change password'),
                    onTap: () =>
                        showChangePasswordDialog(context: context, ref: ref),
                  ),
                  ListTile(
                    leading: const Icon(Icons.logout_outlined),
                    title: const Text('Logout'),
                    onTap: () =>
                        ref.read(authControllerProvider.notifier).logout(),
                  ),
                  ListTile(
                    leading: const Icon(Icons.delete_outline,
                        color: Colors.redAccent),
                    title: const Text('Delete account',
                        style: TextStyle(color: Colors.redAccent)),
                    onTap: () =>
                        showDeleteAccountDialog(context: context, ref: ref),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  const StatCard({required this.label, required this.value, super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(value, style: Theme.of(context).textTheme.titleLarge),
            Text(label),
          ],
        ),
      ),
    );
  }
}

Future<bool?> showProfileEditor({
  required BuildContext context,
  required WidgetRef ref,
  required AppUser profile,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    builder: (context) => ProfileEditorSheet(profile: profile),
  );
}

class ProfileEditorSheet extends ConsumerStatefulWidget {
  const ProfileEditorSheet({required this.profile, super.key});

  final AppUser profile;

  @override
  ConsumerState<ProfileEditorSheet> createState() => _ProfileEditorSheetState();
}

class _ProfileEditorSheetState extends ConsumerState<ProfileEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _username;
  late final TextEditingController _contact;
  late final TextEditingController _bio;
  String? _avatar;
  var _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.profile.fullName);
    _username = TextEditingController(text: widget.profile.username);
    _contact = TextEditingController(text: widget.profile.contact);
    _bio = TextEditingController(text: widget.profile.bio);
    _avatar = widget.profile.avatar;
  }

  @override
  void dispose() {
    _name.dispose();
    _username.dispose();
    _contact.dispose();
    _bio.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
        ),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Edit profile',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 14),
                OutlinedButton.icon(
                  onPressed: _pickAvatar,
                  icon: const Icon(Icons.image_outlined),
                  label:
                      Text(_avatar == null ? 'Upload avatar' : 'Change avatar'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Full name'),
                  validator: (value) => (value ?? '').trim().length < 2
                      ? 'Enter your full name'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _username,
                  decoration: const InputDecoration(labelText: 'Username'),
                  validator: (value) => RegExp(r'^[a-z0-9_]{3,20}$')
                          .hasMatch((value ?? '').trim())
                      ? null
                      : 'Use 3-20 lowercase letters, numbers, or underscore',
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _contact,
                  decoration: const InputDecoration(labelText: 'Phone number'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _bio,
                  maxLength: 200,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Bio'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Save changes'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _pickAvatar() async {
    final image = await ImagePicker()
        .pickImage(source: ImageSource.gallery, maxWidth: 1200);
    if (image == null) return;
    setState(() => _saving = true);
    try {
      final path =
          await ref.read(apiProvider).uploadImage(File(image.path), 'profile');
      setState(() => _avatar = path);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _saving = true);
    try {
      final json = await ref.read(apiProvider).putJson('/api/users/profile', {
        'fullName': _name.text.trim(),
        'username': _username.text.trim().toLowerCase(),
        'contact': _contact.text.trim(),
        'bio': _bio.text.trim(),
        'avatar': _avatar,
      });
      final user = AppUser.fromJson(json['user'] as Map<String, dynamic>);
      await ref.read(authControllerProvider.notifier).setUser(user);
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

Future<void> showChangePasswordDialog({
  required BuildContext context,
  required WidgetRef ref,
}) {
  final current = TextEditingController();
  final next = TextEditingController();
  return showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Change password'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
              controller: current,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Current password')),
          const SizedBox(height: 12),
          TextField(
              controller: next,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'New password')),
        ],
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel')),
        FilledButton(
          onPressed: () async {
            try {
              await ref
                  .read(apiProvider)
                  .putJson('/api/users/change-password', {
                'currentPassword': current.text,
                'newPassword': next.text,
              });
              if (context.mounted) Navigator.pop(context);
            } catch (error) {
              if (context.mounted) showError(context, error);
            }
          },
          child: const Text('Save'),
        ),
      ],
    ),
  );
}

Future<void> showDeleteAccountDialog({
  required BuildContext context,
  required WidgetRef ref,
}) {
  final confirmation = TextEditingController();
  final password = TextEditingController();
  return showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Delete account'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
              'Type DELETE to permanently remove your account and associated data.'),
          const SizedBox(height: 12),
          TextField(
              controller: confirmation,
              decoration: const InputDecoration(labelText: 'Confirmation')),
          const SizedBox(height: 12),
          TextField(
              controller: password,
              obscureText: true,
              decoration: const InputDecoration(
                  labelText: 'Password, if local account')),
        ],
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel')),
        FilledButton(
          onPressed: () async {
            try {
              await ref.read(apiProvider).deleteJson('/api/users/account', {
                'confirmation': confirmation.text.trim(),
                'password': password.text,
              });
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) Navigator.pop(context);
            } catch (error) {
              if (context.mounted) showError(context, error);
            }
          },
          child: const Text('Delete'),
        ),
      ],
    ),
  );
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
