import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/models.dart';
import '../../shared/money.dart';
import '../../shared/providers.dart';
import '../../shared/screen_utils.dart';

const expenseCategories = ['food', 'travel', 'accommodation', 'shopping', 'entertainment', 'other'];

class ExpensesScreen extends ConsumerStatefulWidget {
  const ExpensesScreen({super.key});

  @override
  ConsumerState<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends ConsumerState<ExpensesScreen> {
  var _loading = true;
  Object? _error;
  List<Expense> _expenses = const [];
  List<MoneyGroup> _groups = const [];
  String _category = 'all';
  String _groupId = 'all';

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
        api.getJson('/api/expenses'),
        api.getJson('/api/groups'),
      ]);
      setState(() {
        _expenses = listOf(results[0]['expenses']).whereType<Map<String, dynamic>>().map(Expense.fromJson).toList();
        _groups = listOf(results[1]['groups']).whereType<Map<String, dynamic>>().map(MoneyGroup.fromJson).toList();
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
    if (_loading) return const Scaffold(body: LoadingView());
    if (_error != null) return Scaffold(body: ErrorView(message: _error.toString(), onRetry: _load));

    final filtered = _expenses.where((expense) {
      return (_category == 'all' || expense.category == _category) && (_groupId == 'all' || expense.groupId == _groupId);
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Expenses')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _groups.isEmpty
            ? null
            : () async {
                final changed = await showExpenseEditor(
                  context: context,
                  ref: ref,
                  groups: _groups,
                  currentUser: user,
                );
                if (changed == true) _load();
              },
        icon: const Icon(Icons.add),
        label: const Text('Add'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                DropdownMenu<String>(
                  initialSelection: _category,
                  label: const Text('Category'),
                  onSelected: (value) => setState(() => _category = value ?? 'all'),
                  dropdownMenuEntries: [
                    const DropdownMenuEntry(value: 'all', label: 'All categories'),
                    ...expenseCategories.map((category) => DropdownMenuEntry(value: category, label: categoryLabel(category))),
                  ],
                ),
                DropdownMenu<String>(
                  initialSelection: _groupId,
                  label: const Text('Group'),
                  onSelected: (value) => setState(() => _groupId = value ?? 'all'),
                  dropdownMenuEntries: [
                    const DropdownMenuEntry(value: 'all', label: 'All groups'),
                    ..._groups.map((group) => DropdownMenuEntry(value: group.id, label: group.name)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (filtered.isEmpty)
              const EmptyView(
                icon: Icons.receipt_long_outlined,
                title: 'No expenses',
                message: 'Expenses you add or share will appear here.',
              )
            else
              ...filtered.map(
                (expense) => ExpenseTile(
                  expense: expense,
                  currentUserId: user?.id ?? '',
                  onTap: () async {
                    final changed = await showExpenseDetails(
                      context: context,
                      ref: ref,
                      expense: expense,
                      groups: _groups,
                      currentUser: user,
                    );
                    if (changed == true) _load();
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class ExpenseTile extends StatelessWidget {
  const ExpenseTile({
    required this.expense,
    required this.currentUserId,
    required this.onTap,
    super.key,
  });

  final Expense expense;
  final String currentUserId;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    ExpenseSplit? myShare;
    for (final split in expense.splitBetween) {
      if (split.userId == currentUserId) {
        myShare = split;
        break;
      }
    }
    final isPayer = expense.paidById == currentUserId;

    return Card(
      child: ListTile(
        leading: Icon(categoryIcon(expense.category)),
        title: Text(expense.description),
        subtitle: Text('${expense.groupName} - paid by ${isPayer ? 'you' : expense.paidByName}'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(money(expense.amount), style: const TextStyle(fontWeight: FontWeight.w800)),
            Text(isPayer ? 'you paid' : 'share ${money(myShare?.amount ?? 0)}', style: Theme.of(context).textTheme.labelSmall),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}

Future<bool?> showExpenseDetails({
  required BuildContext context,
  required WidgetRef ref,
  required Expense expense,
  required List<MoneyGroup> groups,
  required AppUser? currentUser,
}) {
  final canEdit = currentUser?.id == expense.paidById;
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    builder: (context) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(expense.description, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('${money(expense.amount)} - ${categoryLabel(expense.category)}'),
            const SizedBox(height: 16),
            Text('Split details', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...expense.splitBetween.map((split) => ListTile(
                  dense: true,
                  title: Text(split.name),
                  trailing: Text(money(split.amount)),
                )),
            const SizedBox(height: 12),
            if (canEdit) ...[
              FilledButton.icon(
                onPressed: () async {
                  final changed = await showExpenseEditor(
                    context: context,
                    ref: ref,
                    groups: groups,
                    currentUser: currentUser,
                    expense: expense,
                  );
                  if (context.mounted) Navigator.pop(context, changed);
                },
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit expense'),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () async {
                  final confirmed = await confirmDestructive(
                    context,
                    title: 'Delete expense?',
                    message: 'This removes the expense from the group total.',
                  );
                  if (!confirmed) return;
                  try {
                    await ref.read(apiProvider).deleteJson('/api/expenses/${expense.id}', {});
                    if (context.mounted) Navigator.pop(context, true);
                  } catch (error) {
                    if (context.mounted) showError(context, error);
                  }
                },
                icon: const Icon(Icons.delete_outline),
                label: const Text('Delete expense'),
              ),
            ],
          ],
        ),
      ),
    ),
  );
}

Future<bool?> showExpenseEditor({
  required BuildContext context,
  required WidgetRef ref,
  required List<MoneyGroup> groups,
  required AppUser? currentUser,
  Expense? expense,
  String? fixedGroupId,
}) async {
  if (currentUser == null) return false;
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    builder: (context) => ExpenseEditorSheet(
      groups: groups,
      currentUser: currentUser,
      expense: expense,
      fixedGroupId: fixedGroupId,
    ),
  );
}

class ExpenseEditorSheet extends ConsumerStatefulWidget {
  const ExpenseEditorSheet({
    required this.groups,
    required this.currentUser,
    this.expense,
    this.fixedGroupId,
    super.key,
  });

  final List<MoneyGroup> groups;
  final AppUser currentUser;
  final Expense? expense;
  final String? fixedGroupId;

  @override
  ConsumerState<ExpenseEditorSheet> createState() => _ExpenseEditorSheetState();
}

class _ExpenseEditorSheetState extends ConsumerState<ExpenseEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _description;
  late final TextEditingController _amount;
  late String _groupId;
  late String _category;
  late Set<String> _splitIds;
  var _saving = false;

  @override
  void initState() {
    super.initState();
    _description = TextEditingController(text: widget.expense?.description ?? '');
    _amount = TextEditingController(text: widget.expense?.amount.toStringAsFixed(2) ?? '');
    _groupId = widget.fixedGroupId ?? widget.expense?.groupId ?? widget.groups.first.id;
    _category = widget.expense?.category ?? 'other';
    _splitIds = {
      if (widget.expense != null) ...widget.expense!.splitBetween.map((s) => s.userId),
      if (widget.expense == null) ...(_selectedGroup?.members.map(_splitIdForMember).where((id) => id.isNotEmpty) ?? <String>[]),
    };
  }

  MoneyGroup? get _selectedGroup {
    for (final group in widget.groups) {
      if (group.id == _groupId) return group;
    }
    return widget.groups.isEmpty ? null : widget.groups.first;
  }

  @override
  void dispose() {
    _description.dispose();
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final group = _selectedGroup;
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
                Text(widget.expense == null ? 'Add expense' : 'Edit expense', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                if (widget.fixedGroupId == null)
                  DropdownButtonFormField<String>(
                    initialValue: _groupId,
                    decoration: const InputDecoration(labelText: 'Group'),
                    items: widget.groups.map((group) => DropdownMenuItem(value: group.id, child: Text(group.name))).toList(),
                    onChanged: (value) => setState(() {
                      _groupId = value ?? _groupId;
                      _splitIds = _selectedGroup?.members.map(_splitIdForMember).where((id) => id.isNotEmpty).toSet() ?? {};
                    }),
                  ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _description,
                  decoration: const InputDecoration(labelText: 'Description'),
                  validator: (value) => (value ?? '').trim().isEmpty ? 'Description is required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _amount,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Amount'),
                  validator: (value) {
                    final amount = double.tryParse(value ?? '');
                    if (amount == null || amount <= 0) return 'Enter a valid amount';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _category,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: expenseCategories.map((category) => DropdownMenuItem(value: category, child: Text(categoryLabel(category)))).toList(),
                  onChanged: (value) => setState(() => _category = value ?? 'other'),
                ),
                const SizedBox(height: 16),
                Text('Split between', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (group != null)
                  ...group.members.where((m) => _splitIdForMember(m).isNotEmpty).map(
                        (member) => CheckboxListTile(
                          value: _splitIds.contains(_splitIdForMember(member)),
                          title: Text(member.userId == widget.currentUser.id ? 'You' : member.name),
                          onChanged: (checked) => setState(() {
                            final splitId = _splitIdForMember(member);
                            if (checked == true) {
                              _splitIds.add(splitId);
                            } else {
                              _splitIds.remove(splitId);
                            }
                          }),
                        ),
                      ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Save expense'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    if (_splitIds.isEmpty) {
      showError(context, 'Select at least one member');
      return;
    }
    setState(() => _saving = true);
    final amount = double.parse(_amount.text);
    final splitBetween = equalSplits(amount, _splitIds.toList());
    final body = {
      'description': _description.text.trim(),
      'amount': amount,
      'groupId': _groupId,
      'category': _category,
      'paidBy': widget.currentUser.id,
      'paidTo': _splitIds.toList(),
      'splitBetween': splitBetween,
      'date': DateTime.now().toIso8601String(),
    };

    try {
      final api = ref.read(apiProvider);
      if (widget.expense == null) {
        await api.postJson('/api/expenses', body);
      } else {
        await api.putJson('/api/expenses/${widget.expense!.id}', body);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

String categoryLabel(String category) {
  return switch (category) {
    'food' => 'Food & Dining',
    'travel' => 'Travel',
    'accommodation' => 'Accommodation',
    'shopping' => 'Shopping',
    'entertainment' => 'Entertainment',
    _ => 'Other',
  };
}

IconData categoryIcon(String category) {
  return switch (category) {
    'food' => Icons.restaurant_outlined,
    'travel' => Icons.flight_takeoff_outlined,
    'accommodation' => Icons.bed_outlined,
    'shopping' => Icons.shopping_bag_outlined,
    'entertainment' => Icons.music_note_outlined,
    _ => Icons.receipt_long_outlined,
  };
}

String _splitIdForMember(GroupMember member) {
  return member.userId.isNotEmpty ? member.userId : member.id;
}
