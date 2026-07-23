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

({double owed, double owe}) computeBalances(List<Expense> expenses, String userId) {
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

List<Map<String, dynamic>> equalSplits(double amount, List<String> userIds) {
  if (userIds.isEmpty || amount <= 0) return [];
  final base = double.parse((amount / userIds.length).toStringAsFixed(2));
  final splits = userIds
      .map((id) => {
            'userId': id,
            'amount': base,
            'percentage': double.parse(((base / amount) * 100).toStringAsFixed(2)),
          })
      .toList();
  final used = splits.fold<double>(0, (sum, split) => sum + (split['amount'] as double));
  final diff = double.parse((amount - used).toStringAsFixed(2));
  splits.last['amount'] = double.parse(((splits.last['amount'] as double) + diff).toStringAsFixed(2));
  return splits;
}
