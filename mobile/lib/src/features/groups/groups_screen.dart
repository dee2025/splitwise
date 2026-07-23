import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:share_plus/share_plus.dart';

import '../expenses/expense_components.dart';
import '../../shared/api_client.dart';
import '../../shared/app_top_bar.dart';
import '../../shared/models.dart';
import '../../shared/money.dart';
import '../../shared/providers.dart';
import '../../shared/screen_utils.dart';

const groupTypes = ['trip', 'home', 'couple', 'event', 'office'];

enum GroupEditorResult { saved, deleted }

class GroupsScreen extends ConsumerStatefulWidget {
  const GroupsScreen({super.key});

  @override
  ConsumerState<GroupsScreen> createState() => _GroupsScreenState();
}

class _GroupsScreenState extends ConsumerState<GroupsScreen> {
  var _loading = true;
  Object? _error;
  List<MoneyGroup> _groups = const [];
  List<Expense> _expenses = const [];
  String _query = '';
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
      final api = ref.read(apiProvider);
      final results = await Future.wait([
        api.getJson('/api/groups'),
        api.getJson('/api/expenses'),
      ]);
      setState(() {
        _groups = listOf(results[0]['groups'])
            .whereType<Map<String, dynamic>>()
            .map(MoneyGroup.fromJson)
            .toList();
        _expenses = listOf(results[1]['expenses'])
            .whereType<Map<String, dynamic>>()
            .map(Expense.fromJson)
            .toList();
      });
    } catch (error) {
      _error = error;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    if (_loading) {
      return const Scaffold(body: LoadingView());
    }
    if (_error != null) {
      return Scaffold(
          body: ErrorView(message: _error.toString(), onRetry: _load));
    }

    final filtered = _groups.where((group) {
      final matchesQuery = _query.trim().isEmpty ||
          group.name.toLowerCase().contains(_query.toLowerCase()) ||
          group.description.toLowerCase().contains(_query.toLowerCase()) ||
          group.members.any((member) =>
              member.name.toLowerCase().contains(_query.toLowerCase()));
      if (!matchesQuery) return false;
      if (_filter == 'admin') return group.isAdmin(user?.id ?? '');
      if (_filter == 'member') return !group.isAdmin(user?.id ?? '');
      return true;
    }).toList();

    return Scaffold(
      appBar: const AppTopBar(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await showGroupEditor(context: context, ref: ref);
          if (result != null) {
            _load();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Create'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
          children: [
            TextField(
              decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  labelText: 'Search groups or members'),
              onChanged: (value) => setState(() => _query = value),
            ),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'all', label: Text('All')),
                ButtonSegment(value: 'admin', label: Text('Admin')),
                ButtonSegment(value: 'member', label: Text('Member')),
              ],
              selected: {_filter},
              onSelectionChanged: (value) =>
                  setState(() => _filter = value.first),
            ),
            const SizedBox(height: 16),
            if (filtered.isEmpty)
              EmptyView(
                icon: Icons.groups_outlined,
                title: 'No groups found',
                message: 'Create a group or adjust your filters.',
                action: FilledButton(
                  onPressed: () async {
                    final result =
                        await showGroupEditor(context: context, ref: ref);
                    if (result != null) {
                      _load();
                    }
                  },
                  child: const Text('Create group'),
                ),
              )
            else
              ...filtered.map((group) {
                final balance =
                    groupBalance(_expenses, user?.id ?? '', group.id);
                return Card(
                  child: ListTile(
                    leading: group.image == null
                        ? CircleAvatar(child: Text(initials(group.name)))
                        : CircleAvatar(
                            backgroundImage:
                                NetworkImage(absoluteAssetUrl(group.image))),
                    title: Text(group.name),
                    subtitle:
                        Text('${group.members.length} members - ${group.type}'),
                    trailing: Text(money(balance),
                        style: TextStyle(
                            color: balance >= 0
                                ? Colors.greenAccent
                                : Colors.redAccent)),
                    onTap: () => context.go('/groups/${group.id}'),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}

class GroupDetailScreen extends ConsumerStatefulWidget {
  const GroupDetailScreen({required this.groupId, super.key});

  final String groupId;

  @override
  ConsumerState<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends ConsumerState<GroupDetailScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  var _loading = true;
  Object? _error;
  MoneyGroup? _group;
  List<Expense> _expenses = const [];
  List<ActivityItem> _activity = const [];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiProvider);
      final results = await Future.wait([
        api.getJson('/api/groups/${widget.groupId}'),
        api.getJson('/api/expenses', query: {'groupId': widget.groupId}),
        api.getJson('/api/activity', query: {
          'groupId': widget.groupId
        }).catchError((_) => {'activity': []}),
      ]);
      setState(() {
        _group =
            MoneyGroup.fromJson(results[0]['group'] as Map<String, dynamic>);
        _expenses = listOf(results[1]['expenses'])
            .whereType<Map<String, dynamic>>()
            .map(Expense.fromJson)
            .toList();
        _activity = listOf(results[2]['activity'])
            .whereType<Map<String, dynamic>>()
            .map(ActivityItem.fromJson)
            .toList();
      });
    } catch (error) {
      _error = error;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).user;
    final group = _group;
    if (_loading) {
      return const Scaffold(body: LoadingView());
    }
    if (_error != null || group == null) {
      return Scaffold(
          body: ErrorView(message: _error.toString(), onRetry: _load));
    }
    final isAdmin = group.isAdmin(user?.id ?? '');

    return Scaffold(
      appBar: AppTopBar(
        actions: [
          if (isAdmin)
            IconButton(
              onPressed: () async {
                final result = await showGroupEditor(
                    context: context, ref: ref, group: group);
                if (result == GroupEditorResult.deleted) {
                  if (context.mounted) {
                    context.go('/groups');
                  }
                  return;
                }
                if (result == GroupEditorResult.saved) {
                  _load();
                }
              },
              icon: const Icon(Icons.settings_outlined),
            ),
        ],
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Activity'),
            Tab(text: 'Members'),
            Tab(text: 'Summary'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final changed = await showExpenseEditor(
            context: context,
            ref: ref,
            groups: [group],
            currentUser: user,
            fixedGroupId: group.id,
          );
          if (changed == true) _load();
        },
        icon: const Icon(Icons.add),
        label: const Text('Expense'),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          GroupActivityTab(
            group: group,
            expenses: _expenses,
            activity: _activity,
            currentUser: user,
            onRefresh: _load,
            onExpenseChanged: _load,
            onAddExpense: () async {
              final changed = await showExpenseEditor(
                context: context,
                ref: ref,
                groups: [group],
                currentUser: user,
                fixedGroupId: group.id,
              );
              if (changed == true) _load();
            },
          ),
          MembersTab(group: group, isAdmin: isAdmin, onChanged: _load),
          GroupSummaryTab(
            group: group,
            expenses: _expenses,
            currentUser: user,
            isAdmin: isAdmin,
            onRefresh: _load,
          ),
        ],
      ),
    );
  }
}

class GroupSummaryTab extends StatelessWidget {
  const GroupSummaryTab({
    required this.group,
    required this.expenses,
    required this.currentUser,
    required this.isAdmin,
    required this.onRefresh,
    super.key,
  });

  final MoneyGroup group;
  final List<Expense> expenses;
  final AppUser? currentUser;
  final bool isAdmin;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final balances = computeBalances(expenses, currentUser?.id ?? '');
    final netBalance = balances.owed - balances.owe;

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(group.description.isEmpty
                      ? 'No description'
                      : group.description),
                  const SizedBox(height: 16),
                  Text('Total expenses',
                      style: Theme.of(context).textTheme.labelLarge),
                  Text(money(group.totalExpenses),
                      style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 8),
                  Text(
                      '${group.members.length} members - ${group.type} - ${group.currency}'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _SummaryMetricCard(
                  label: 'You are owed',
                  value: money(balances.owed),
                  color: Colors.greenAccent,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryMetricCard(
                  label: 'You owe',
                  value: money(balances.owe),
                  color: Colors.redAccent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(Icons.account_balance_wallet_outlined),
              title: const Text('Net balance'),
              subtitle: Text(
                  netBalance >= 0 ? 'You are owed overall' : 'You owe overall'),
              trailing: Text(
                money(netBalance.abs()),
                style: TextStyle(
                  color:
                      netBalance >= 0 ? Colors.greenAccent : Colors.redAccent,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          if (group.inviteToken != null && isAdmin)
            Card(
              child: ListTile(
                leading: const Icon(Icons.link_outlined),
                title: const Text('Invite link'),
                subtitle: Text('$apiBaseUrl/groups/join/${group.inviteToken}'),
                trailing: IconButton(
                  icon: const Icon(Icons.share_outlined),
                  onPressed: () => Share.share(
                      '$apiBaseUrl/groups/join/${group.inviteToken}'),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SummaryMetricCard extends StatelessWidget {
  const _SummaryMetricCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 6),
            Text(
              value,
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(color: color, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }
}

class GroupActivityTab extends ConsumerWidget {
  const GroupActivityTab({
    required this.group,
    required this.expenses,
    required this.activity,
    required this.currentUser,
    required this.onRefresh,
    required this.onExpenseChanged,
    required this.onAddExpense,
    super.key,
  });

  final MoneyGroup group;
  final List<Expense> expenses;
  final List<ActivityItem> activity;
  final AppUser? currentUser;
  final Future<void> Function() onRefresh;
  final VoidCallback onExpenseChanged;
  final Future<void> Function() onAddExpense;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sortedExpenses = [...expenses]
      ..sort((a, b) => b.date.compareTo(a.date));
    final sections = _expenseSections(sortedExpenses);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Expenses',
                    style: Theme.of(context).textTheme.titleLarge),
              ),
              FilledButton.icon(
                onPressed: onAddExpense,
                icon: const Icon(Icons.add),
                label: const Text('Add'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (sortedExpenses.isEmpty)
            EmptyView(
              icon: Icons.receipt_long_outlined,
              title: 'No expenses yet',
              message: 'Add the first expense for this group.',
              action: FilledButton.icon(
                onPressed: onAddExpense,
                icon: const Icon(Icons.add),
                label: const Text('Add expense'),
              ),
            )
          else
            ...sections.expand((section) {
              return [
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(section.label,
                            style: Theme.of(context).textTheme.titleMedium),
                      ),
                      Text(
                          '${section.expenses.length} - ${money(section.total)}',
                          style: Theme.of(context).textTheme.labelLarge),
                    ],
                  ),
                ),
                ...section.expenses.map(
                  (expense) => ExpenseTile(
                    expense: expense,
                    currentUserId: currentUser?.id ?? '',
                    onTap: () async {
                      final changed = await showExpenseDetails(
                        context: context,
                        ref: ref,
                        expense: expense,
                        groups: [group],
                        currentUser: currentUser,
                      );
                      if (changed == true) onExpenseChanged();
                    },
                  ),
                ),
              ];
            }),
          if (activity.isNotEmpty) ...[
            const SizedBox(height: 18),
            Text('Other activity',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...activity.take(8).map(
                  (item) => Card(
                    child: ListTile(
                      leading: const Icon(Icons.history_outlined),
                      title: Text(item.message),
                      subtitle: Text(compactDate(item.createdAt)),
                    ),
                  ),
                ),
          ],
        ],
      ),
    );
  }
}

class _ExpenseDateSection {
  const _ExpenseDateSection({
    required this.label,
    required this.expenses,
    required this.total,
  });

  final String label;
  final List<Expense> expenses;
  final double total;
}

List<_ExpenseDateSection> _expenseSections(List<Expense> expenses) {
  final sections = <String, List<Expense>>{};
  for (final expense in expenses) {
    final key = compactDate(expense.date);
    sections.putIfAbsent(key, () => []).add(expense);
  }

  return sections.entries
      .map(
        (entry) => _ExpenseDateSection(
          label: entry.key,
          expenses: entry.value,
          total: entry.value.fold<double>(
            0,
            (sum, expense) => sum + expense.amount,
          ),
        ),
      )
      .toList();
}

class MembersTab extends ConsumerWidget {
  const MembersTab({
    required this.group,
    required this.isAdmin,
    required this.onChanged,
    super.key,
  });

  final MoneyGroup group;
  final bool isAdmin;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
      children: [
        if (isAdmin)
          FilledButton.icon(
            onPressed: () async {
              final changed = await showAddMemberDialog(
                  context: context, ref: ref, group: group);
              if (changed == true) onChanged();
            },
            icon: const Icon(Icons.person_add_alt_1),
            label: const Text('Add member'),
          ),
        const SizedBox(height: 12),
        ...group.members.map((member) => Card(
              child: ListTile(
                leading: CircleAvatar(child: Text(initials(member.name))),
                title: Text(member.name),
                subtitle: Text(
                    '${member.email.isEmpty ? member.type : member.email} - ${member.role}'),
                trailing: isAdmin && member.role != 'admin'
                    ? IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: () async {
                          final confirmed = await confirmDestructive(
                            context,
                            title: 'Remove member?',
                            message:
                                'This removes ${member.name} from ${group.name}.',
                            action: 'Remove',
                          );
                          if (!confirmed) return;
                          try {
                            await ref.read(apiProvider).putJson(
                                '/api/groups/${group.id}', {
                              'removeMemberId': member.id.isNotEmpty
                                  ? member.id
                                  : member.userId
                            });
                            onChanged();
                          } catch (error) {
                            if (context.mounted) showError(context, error);
                          }
                        },
                      )
                    : null,
              ),
            )),
      ],
    );
  }
}

Future<GroupEditorResult?> showGroupEditor({
  required BuildContext context,
  required WidgetRef ref,
  MoneyGroup? group,
}) {
  return showModalBottomSheet<GroupEditorResult>(
    context: context,
    isScrollControlled: true,
    builder: (context) => GroupEditorSheet(group: group),
  );
}

class GroupEditorSheet extends ConsumerStatefulWidget {
  const GroupEditorSheet({this.group, super.key});

  final MoneyGroup? group;

  @override
  ConsumerState<GroupEditorSheet> createState() => _GroupEditorSheetState();
}

class _GroupEditorSheetState extends ConsumerState<GroupEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _description;
  late String _type;
  String? _image;
  var _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.group?.name ?? '');
    _description = TextEditingController(text: widget.group?.description ?? '');
    _type = widget.group?.type ?? 'event';
    _image = widget.group?.image;
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final group = widget.group;
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
                Text(group == null ? 'Create group' : 'Group settings',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Group name'),
                  validator: (value) => (value ?? '').trim().isEmpty
                      ? 'Group name is required'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _description,
                  decoration: const InputDecoration(labelText: 'Description'),
                  minLines: 2,
                  maxLines: 4,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _type,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: groupTypes
                      .map((type) =>
                          DropdownMenuItem(value: type, child: Text(type)))
                      .toList(),
                  onChanged: (value) =>
                      setState(() => _type = value ?? 'event'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _pickImage,
                  icon: const Icon(Icons.image_outlined),
                  label: Text(_image == null
                      ? 'Upload group image'
                      : 'Change group image'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Save'),
                ),
                if (group != null) ...[
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _regenerateInvite,
                    icon: const Icon(Icons.link_outlined),
                    label: const Text('Regenerate invite link'),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _deleteGroup,
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Delete group'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    final image = await ImagePicker()
        .pickImage(source: ImageSource.gallery, maxWidth: 1600);
    if (image == null) return;
    setState(() => _saving = true);
    try {
      final path =
          await ref.read(apiProvider).uploadImage(File(image.path), 'groups');
      setState(() => _image = path);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _saving = true);
    final body = {
      'name': _name.text.trim(),
      'description': _description.text.trim(),
      'type': _type,
      'privacy': 'private',
      'image': _image ?? '',
    };
    try {
      final api = ref.read(apiProvider);
      if (widget.group == null) {
        await api.postJson('/api/groups', body);
      } else {
        await api.putJson('/api/groups/${widget.group!.id}', body);
      }
      if (mounted) Navigator.pop(context, GroupEditorResult.saved);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _regenerateInvite() async {
    final group = widget.group;
    if (group == null) return;
    try {
      final json = await ref
          .read(apiProvider)
          .postJson('/api/groups/${group.id}/invite/regenerate', {});
      final token = json['inviteToken']?.toString();
      if (token != null && token.isNotEmpty) {
        await Share.share('$apiBaseUrl/groups/join/$token');
      }
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _deleteGroup() async {
    final group = widget.group;
    if (group == null) return;
    final confirmed = await confirmDestructive(
      context,
      title: 'Delete group?',
      message: 'This permanently deletes ${group.name}.',
    );
    if (!confirmed) return;
    try {
      await ref
          .read(apiProvider)
          .putJson('/api/groups/${group.id}', {'action': 'delete'});
      if (mounted) Navigator.pop(context, GroupEditorResult.deleted);
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }
}

Future<bool?> showAddMemberDialog({
  required BuildContext context,
  required WidgetRef ref,
  required MoneyGroup group,
}) {
  return showDialog<bool>(
    context: context,
    builder: (context) => AddMemberDialog(group: group),
  );
}

class AddMemberDialog extends ConsumerStatefulWidget {
  const AddMemberDialog({required this.group, super.key});

  final MoneyGroup group;

  @override
  ConsumerState<AddMemberDialog> createState() => _AddMemberDialogState();
}

class _AddMemberDialogState extends ConsumerState<AddMemberDialog> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  List<Map<String, dynamic>> _matches = const [];
  var _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _search(String value) async {
    if (!value.contains('@') || value.length < 3) {
      setState(() => _matches = const []);
      return;
    }
    final json = await ref
        .read(apiProvider)
        .getJson('/api/users/search', query: {'q': value});
    setState(() => _matches =
        listOf(json['users']).whereType<Map<String, dynamic>>().toList());
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add member'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration:
                  const InputDecoration(labelText: 'Registered user email'),
              onChanged: _search,
            ),
            ..._matches.map((user) => ListTile(
                  title: Text(stringOf(user['fullName'] ?? user['name'])),
                  subtitle: Text(stringOf(user['email'])),
                  onTap: () => _addRegistered(user),
                )),
            const Divider(),
            TextField(
              controller: _name,
              decoration:
                  const InputDecoration(labelText: 'Or custom member name'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel')),
        FilledButton(
          onPressed: _saving ? null : _addCustom,
          child: const Text('Add custom'),
        ),
      ],
    );
  }

  Future<void> _addRegistered(Map<String, dynamic> user) async {
    await _add({
      'userId': stringOf(user['id'] ?? user['_id']),
      'name': stringOf(user['fullName'] ?? user['name']),
      'email': stringOf(user['email']),
      'contact': stringOf(user['contact']),
      'type': 'registered',
    });
  }

  Future<void> _addCustom() async {
    if (_name.text.trim().isEmpty) {
      showError(context, 'Enter a custom member name');
      return;
    }
    await _add({
      'name': _name.text.trim(),
      'email': _email.text.trim(),
      'type': 'custom',
    });
  }

  Future<void> _add(Map<String, dynamic> member) async {
    setState(() => _saving = true);
    try {
      await ref
          .read(apiProvider)
          .postJson('/api/groups/${widget.group.id}/members', {
        'members': [member],
      });
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

String initials(String name) {
  final parts = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((part) => part.isNotEmpty)
      .toList();
  if (parts.isEmpty) return 'G';
  return parts.take(2).map((part) => part[0]).join().toUpperCase();
}
