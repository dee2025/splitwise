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
  List<SettlementItem> _settlements = const [];
  var _loadRequestId = 0;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _load();
  }

  @override
  void didUpdateWidget(covariant GroupDetailScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.groupId != widget.groupId) {
      _tabs.index = 0;
      _load();
    }
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final requestId = ++_loadRequestId;
    final groupId = widget.groupId;
    setState(() {
      _loading = true;
      _error = null;
      _group = null;
      _expenses = const [];
      _activity = const [];
      _settlements = const [];
    });
    try {
      final api = ref.read(apiProvider);
      final results = await Future.wait([
        api.getJson('/api/groups/$groupId'),
        api.getJson('/api/expenses', query: {'groupId': groupId}),
        api.getJson('/api/activity',
            query: {'groupId': groupId}).catchError((_) => {'activity': []}),
        api.getJson('/api/settlements',
            query: {'groupId': groupId}).catchError((_) => {'settlements': []}),
      ]);
      if (!mounted ||
          requestId != _loadRequestId ||
          widget.groupId != groupId) {
        return;
      }
      setState(() {
        _group =
            MoneyGroup.fromJson(results[0]['group'] as Map<String, dynamic>);
        _expenses = listOf(results[1]['expenses'])
            .whereType<Map<String, dynamic>>()
            .map(Expense.fromJson)
            .where((expense) => expense.groupId == groupId)
            .toList();
        _activity = listOf(results[2]['activity'])
            .whereType<Map<String, dynamic>>()
            .map(ActivityItem.fromJson)
            .toList();
        _settlements = listOf(results[3]['settlements'])
            .whereType<Map<String, dynamic>>()
            .map(SettlementItem.fromJson)
            .where((settlement) => settlement.groupId == groupId)
            .toList();
      });
    } catch (error) {
      if (!mounted ||
          requestId != _loadRequestId ||
          widget.groupId != groupId) {
        return;
      }
      _error = error;
    } finally {
      if (mounted && requestId == _loadRequestId && widget.groupId == groupId) {
        setState(() => _loading = false);
      }
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
        leading: IconButton(
          tooltip: 'Back to groups',
          onPressed: () => context.go('/groups'),
          icon: const Icon(Icons.arrow_back),
        ),
        title: group.name,
        subtitle: '${group.members.length} members - ${group.type}',
        actions: [
          IconButton(
            tooltip: 'Download report',
            onPressed: _downloadGroupReport,
            icon: const Icon(Icons.download_outlined),
          ),
          if (isAdmin)
            IconButton(
              tooltip: 'Group settings',
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
            Tab(text: 'Settle'),
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
          GroupSettleUpTab(
            group: group,
            expenses: _expenses,
            settlements: _settlements,
            onRefresh: _load,
          ),
          MembersTab(group: group, isAdmin: isAdmin, onChanged: _load),
          GroupSummaryTab(
            group: group,
            expenses: _expenses,
            settlements: _settlements,
            currentUser: user,
            isAdmin: isAdmin,
            onRefresh: _load,
          ),
        ],
      ),
    );
  }

  Future<void> _downloadGroupReport() async {
    final group = _group;
    if (group == null) return;

    try {
      final fileName = _reportFileName(group.name);
      final file = File('${Directory.systemTemp.path}/$fileName');
      await file.writeAsString(_buildGroupReport(group));
      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'MoneySplit report - ${group.name}',
        text: 'MoneySplit activity report for ${group.name}.',
      );
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  String _buildGroupReport(MoneyGroup group) {
    final buffer = StringBuffer()
      ..writeln('MoneySplit Group Report')
      ..writeln('Group: ${group.name}')
      ..writeln('Generated: ${compactDate(DateTime.now())}')
      ..writeln('Type: ${group.type}')
      ..writeln('Currency: ${group.currency}')
      ..writeln('Members: ${group.members.length}')
      ..writeln('Total expenses: ${money(_expenses.fold<double>(
        0,
        (sum, expense) => sum + expense.amount,
      ))}')
      ..writeln('')
      ..writeln('Members');

    for (final member in group.members) {
      buffer.writeln('- ${member.name} (${member.role})');
    }

    final plan = computeGroupSettlementPlan(group, _expenses, _settlements);
    buffer
      ..writeln('')
      ..writeln('Balances');
    for (final row in plan.balances) {
      final status = row.balance > 0.01
          ? 'receives'
          : row.balance < -0.01
              ? 'pays'
              : 'settled';
      buffer.writeln('- ${row.name}: $status ${money(row.balance.abs())}');
    }

    buffer
      ..writeln('')
      ..writeln('Suggested settlements');
    if (plan.suggestions.isEmpty) {
      buffer.writeln('- Everyone is settled');
    } else {
      for (final suggestion in plan.suggestions) {
        buffer.writeln(
          '- ${suggestion.fromName} pays ${suggestion.toName}: ${money(suggestion.amount)}',
        );
      }
    }

    buffer
      ..writeln('')
      ..writeln('Expenses');
    if (_expenses.isEmpty) {
      buffer.writeln('- No expenses recorded');
    } else {
      final expenses = [..._expenses]..sort((a, b) => b.date.compareTo(a.date));
      for (final expense in expenses) {
        buffer.writeln(
          '- ${compactDate(expense.date)} | ${expense.description} | ${money(expense.amount)} | Paid by ${expense.paidByName} | ${categoryLabel(expense.category)}',
        );
      }
    }

    buffer
      ..writeln('')
      ..writeln('Recorded settlements');
    if (_settlements.isEmpty) {
      buffer.writeln('- No settlements recorded');
    } else {
      final settlements = [..._settlements]
        ..sort((a, b) => b.date.compareTo(a.date));
      for (final settlement in settlements) {
        buffer.writeln(
          '- ${compactDate(settlement.date)} | ${settlement.fromName} paid ${settlement.toName} | ${money(settlement.amount)}${settlement.note.isEmpty ? '' : ' | ${settlement.note}'}',
        );
      }
    }

    return buffer.toString();
  }

  String _reportFileName(String groupName) {
    final safeName = groupName
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    final date = DateTime.now().toIso8601String().split('T').first;
    return '${safeName.isEmpty ? 'group' : safeName}-activity-report-$date.txt';
  }
}

class GroupSummaryTab extends StatelessWidget {
  const GroupSummaryTab({
    required this.group,
    required this.expenses,
    required this.settlements,
    required this.currentUser,
    required this.isAdmin,
    required this.onRefresh,
    super.key,
  });

  final MoneyGroup group;
  final List<Expense> expenses;
  final List<SettlementItem> settlements;
  final AppUser? currentUser;
  final bool isAdmin;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final balances = computeBalances(expenses, currentUser?.id ?? '');
    final plan = computeGroupSettlementPlan(group, expenses, settlements);
    final scheme = Theme.of(context).colorScheme;
    final currentBalance = plan.balances
        .where((row) => row.id == currentUser?.id)
        .fold<double>(0, (sum, row) => sum + row.balance);
    final total =
        expenses.fold<double>(0, (sum, expense) => sum + expense.amount);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Card(
            color: Color.lerp(scheme.surface, scheme.primary, 0.08),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          group.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                      ),
                      _InfoChip(label: group.currency),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(group.description.isEmpty
                      ? 'No description'
                      : group.description),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _InfoChip(label: '${group.members.length} members'),
                      _InfoChip(label: group.type),
                      _InfoChip(label: '${expenses.length} expenses'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _SummaryMetricCard(
                  icon: Icons.receipt_long_outlined,
                  label: 'Total',
                  value: money(total),
                  color: scheme.primary,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryMetricCard(
                  icon: Icons.south_west_outlined,
                  label: 'You are owed',
                  value: money(balances.owed),
                  color: Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _SummaryMetricCard(
                  icon: Icons.north_east_outlined,
                  label: 'You owe',
                  value: money(balances.owe),
                  color: Colors.red,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryMetricCard(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'Net',
                  value: money(currentBalance.abs()),
                  color: currentBalance >= 0 ? Colors.green : Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Card(
            color: Color.lerp(
              scheme.surface,
              currentBalance >= 0 ? Colors.green : Colors.red,
              0.09,
            ),
            child: ListTile(
              leading: const Icon(Icons.account_balance_wallet_outlined),
              title: const Text('Net balance'),
              subtitle: Text(currentBalance >= 0
                  ? 'You are owed overall after settlements'
                  : 'You owe overall after settlements'),
              trailing: Text(
                money(currentBalance.abs()),
                style: TextStyle(
                  color: Color.lerp(
                    scheme.onSurface,
                    currentBalance >= 0 ? Colors.green : Colors.red,
                    0.70,
                  ),
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
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
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      color: Color.lerp(scheme.surface, color, 0.10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Color.lerp(scheme.onSurface, color, 0.65)),
            const SizedBox(height: 10),
            Text(label, style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 6),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Color.lerp(scheme.onSurface, color, 0.75),
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Color.lerp(scheme.surface, scheme.primary, 0.10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context)
            .textTheme
            .labelMedium
            ?.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}

class GroupSettleUpTab extends ConsumerWidget {
  const GroupSettleUpTab({
    required this.group,
    required this.expenses,
    required this.settlements,
    required this.onRefresh,
    super.key,
  });

  final MoneyGroup group;
  final List<Expense> expenses;
  final List<SettlementItem> settlements;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final plan = computeGroupSettlementPlan(group, expenses, settlements);
    final scheme = Theme.of(context).colorScheme;
    final outstanding = plan.suggestions.fold<double>(
      0,
      (sum, suggestion) => sum + suggestion.amount,
    );

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Card(
            color: Color.lerp(scheme.surface, scheme.primary, 0.10),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor:
                        Color.lerp(scheme.surface, scheme.primary, 0.18),
                    foregroundColor: scheme.primary,
                    child: const Icon(Icons.swap_horiz_outlined),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Settle up',
                            style: Theme.of(context).textTheme.titleLarge),
                        const SizedBox(height: 4),
                        Text(plan.suggestions.isEmpty
                            ? 'Everyone is settled.'
                            : '${plan.suggestions.length} payment${plan.suggestions.length == 1 ? '' : 's'} suggested'),
                      ],
                    ),
                  ),
                  Text(
                    money(outstanding),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: scheme.primary,
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text('Suggested payments',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (plan.suggestions.isEmpty)
            const EmptyView(
              icon: Icons.check_circle_outline,
              title: 'All settled',
              message: 'No payments are needed for this group.',
            )
          else
            ...plan.suggestions.map(
              (suggestion) => Card(
                color: Color.lerp(scheme.surface, Colors.red, 0.07),
                child: ListTile(
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  leading: CircleAvatar(
                    backgroundColor:
                        Color.lerp(scheme.surface, Colors.red, 0.16),
                    foregroundColor:
                        Color.lerp(scheme.onSurface, Colors.red, 0.65),
                    child: const Icon(Icons.payments_outlined),
                  ),
                  title:
                      Text('${suggestion.fromName} pays ${suggestion.toName}'),
                  subtitle: const Text('Suggested settlement'),
                  trailing: FilledButton(
                    onPressed: () async {
                      final changed = await showSettlementSheet(
                        context: context,
                        ref: ref,
                        group: group,
                        suggestion: suggestion,
                      );
                      if (changed == true) {
                        await onRefresh();
                      }
                    },
                    child: Text(money(suggestion.amount)),
                  ),
                ),
              ),
            ),
          const SizedBox(height: 18),
          Text('Member balances',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...plan.balances.map((balance) {
            final neutral = balance.balance.abs() <= 0.01;
            final positive = balance.balance > 0.01;
            final color = neutral
                ? scheme.outline
                : positive
                    ? Colors.green
                    : Colors.red;
            return Card(
              color: Color.lerp(scheme.surface, color, neutral ? 0.04 : 0.08),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor:
                      Color.lerp(scheme.surface, color, neutral ? 0.10 : 0.18),
                  foregroundColor: Color.lerp(
                      scheme.onSurface, color, neutral ? 0.25 : 0.65),
                  child: Text(initials(balance.name)),
                ),
                title: Text(balance.name),
                subtitle: Text(neutral
                    ? 'Settled'
                    : positive
                        ? 'Should receive'
                        : 'Should pay'),
                trailing: Text(
                  neutral ? money(0) : money(balance.balance.abs()),
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    color: Color.lerp(
                      scheme.onSurface,
                      color,
                      neutral ? 0.25 : 0.75,
                    ),
                  ),
                ),
              ),
            );
          }),
          if (settlements.isNotEmpty) ...[
            const SizedBox(height: 18),
            Text('Recorded settlements',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...settlements.map(
              (settlement) => Card(
                color: Color.lerp(scheme.surface, Colors.green, 0.07),
                child: ListTile(
                  leading: Icon(
                    Icons.done_all_outlined,
                    color: Color.lerp(scheme.onSurface, Colors.green, 0.65),
                  ),
                  title:
                      Text('${settlement.fromName} paid ${settlement.toName}'),
                  subtitle: Text([
                    compactDate(settlement.date),
                    if (settlement.note.isNotEmpty) settlement.note,
                  ].join(' - ')),
                  trailing: Text(
                    money(settlement.amount),
                    style: TextStyle(
                      color: Color.lerp(scheme.onSurface, Colors.green, 0.75),
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

Future<bool?> showSettlementSheet({
  required BuildContext context,
  required WidgetRef ref,
  required MoneyGroup group,
  required SettlementSuggestion suggestion,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    builder: (context) => SettlementSheet(
      group: group,
      suggestion: suggestion,
    ),
  );
}

class SettlementSheet extends ConsumerStatefulWidget {
  const SettlementSheet({
    required this.group,
    required this.suggestion,
    super.key,
  });

  final MoneyGroup group;
  final SettlementSuggestion suggestion;

  @override
  ConsumerState<SettlementSheet> createState() => _SettlementSheetState();
}

class _SettlementSheetState extends ConsumerState<SettlementSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _amount;
  late final TextEditingController _note;
  late DateTime _date;
  var _saving = false;

  @override
  void initState() {
    super.initState();
    _amount = TextEditingController(
        text: widget.suggestion.amount.toStringAsFixed(2));
    _note = TextEditingController();
    _date = DateTime.now();
  }

  @override
  void dispose() {
    _amount.dispose();
    _note.dispose();
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
                Text('Record settlement',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Text(
                  '${widget.suggestion.fromName} pays ${widget.suggestion.toName}',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _amount,
                  enabled: !_saving,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    labelText: 'Amount',
                    helperText:
                        'Maximum suggested ${money(widget.suggestion.amount)}',
                  ),
                  validator: (value) {
                    final amount = double.tryParse(value ?? '');
                    if (amount == null || amount <= 0) {
                      return 'Enter a valid amount';
                    }
                    if (amount - widget.suggestion.amount > 0.01) {
                      return 'Amount cannot exceed the suggested balance';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _note,
                  enabled: !_saving,
                  maxLength: 160,
                  decoration: const InputDecoration(labelText: 'Note'),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: _saving ? null : _pickDate,
                  icon: const Icon(Icons.calendar_month_outlined),
                  label: Text('Date: ${compactDate(_date)}'),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Record settlement'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      _date = DateTime(
        picked.year,
        picked.month,
        picked.day,
        _date.hour,
        _date.minute,
        _date.second,
      );
    });
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _saving = true);
    try {
      await ref.read(apiProvider).postJson('/api/settlements', {
        'groupId': widget.group.id,
        'fromMemberId': widget.suggestion.fromMemberId,
        'toMemberId': widget.suggestion.toMemberId,
        'amount': double.parse(_amount.text),
        'note': _note.text.trim(),
        'date': _date.toIso8601String(),
      });
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
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
    final currentUserId = currentUser?.id ?? '';
    final scheme = Theme.of(context).colorScheme;
    final total =
        expenses.fold<double>(0, (sum, expense) => sum + expense.amount);
    final youPaid = expenses
        .where((expense) => expense.paidById == currentUserId)
        .fold<double>(0, (sum, expense) => sum + expense.amount);
    final othersPaid = (total - youPaid).clamp(0, double.infinity).toDouble();

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Card(
            color: Color.lerp(scheme.surface, scheme.primary, 0.08),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Activity',
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                      ),
                      FilledButton.icon(
                        onPressed: onAddExpense,
                        icon: const Icon(Icons.add),
                        label: const Text('Add'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: _MiniAmountCard(
                          label: 'Total',
                          value: money(total),
                          color: scheme.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _MiniAmountCard(
                          label: 'You paid',
                          value: money(youPaid),
                          color: Colors.green,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _MiniAmountCard(
                          label: 'Others',
                          value: money(othersPaid),
                          color: Colors.red,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
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
                        child: Text(
                          section.label,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                      ),
                      _InfoChip(
                        label:
                            '${section.expenses.length} - ${money(section.total)}',
                      ),
                    ],
                  ),
                ),
                ...section.expenses.map(
                  (expense) => ExpenseTile(
                    expense: expense,
                    currentUserId: currentUserId,
                    showGroupName: false,
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
                    color: Color.lerp(scheme.surface, scheme.secondary, 0.06),
                    child: ListTile(
                      leading: Icon(
                        Icons.history_outlined,
                        color:
                            Color.lerp(scheme.onSurface, scheme.secondary, 0.6),
                      ),
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

class _MiniAmountCard extends StatelessWidget {
  const _MiniAmountCard({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Color.lerp(scheme.surface, color, 0.10),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelSmall,
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: TextStyle(
                color: Color.lerp(scheme.onSurface, color, 0.72),
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
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
    final scheme = Theme.of(context).colorScheme;
    final admins =
        group.members.where((member) => member.role == 'admin').length;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
      children: [
        Card(
          color: Color.lerp(scheme.surface, scheme.primary, 0.08),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor:
                      Color.lerp(scheme.surface, scheme.primary, 0.16),
                  foregroundColor: scheme.primary,
                  child: const Icon(Icons.groups_outlined),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${group.members.length} members',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      Text('$admins admin${admins == 1 ? '' : 's'}'),
                    ],
                  ),
                ),
                if (isAdmin)
                  FilledButton.icon(
                    onPressed: () async {
                      final changed = await showAddMemberDialog(
                          context: context, ref: ref, group: group);
                      if (changed == true) onChanged();
                    },
                    icon: const Icon(Icons.person_add_alt_1),
                    label: const Text('Add'),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        if (isAdmin)
          Text('Manage members',
              style: Theme.of(context).textTheme.titleMedium),
        if (isAdmin) const SizedBox(height: 8),
        ...group.members.map((member) => Card(
              color: Color.lerp(
                scheme.surface,
                member.role == 'admin' ? scheme.primary : scheme.secondary,
                member.role == 'admin' ? 0.08 : 0.04,
              ),
              child: ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                leading: CircleAvatar(child: Text(initials(member.name))),
                title: Text(
                  member.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    member.email.isEmpty ? member.type : member.email,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _RoleBadge(role: member.role),
                    if (isAdmin && member.role != 'admin') ...[
                      const SizedBox(width: 4),
                      IconButton(
                        tooltip: 'Remove member',
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
                    ],
                  ],
                ),
              ),
            )),
      ],
    );
  }
}

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});

  final String role;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isAdmin = role == 'admin';
    final color = isAdmin ? scheme.primary : scheme.outline;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: Color.lerp(scheme.surface, color, isAdmin ? 0.14 : 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        role,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Color.lerp(scheme.onSurface, color, isAdmin ? 0.70 : 0.35),
              fontWeight: FontWeight.w800,
            ),
      ),
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
