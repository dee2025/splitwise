import 'package:intl/intl.dart';

import 'models.dart';

final _moneyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: 'Rs. ',
  decimalDigits: 0,
);

String money(num value) => _moneyFormat.format(value);

String compactDate(DateTime date) {
  return DateFormat('d MMM yyyy').format(date.toLocal());
}

({double owed, double owe}) computeBalances(
    List<Expense> expenses, String userId) {
  double owed = 0;
  double owe = 0;

  for (final expense in expenses) {
    ExpenseSplit? mySplit;
    for (final split in expense.splitBetween) {
      if (split.userId == userId) {
        mySplit = split;
        break;
      }
    }
    final share = mySplit?.amount ?? 0;
    if (expense.paidById == userId) {
      owed += (expense.amount - share).clamp(0, double.infinity).toDouble();
    } else {
      owe += share;
    }
  }

  return (owed: owed, owe: owe);
}

double groupBalance(List<Expense> expenses, String userId, String groupId) {
  final balances = computeBalances(
    expenses.where((expense) => expense.groupId == groupId).toList(),
    userId,
  );
  return balances.owed - balances.owe;
}

class MemberBalance {
  const MemberBalance({
    required this.id,
    required this.name,
    required this.balance,
  });

  final String id;
  final String name;
  final double balance;
}

class SettlementSuggestion {
  const SettlementSuggestion({
    required this.fromMemberId,
    required this.fromName,
    required this.toMemberId,
    required this.toName,
    required this.amount,
  });

  final String fromMemberId;
  final String fromName;
  final String toMemberId;
  final String toName;
  final double amount;
}

class SettlementPlan {
  const SettlementPlan({
    required this.balances,
    required this.suggestions,
  });

  final List<MemberBalance> balances;
  final List<SettlementSuggestion> suggestions;
}

SettlementPlan computeGroupSettlementPlan(
  MoneyGroup group,
  List<Expense> expenses,
  List<SettlementItem> settlements,
) {
  final memberNames = <String, String>{};
  final balances = <String, double>{};

  for (final member in group.members) {
    final id = memberBalanceId(member);
    if (id.isEmpty) continue;
    memberNames[id] = member.name;
    balances[id] = 0;
  }

  for (final expense in expenses) {
    final payerId = expense.paidById;
    if (payerId.isNotEmpty) {
      balances[payerId] = roundMoney((balances[payerId] ?? 0) + expense.amount);
    }
    for (final split in expense.splitBetween) {
      if (split.userId.isEmpty) continue;
      balances[split.userId] =
          roundMoney((balances[split.userId] ?? 0) - split.amount);
    }
  }

  for (final settlement in settlements) {
    if (settlement.fromMemberId.isNotEmpty) {
      balances[settlement.fromMemberId] = roundMoney(
        (balances[settlement.fromMemberId] ?? 0) + settlement.amount,
      );
    }
    if (settlement.toMemberId.isNotEmpty) {
      balances[settlement.toMemberId] = roundMoney(
        (balances[settlement.toMemberId] ?? 0) - settlement.amount,
      );
    }
  }

  final rows = balances.entries
      .map((entry) => MemberBalance(
            id: entry.key,
            name: memberNames[entry.key] ?? 'Member',
            balance: roundMoney(entry.value),
          ))
      .toList()
    ..sort((a, b) => b.balance.compareTo(a.balance));

  final creditors = rows
      .where((row) => row.balance > 0.01)
      .map((row) => _MutableBalance(row.id, row.name, row.balance))
      .toList();
  final debtors = rows
      .where((row) => row.balance < -0.01)
      .map((row) => _MutableBalance(row.id, row.name, row.balance.abs()))
      .toList();

  final suggestions = <SettlementSuggestion>[];
  var debtorIndex = 0;
  var creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    final debtor = debtors[debtorIndex];
    final creditor = creditors[creditorIndex];
    final amount = roundMoney(
      debtor.remaining < creditor.remaining
          ? debtor.remaining
          : creditor.remaining,
    );

    if (amount > 0.01) {
      suggestions.add(SettlementSuggestion(
        fromMemberId: debtor.id,
        fromName: debtor.name,
        toMemberId: creditor.id,
        toName: creditor.name,
        amount: amount,
      ));
    }

    debtor.remaining = roundMoney(debtor.remaining - amount);
    creditor.remaining = roundMoney(creditor.remaining - amount);

    if (debtor.remaining <= 0.01) debtorIndex++;
    if (creditor.remaining <= 0.01) creditorIndex++;
  }

  return SettlementPlan(balances: rows, suggestions: suggestions);
}

String memberBalanceId(GroupMember member) {
  return member.userId.isNotEmpty ? member.userId : member.id;
}

double roundMoney(num value) {
  return double.parse(value.toStringAsFixed(2));
}

class _MutableBalance {
  _MutableBalance(this.id, this.name, this.remaining);

  final String id;
  final String name;
  double remaining;
}

List<Map<String, dynamic>> equalSplits(double amount, List<String> userIds) {
  if (userIds.isEmpty || amount <= 0) return [];
  final base = double.parse((amount / userIds.length).toStringAsFixed(2));
  final splits = userIds
      .map((id) => {
            'userId': id,
            'amount': base,
            'percentage':
                double.parse(((base / amount) * 100).toStringAsFixed(2)),
          })
      .toList();
  final used =
      splits.fold<double>(0, (sum, split) => sum + (split['amount'] as double));
  final diff = double.parse((amount - used).toStringAsFixed(2));
  splits.last['amount'] = double.parse(
      ((splits.last['amount'] as double) + diff).toStringAsFixed(2));
  return splits;
}
