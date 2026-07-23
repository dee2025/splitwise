import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/models.dart';
import '../../shared/money.dart';
import '../../shared/providers.dart';
import '../../shared/screen_utils.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  var _loading = true;
  Object? _error;
  List<MoneyGroup> _groups = const [];
  List<Expense> _expenses = const [];

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
        _groups = listOf(results[0]['groups']).whereType<Map<String, dynamic>>().map(MoneyGroup.fromJson).toList();
        _expenses = listOf(results[1]['expenses']).whereType<Map<String, dynamic>>().map(Expense.fromJson).toList();
      });
    } catch (error) {
      _error = error;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    if (_loading) return const Scaffold(body: LoadingView());
    if (_error != null) return Scaffold(body: ErrorView(message: _error.toString(), onRetry: _load));

    final balances = computeBalances(_expenses, user?.id ?? '');
    final net = balances.owed - balances.owe;
    final topGroups = [..._groups]
      ..sort((a, b) => groupBalance(_expenses, user?.id ?? '', b.id).abs().compareTo(groupBalance(_expenses, user?.id ?? '', a.id).abs()));

    return Scaffold(
      appBar: AppBar(title: const Text('MoneySplit')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Hi ${_firstName(user?.fullName ?? 'there')}', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 4),
            Text('Let us settle smartly.', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(child: BalanceCard(label: 'You are owed', amount: balances.owed, color: Colors.greenAccent)),
                const SizedBox(width: 12),
                Expanded(child: BalanceCard(label: 'You owe', amount: balances.owe, color: Colors.redAccent)),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.account_balance_wallet_outlined),
                title: const Text('Overall balance'),
                subtitle: Text('${money(_expenses.fold<double>(0, (sum, e) => sum + e.amount))} recorded'),
                trailing: Text(money(net.abs()), style: TextStyle(color: net >= 0 ? Colors.greenAccent : Colors.redAccent, fontWeight: FontWeight.w800)),
                onTap: () => context.go('/expenses'),
              ),
            ),
            const SizedBox(height: 22),
            SectionHeader(
              title: 'Your Groups',
              trailing: TextButton(onPressed: () => context.go('/groups'), child: const Text('View all')),
            ),
            if (topGroups.isEmpty)
              EmptyView(
                icon: Icons.group_add_outlined,
                title: 'No groups yet',
                message: 'Create a group to start tracking shared expenses.',
                action: FilledButton(onPressed: () => context.go('/groups'), child: const Text('Create group')),
              )
            else
              ...topGroups.take(4).map(
                    (group) => Card(
                      child: ListTile(
                        leading: CircleAvatar(child: Text(_initials(group.name))),
                        title: Text(group.name),
                        subtitle: Text('${group.members.length} members'),
                        trailing: Text(money(groupBalance(_expenses, user?.id ?? '', group.id))),
                        onTap: () => context.go('/groups/${group.id}'),
                      ),
                    ),
                  ),
            const SizedBox(height: 22),
            const SectionHeader(title: 'Recent Expenses'),
            if (_expenses.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Text('No expenses added yet.'),
              )
            else
              ..._expenses.take(4).map(
                    (expense) => Card(
                      child: ListTile(
                        leading: const Icon(Icons.receipt_long_outlined),
                        title: Text(expense.description),
                        subtitle: Text('${expense.groupName} - ${compactDate(expense.date)}'),
                        trailing: Text(money(expense.amount)),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

class BalanceCard extends StatelessWidget {
  const BalanceCard({
    required this.label,
    required this.amount,
    required this.color,
    super.key,
  });

  final String label;
  final double amount;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            Text(money(amount), style: Theme.of(context).textTheme.titleLarge?.copyWith(color: color, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}

String _firstName(String name) {
  final parts = name.trim().split(RegExp(r'\s+'));
  return parts.isEmpty || parts.first.isEmpty ? 'there' : parts.first;
}

String _initials(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((part) => part.isNotEmpty).toList();
  if (parts.isEmpty) return 'G';
  return parts.take(2).map((part) => part[0]).join().toUpperCase();
}
