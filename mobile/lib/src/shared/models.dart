class AppUser {
  const AppUser({
    required this.id,
    required this.fullName,
    required this.username,
    required this.email,
    this.contact = '',
    this.avatar,
    this.bio = '',
    this.role = 'user',
    this.emailVerified = true,
  });

  final String id;
  final String fullName;
  final String username;
  final String email;
  final String contact;
  final String? avatar;
  final String bio;
  final String role;
  final bool emailVerified;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: idOf(json['id'] ?? json['_id']),
      fullName: stringOf(json['fullName']),
      username: stringOf(json['username']),
      email: stringOf(json['email']),
      contact: stringOf(json['contact']),
      avatar: emptyToNull(json['avatar']),
      bio: stringOf(json['bio']),
      role: stringOf(json['role'], fallback: 'user'),
      emailVerified: json['emailVerified'] != false,
    );
  }
}

class GroupMember {
  const GroupMember({
    required this.id,
    required this.userId,
    required this.name,
    required this.email,
    required this.role,
    required this.type,
    this.contact = '',
  });

  final String id;
  final String userId;
  final String name;
  final String email;
  final String role;
  final String type;
  final String contact;

  factory GroupMember.fromJson(Map<String, dynamic> json) {
    return GroupMember(
      id: idOf(json['_id']),
      userId: idOf(json['userId']),
      name: stringOf(json['fullName'] ?? json['name'], fallback: 'Unknown'),
      email: stringOf(json['email']),
      role: stringOf(json['role'], fallback: 'member'),
      type: stringOf(json['type'], fallback: 'registered'),
      contact: stringOf(json['contact']),
    );
  }
}

class MoneyGroup {
  const MoneyGroup({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.currency,
    required this.totalExpenses,
    required this.members,
    this.image,
    this.inviteToken,
  });

  final String id;
  final String name;
  final String description;
  final String type;
  final String currency;
  final double totalExpenses;
  final List<GroupMember> members;
  final String? image;
  final String? inviteToken;

  bool isAdmin(String userId) {
    return members.any((m) => m.userId == userId && m.role == 'admin');
  }

  factory MoneyGroup.fromJson(Map<String, dynamic> json) {
    return MoneyGroup(
      id: idOf(json['_id'] ?? json['id']),
      name: stringOf(json['name'], fallback: 'Untitled group'),
      description: stringOf(json['description']),
      type: stringOf(json['type'], fallback: 'event'),
      currency: stringOf(json['currency'], fallback: 'INR'),
      totalExpenses: numberOf(json['totalExpenses']),
      image: emptyToNull(json['image']),
      inviteToken: emptyToNull(json['inviteToken']),
      members: listOf(json['members'])
          .whereType<Map<String, dynamic>>()
          .map(GroupMember.fromJson)
          .toList(),
    );
  }
}

class ExpenseSplit {
  const ExpenseSplit({
    required this.userId,
    required this.name,
    required this.amount,
    required this.percentage,
  });

  final String userId;
  final String name;
  final double amount;
  final double percentage;

  factory ExpenseSplit.fromJson(Map<String, dynamic> json) {
    final user = json['userId'];
    return ExpenseSplit(
      userId: idOf(user),
      name: user is Map<String, dynamic>
          ? stringOf(user['fullName'] ?? user['username'], fallback: 'Member')
          : 'Member',
      amount: numberOf(json['amount']),
      percentage: numberOf(json['percentage']),
    );
  }
}

class Expense {
  const Expense({
    required this.id,
    required this.description,
    required this.amount,
    required this.category,
    required this.date,
    required this.groupId,
    required this.groupName,
    required this.paidById,
    required this.paidByName,
    required this.splitBetween,
  });

  final String id;
  final String description;
  final double amount;
  final String category;
  final DateTime date;
  final String groupId;
  final String groupName;
  final String paidById;
  final String paidByName;
  final List<ExpenseSplit> splitBetween;

  factory Expense.fromJson(Map<String, dynamic> json) {
    final group = json['groupId'];
    final paidBy = json['paidBy'];
    return Expense(
      id: idOf(json['_id'] ?? json['id']),
      description: stringOf(json['description'], fallback: 'Expense'),
      amount: numberOf(json['amount']),
      category: stringOf(json['category'], fallback: 'other'),
      date: DateTime.tryParse(stringOf(json['date'])) ?? DateTime.now(),
      groupId: idOf(group),
      groupName: group is Map<String, dynamic>
          ? stringOf(group['name'], fallback: 'Unknown group')
          : 'Unknown group',
      paidById: idOf(paidBy),
      paidByName: paidBy is Map<String, dynamic>
          ? stringOf(paidBy['fullName'] ?? paidBy['username'],
              fallback: 'Unknown')
          : 'Unknown',
      splitBetween: listOf(json['splitBetween'])
          .whereType<Map<String, dynamic>>()
          .map(ExpenseSplit.fromJson)
          .toList(),
    );
  }
}

class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: idOf(json['_id'] ?? json['id']),
      title: stringOf(json['title'], fallback: 'Notification'),
      message: stringOf(json['message']),
      type: stringOf(json['type'], fallback: 'default'),
      isRead: json['isRead'] == true,
      createdAt:
          DateTime.tryParse(stringOf(json['createdAt'])) ?? DateTime.now(),
    );
  }
}

class ActivityItem {
  const ActivityItem({
    required this.id,
    required this.message,
    required this.type,
    required this.createdAt,
  });

  final String id;
  final String message;
  final String type;
  final DateTime createdAt;

  factory ActivityItem.fromJson(Map<String, dynamic> json) {
    return ActivityItem(
      id: idOf(json['_id'] ?? json['id']),
      message: stringOf(json['message']),
      type: stringOf(json['type'], fallback: 'activity'),
      createdAt:
          DateTime.tryParse(stringOf(json['createdAt'])) ?? DateTime.now(),
    );
  }
}

String stringOf(dynamic value, {String fallback = ''}) {
  if (value == null) return fallback;
  return value.toString();
}

String idOf(dynamic value) {
  if (value == null) return '';
  if (value is String || value is num) return value.toString();
  if (value is Map<String, dynamic>) {
    return idOf(value['_id'] ?? value['id'] ?? value['userId']);
  }
  return value.toString();
}

double numberOf(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

String? emptyToNull(dynamic value) {
  final text = stringOf(value).trim();
  return text.isEmpty ? null : text;
}

List<dynamic> listOf(dynamic value) {
  return value is List ? value : const [];
}
