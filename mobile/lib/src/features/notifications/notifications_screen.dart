import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/models.dart';
import '../../shared/providers.dart';
import '../../shared/screen_utils.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  var _loading = true;
  Object? _error;
  List<NotificationItem> _notifications = const [];
  final Set<String> _selected = {};
  String _filter = 'all';

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
      final json = await ref.read(apiProvider).getJson('/api/notifications');
      setState(() {
        _notifications = listOf(json['notifications']).whereType<Map<String, dynamic>>().map(NotificationItem.fromJson).toList();
      });
    } catch (error) {
      _error = error;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: LoadingView());
    if (_error != null) return Scaffold(body: ErrorView(message: _error.toString(), onRetry: _load));

    final unreadCount = _notifications.where((item) => !item.isRead).length;
    final filtered = _notifications.where((item) {
      if (_filter == 'read') return item.isRead;
      if (_filter == 'unread') return !item.isRead;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark all'),
            ),
          if (_selected.isNotEmpty)
            IconButton(
              onPressed: _deleteSelected,
              icon: const Icon(Icons.delete_outline),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SegmentedButton<String>(
              segments: [
                const ButtonSegment(value: 'all', label: Text('All')),
                ButtonSegment(value: 'unread', label: Text('Unread ($unreadCount)')),
                const ButtonSegment(value: 'read', label: Text('Read')),
              ],
              selected: {_filter},
              onSelectionChanged: (value) => setState(() => _filter = value.first),
            ),
            const SizedBox(height: 16),
            if (filtered.isEmpty)
              const EmptyView(
                icon: Icons.notifications_none_outlined,
                title: 'No notifications',
                message: 'You are all caught up.',
              )
            else
              ...filtered.map((item) {
                final selected = _selected.contains(item.id);
                return Card(
                  child: ListTile(
                    leading: Checkbox(
                      value: selected,
                      onChanged: (_) => setState(() {
                        selected ? _selected.remove(item.id) : _selected.add(item.id);
                      }),
                    ),
                    title: Text(item.title, style: TextStyle(fontWeight: item.isRead ? FontWeight.w500 : FontWeight.w800)),
                    subtitle: Text(item.message),
                    trailing: item.isRead ? null : const Icon(Icons.circle, size: 10, color: Colors.greenAccent),
                    onTap: item.isRead ? null : () => _markRead(item.id),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Future<void> _markRead(String id) async {
    try {
      await ref.read(apiProvider).putJson('/api/notifications', {'notificationId': id});
      setState(() {
        _notifications = _notifications.map((item) {
          if (item.id != id) return item;
          return NotificationItem(
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type,
            isRead: true,
            createdAt: item.createdAt,
          );
        }).toList();
      });
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _markAllRead() async {
    try {
      await ref.read(apiProvider).putJson('/api/notifications', {'markAllAsRead': true});
      _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _deleteSelected() async {
    if (_selected.isEmpty) return;
    final confirmed = await confirmDestructive(
      context,
      title: 'Delete notifications?',
      message: 'This deletes ${_selected.length} selected notifications.',
    );
    if (!confirmed) return;
    try {
      await ref.read(apiProvider).deleteJson('/api/notifications', {'notificationIds': _selected.toList()});
      setState(() {
        _notifications = _notifications.where((item) => !_selected.contains(item.id)).toList();
        _selected.clear();
      });
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }
}
