import { requireAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/db";
import Article from "@/models/Article";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import { NextResponse } from "next/server";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDateRange(days) {
  const end = startOfUtcDay(new Date());
  const start = new Date(end.getTime() - (days - 1) * MS_PER_DAY);
  const keys = [];

  for (let index = 0; index < days; index += 1) {
    keys.push(new Date(start.getTime() + index * MS_PER_DAY).toISOString().slice(0, 10));
  }

  return { start, keys };
}

function compactDateLabel(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fillDailySeries(keys, rows, valueKey = "count") {
  const byDate = new Map(rows.map((row) => [row._id, row]));
  return keys.map((date) => ({
    date,
    label: compactDateLabel(date),
    count: Number(byDate.get(date)?.count || 0),
    value: Number(byDate.get(date)?.[valueKey] || 0),
  }));
}

async function aggregateByDay(Model, dateField, start, extraGroupFields = {}) {
  return Model.aggregate([
    { $match: { [dateField]: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: 1 },
        ...extraGroupFields,
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

function normalizeRecentDoc(doc, type) {
  if (type === "expense") {
    return {
      id: doc._id.toString(),
      type,
      title: doc.description || "Expense added",
      subtitle: doc.groupId?.name || "Group expense",
      amount: Number(doc.amount || 0),
      createdAt: doc.createdAt || doc.date,
    };
  }

  if (type === "group") {
    return {
      id: doc._id.toString(),
      type,
      title: doc.name || "Group created",
      subtitle: doc.type || "group",
      amount: Number(doc.totalExpenses || 0),
      createdAt: doc.createdAt,
    };
  }

  return {
    id: doc._id.toString(),
    type,
    title: doc.fullName || doc.email || "User joined",
    subtitle: doc.email || doc.authProvider || "user",
    amount: 0,
    createdAt: doc.createdAt,
  };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const { start, keys } = buildDateRange(14);
    const last30Days = new Date(Date.now() - 30 * MS_PER_DAY);

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      googleUsers,
      totalGroups,
      activeGroups,
      totalExpenses,
      expenseTotals,
      totalArticles,
      publishedArticles,
      articleViews,
      newUsers30d,
      newGroups30d,
      newExpenses30d,
      expensesByDay,
      groupsByDay,
      usersByDay,
      expensesByCategory,
      groupsByType,
      recentUsers,
      recentGroups,
      recentExpenses,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isBlocked: { $ne: true } }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ authProvider: "google" }),
      Group.countDocuments({}),
      Group.countDocuments({ isActive: { $ne: false } }),
      Expense.countDocuments({}),
      Expense.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            averageAmount: { $avg: "$amount" },
          },
        },
      ]),
      Article.countDocuments({}),
      Article.countDocuments({ status: "published" }),
      Article.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }]),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Group.countDocuments({ createdAt: { $gte: last30Days } }),
      Expense.countDocuments({ createdAt: { $gte: last30Days } }),
      aggregateByDay(Expense, "createdAt", start, { amount: { $sum: "$amount" } }),
      aggregateByDay(Group, "createdAt", start),
      aggregateByDay(User, "createdAt", start),
      Expense.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
        { $sort: { amount: -1, count: -1 } },
      ]),
      Group.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, amount: { $sum: "$totalExpenses" } } },
        { $sort: { count: -1 } },
      ]),
      User.find({}).sort({ createdAt: -1 }).limit(5).select("fullName email authProvider createdAt").lean(),
      Group.find({}).sort({ createdAt: -1 }).limit(5).select("name type totalExpenses createdAt").lean(),
      Expense.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("description amount createdAt date groupId")
        .populate("groupId", "name")
        .lean(),
    ]);

    const recentActivity = [
      ...recentUsers.map((doc) => normalizeRecentDoc(doc, "user")),
      ...recentGroups.map((doc) => normalizeRecentDoc(doc, "group")),
      ...recentExpenses.map((doc) => normalizeRecentDoc(doc, "expense")),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        blockedUsers,
        googleUsers,
        localUsers: Math.max(totalUsers - googleUsers, 0),
        totalGroups,
        activeGroups,
        totalExpenses,
        totalExpenseAmount: Number(expenseTotals[0]?.totalAmount || 0),
        averageExpenseAmount: Number(expenseTotals[0]?.averageAmount || 0),
        totalArticles,
        publishedArticles,
        draftArticles: Math.max(totalArticles - publishedArticles, 0),
        articleViews: Number(articleViews[0]?.totalViews || 0),
        newUsers30d,
        newGroups30d,
        newExpenses30d,
      },
      charts: {
        expensesByDay: fillDailySeries(keys, expensesByDay, "amount"),
        groupsByDay: fillDailySeries(keys, groupsByDay),
        usersByDay: fillDailySeries(keys, usersByDay),
        expensesByCategory: expensesByCategory.map((item) => ({
          label: item._id || "other",
          count: item.count,
          amount: Number(item.amount || 0),
        })),
        groupsByType: groupsByType.map((item) => ({
          label: item._id || "other",
          count: item.count,
          amount: Number(item.amount || 0),
        })),
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Admin dashboard fetch error:", error);
    return NextResponse.json({ error: "Unable to load dashboard" }, { status: 500 });
  }
}
