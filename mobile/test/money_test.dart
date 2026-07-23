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
          ExpenseSplit(
              userId: 'u1', name: 'User One', amount: 50, percentage: 50),
          ExpenseSplit(
              userId: 'u2', name: 'User Two', amount: 50, percentage: 50),
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
          ExpenseSplit(
              userId: 'u1', name: 'User One', amount: 40, percentage: 50),
          ExpenseSplit(
              userId: 'u2', name: 'User Two', amount: 40, percentage: 50),
        ],
      ),
    ];

    final balances = computeBalances(expenses, 'u1');

    expect(balances.owed, 50);
    expect(balances.owe, 40);
  });

  test('computeGroupSettlementPlan reduces balances after partial settlement',
      () {
    const group = MoneyGroup(
      id: 'g1',
      name: 'Trip',
      description: '',
      type: 'trip',
      currency: 'INR',
      totalExpenses: 120,
      members: [
        GroupMember(
          id: 'm1',
          userId: 'u1',
          name: 'Asha',
          email: 'asha@example.com',
          role: 'admin',
          type: 'registered',
        ),
        GroupMember(
          id: 'm2',
          userId: 'u2',
          name: 'Ravi',
          email: 'ravi@example.com',
          role: 'member',
          type: 'registered',
        ),
      ],
    );
    final expenses = [
      Expense(
        id: 'e1',
        description: 'Hotel',
        amount: 120,
        category: 'accommodation',
        date: DateTime(2026),
        groupId: 'g1',
        groupName: 'Trip',
        paidById: 'u1',
        paidByName: 'Asha',
        splitBetween: const [
          ExpenseSplit(userId: 'u1', name: 'Asha', amount: 60, percentage: 50),
          ExpenseSplit(userId: 'u2', name: 'Ravi', amount: 60, percentage: 50),
        ],
      ),
    ];

    final before = computeGroupSettlementPlan(group, expenses, const []);
    expect(before.suggestions.single.fromMemberId, 'u2');
    expect(before.suggestions.single.toMemberId, 'u1');
    expect(before.suggestions.single.amount, 60);

    final after = computeGroupSettlementPlan(group, expenses, [
      SettlementItem(
        id: 's1',
        groupId: 'g1',
        fromMemberId: 'u2',
        fromName: 'Ravi',
        toMemberId: 'u1',
        toName: 'Asha',
        amount: 25,
        date: DateTime(2026),
      ),
    ]);

    expect(after.suggestions.single.amount, 35);
  });
}
