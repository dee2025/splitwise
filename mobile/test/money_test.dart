import 'package:flutter_test/flutter_test.dart';
import 'package:moneysplit_mobile/src/shared/models.dart';
import 'package:moneysplit_mobile/src/shared/money.dart';

void main() {
  test('equalSplits balances rounding differences on the last member', () {
    final splits = equalSplits(100, ['u1', 'u2', 'u3']);

    expect(splits, hasLength(3));
    expect(
      splits.fold<double>(0, (sum, split) => sum + (split['amount'] as double)),
      100,
    );
  });

  test('computeBalances tracks owed and owe for the current user', () {
    final expenses = [
      Expense(
        id: 'e1',
        description: 'Dinner',
        amount: 100,
        category: 'food',
        date: DateTime(2026),
        groupId: 'g1',
        groupName: 'Trip',
        paidById: 'u1',
        paidByName: 'User One',
        splitBetween: const [
          ExpenseSplit(userId: 'u1', name: 'User One', amount: 50, percentage: 50),
          ExpenseSplit(userId: 'u2', name: 'User Two', amount: 50, percentage: 50),
        ],
      ),
      Expense(
        id: 'e2',
        description: 'Taxi',
        amount: 80,
        category: 'travel',
        date: DateTime(2026),
        groupId: 'g1',
        groupName: 'Trip',
        paidById: 'u2',
        paidByName: 'User Two',
        splitBetween: const [
          ExpenseSplit(userId: 'u1', name: 'User One', amount: 40, percentage: 50),
          ExpenseSplit(userId: 'u2', name: 'User Two', amount: 40, percentage: 50),
        ],
      ),
    ];

    final balances = computeBalances(expenses, 'u1');

    expect(balances.owed, 50);
    expect(balances.owe, 40);
  });
}
