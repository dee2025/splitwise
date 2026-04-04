import { verifyToken } from "@/lib/auth";
import { createActivity } from "@/lib/createActivity";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const ALLOWED_CATEGORIES = new Set([
  "food",
  "travel",
  "accommodation",
  "shopping",
  "entertainment",
  "other",
]);

function recalculateSplitAmounts(splitBetween = [], nextAmount) {
  if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
    return [];
  }

  const oldTotal = splitBetween.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  if (oldTotal <= 0) {
    const equal = Number((nextAmount / splitBetween.length).toFixed(2));
    const mapped = splitBetween.map((item) => ({
      ...item,
      amount: equal,
      percentage: Number(((equal / nextAmount) * 100).toFixed(2)),
    }));
    const used = mapped.reduce((sum, item) => sum + item.amount, 0);
    const diff = Number((nextAmount - used).toFixed(2));
    mapped[mapped.length - 1].amount = Number(
      (mapped[mapped.length - 1].amount + diff).toFixed(2),
    );
    return mapped;
  }

  const mapped = splitBetween.map((item) => {
    const ratio = Number(item.amount || 0) / oldTotal;
    const rawAmount = nextAmount * ratio;
    const roundedAmount = Number(rawAmount.toFixed(2));

    return {
      ...item,
      amount: roundedAmount,
      percentage: Number((ratio * 100).toFixed(2)),
    };
  });

  const used = mapped.reduce((sum, item) => sum + item.amount, 0);
  const diff = Number((nextAmount - used).toFixed(2));
  mapped[mapped.length - 1].amount = Number(
    (mapped[mapped.length - 1].amount + diff).toFixed(2),
  );

  return mapped;
}

async function authorizeExpenseMutation(request, expenseId) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.userId);
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return {
      error: NextResponse.json(
        { error: "Invalid expense ID format" },
        { status: 400 },
      ),
    };
  }

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    return { error: NextResponse.json({ error: "Expense not found" }, { status: 404 }) };
  }

  const group = await Group.findById(expense.groupId);
  if (!group) {
    return { error: NextResponse.json({ error: "Group not found" }, { status: 404 }) };
  }

  const userId = user._id.toString();
  const member = group.members.find((m) => {
    const memberId = m.userId?._id?.toString() || m.userId?.toString();
    return memberId === userId;
  });

  if (!member) {
    return {
      error: NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 },
      ),
    };
  }

  const isAdmin = member.role === "admin";
  const isPayer = expense.paidBy?.toString() === userId;

  if (!isAdmin && !isPayer) {
    return {
      error: NextResponse.json(
        { error: "Only the payer or a group admin can modify this expense" },
        { status: 403 },
      ),
    };
  }

  return { user, group, expense };
}

async function resolveExpenseIdFromContext(request, context) {
  const params = await context?.params;
  const fromParams = params?.expenseId;
  if (fromParams) return String(fromParams);

  // Fallback for environments where params is unavailable.
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const expenseId = await resolveExpenseIdFromContext(request, context);
    const auth = await authorizeExpenseMutation(request, expenseId);
    if (auth.error) return auth.error;

    const { user, group, expense } = auth;

    const body = await request.json();
    const updates = {};
    const groupMemberIds = new Set((group.members || []).map((m) => String(m.userId)));

    if (body.description !== undefined) {
      const description = String(body.description || "").trim();
      if (!description) {
        return NextResponse.json(
          { error: "Description cannot be empty" },
          { status: 400 },
        );
      }
      updates.description = description;
    }

    if (body.category !== undefined) {
      const category = String(body.category || "other").trim().toLowerCase();
      if (!ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 },
        );
      }
      updates.category = category;
    }

    if (body.date !== undefined) {
      const parsed = new Date(body.date);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid date" },
          { status: 400 },
        );
      }
      updates.date = parsed;
    }

    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be greater than 0" },
          { status: 400 },
        );
      }
      updates.amount = amount;
    }

    if (body.paidBy !== undefined) {
      const paidById = String(body.paidBy);
      if (!groupMemberIds.has(paidById)) {
        return NextResponse.json(
          { error: "Paid by user must belong to this group" },
          { status: 400 },
        );
      }
      updates.paidBy = paidById;
    }

    if (body.splitBetween !== undefined) {
      if (!Array.isArray(body.splitBetween) || body.splitBetween.length === 0) {
        return NextResponse.json(
          { error: "Split between must include at least one member" },
          { status: 400 },
        );
      }

      const effectiveAmount = Number(
        updates.amount !== undefined ? updates.amount : expense.amount,
      );
      const uniqueSplitIds = new Set();
      const normalizedSplit = body.splitBetween.map((sb) => ({
        userId: String(sb.userId),
        amount: Number(sb.amount),
      }));

      for (const sb of normalizedSplit) {
        if (!groupMemberIds.has(sb.userId)) {
          return NextResponse.json(
            { error: "Split members must belong to this group" },
            { status: 400 },
          );
        }

        if (uniqueSplitIds.has(sb.userId)) {
          return NextResponse.json(
            { error: "Duplicate users found in split" },
            { status: 400 },
          );
        }
        uniqueSplitIds.add(sb.userId);

        if (!Number.isFinite(sb.amount) || sb.amount <= 0) {
          return NextResponse.json(
            { error: "Each split amount must be greater than 0" },
            { status: 400 },
          );
        }
      }

      const splitTotal = normalizedSplit.reduce((sum, sb) => sum + sb.amount, 0);
      if (Math.abs(splitTotal - effectiveAmount) > 0.01) {
        return NextResponse.json(
          { error: "Split total must match expense amount" },
          { status: 400 },
        );
      }

      updates.splitBetween = normalizedSplit.map((sb) => ({
        userId: sb.userId,
        amount: sb.amount,
        percentage: Number(((sb.amount / effectiveAmount) * 100).toFixed(2)),
        settled: false,
      }));

      updates.paidTo = normalizedSplit.map((sb) => sb.userId);
      updates.isSettled = false;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    const prevAmount = Number(expense.amount || 0);

    if (updates.amount !== undefined && updates.amount !== prevAmount) {
      if (updates.splitBetween === undefined) {
        expense.splitBetween = recalculateSplitAmounts(
          expense.splitBetween,
          updates.amount,
        );
      }

      const diff = Number((updates.amount - prevAmount).toFixed(2));
      group.totalExpenses = Number((Number(group.totalExpenses || 0) + diff).toFixed(2));
      if (group.totalExpenses < 0) group.totalExpenses = 0;
      await group.save();
    }

    Object.assign(expense, updates);
    await expense.save();

    await createActivity({
      groupId: group._id,
      userId: user._id,
      type: "expense_updated",
      message: `${user.fullName || user.username || "A member"} updated an expense`,
      metadata: {
        expenseId: expense._id,
        changes: Object.keys(updates),
      },
    });

    await expense.populate("paidBy", "fullName username email");
    await expense.populate("groupId", "name currency");

    return NextResponse.json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Expense update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();

    const expenseId = await resolveExpenseIdFromContext(request, context);
    const auth = await authorizeExpenseMutation(request, expenseId);
    if (auth.error) return auth.error;

    const { user, group, expense } = auth;

    const amount = Number(expense.amount || 0);
    await Expense.deleteOne({ _id: expense._id });

    group.totalExpenses = Number((Number(group.totalExpenses || 0) - amount).toFixed(2));
    if (group.totalExpenses < 0) group.totalExpenses = 0;
    await group.save();

    await createActivity({
      groupId: group._id,
      userId: user._id,
      type: "expense_deleted",
      message: `${user.fullName || user.username || "A member"} deleted an expense`,
      metadata: {
        expenseId,
        amount,
      },
    });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Expense delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}