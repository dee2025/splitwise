import Activity from "@/models/Activity";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

function sameId(left, right) {
  return left?.toString?.() === right?.toString?.();
}

function getRegisteredReplacement(members) {
  return (
    members.find((member) => member.userId && member.role === "admin") ||
    members.find((member) => member.userId)
  );
}

async function recalculateGroupTotals(groupIds, deletedGroupIds) {
  const ids = [...groupIds]
    .filter((groupId) => groupId && !deletedGroupIds.has(groupId))
    .map((groupId) => new mongoose.Types.ObjectId(groupId));

  if (!ids.length) return;

  const totals = await Expense.aggregate([
    { $match: { groupId: { $in: ids } } },
    { $group: { _id: "$groupId", totalExpenses: { $sum: "$amount" } } },
  ]);

  const totalsByGroup = new Map(
    totals.map((item) => [item._id.toString(), Number(item.totalExpenses || 0)]),
  );

  await Promise.all(
    ids.map((groupId) =>
      Group.updateOne(
        { _id: groupId },
        { $set: { totalExpenses: totalsByGroup.get(groupId.toString()) || 0 } },
      ),
    ),
  );
}

export async function deleteUserAccountData(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);
  const impactedGroupIds = new Set();
  const deletedGroupIds = new Set();

  const groups = await Group.find({
    $or: [{ "members.userId": objectId }, { createdBy: objectId }],
  })
    .select("_id createdBy members")
    .lean();

  for (const group of groups) {
    impactedGroupIds.add(group._id.toString());
  }

  const expenseQuery = {
    $or: [
      { paidBy: objectId },
      { paidTo: objectId },
      { "splitBetween.userId": objectId },
    ],
  };

  const expensesToDelete = await Expense.find(expenseQuery).select("_id groupId").lean();
  for (const expense of expensesToDelete) {
    if (expense.groupId) {
      impactedGroupIds.add(expense.groupId.toString());
    }
  }

  const [deletedExpenses, deletedNotifications, deletedActivities] = await Promise.all([
    Expense.deleteMany(expenseQuery),
    Notification.deleteMany({ userId: objectId }),
    Activity.deleteMany({ userId: objectId }),
  ]);

  for (const group of groups) {
    const remainingMembers = (group.members || []).filter(
      (member) => !sameId(member.userId, objectId),
    );
    const userCreatedGroup = sameId(group.createdBy, objectId);

    if (userCreatedGroup) {
      const replacement = getRegisteredReplacement(remainingMembers);

      if (!replacement) {
        await Promise.all([
          Expense.deleteMany({ groupId: group._id }),
          Activity.deleteMany({ groupId: group._id }),
          Group.deleteOne({ _id: group._id }),
        ]);
        deletedGroupIds.add(group._id.toString());
        continue;
      }

      const nextMembers = remainingMembers.map((member) => ({
        ...member,
        role: sameId(member.userId, replacement.userId) ? "admin" : member.role,
      }));

      await Group.updateOne(
        { _id: group._id },
        {
          $set: {
            createdBy: replacement.userId,
            members: nextMembers,
          },
        },
      );
    } else {
      await Group.updateOne(
        { _id: group._id },
        { $pull: { members: { userId: objectId } } },
      );
    }
  }

  await recalculateGroupTotals(impactedGroupIds, deletedGroupIds);
  const deletedUser = await User.deleteOne({ _id: objectId });

  return {
    success: deletedUser.deletedCount === 1,
    deletedExpenses: deletedExpenses.deletedCount || 0,
    deletedNotifications: deletedNotifications.deletedCount || 0,
    deletedActivities: deletedActivities.deletedCount || 0,
    deletedGroups: deletedGroupIds.size,
    updatedGroups: groups.length - deletedGroupIds.size,
  };
}
