import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query = { "splitBetween.userId": user._id };

    if (groupId) {
      query.groupId = groupId;
    }

    const expenses = await Expense.find(query)
      .populate("paidBy", "fullName username email")
      .populate("groupId", "name currency")
      .populate("splitBetween.userId", "fullName username email")
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      description,
      amount,
      date,
      groupId,
      splitBetween,
      category,
      paidBy,
      paidTo,
    } = body;

    // Validation
    if (
      !description?.trim() ||
      !amount ||
      !groupId ||
      !splitBetween ||
      splitBetween.length === 0 ||
      !paidBy
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    const group = await Group.findOne({
      _id: groupId,
      "members.userId": user._id,
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found or access denied" },
        { status: 404 },
      );
    }

    const paidById = String(paidBy);

    // Validate paidBy user is in the group
    const paidByUser = group.members.find(
      (m) => String(m.userId) === paidById,
    );
    if (!paidByUser) {
      return NextResponse.json(
        { error: "Paid by user is not a member of the group" },
        { status: 400 },
      );
    }

    const groupMemberIds = new Set((group.members || []).map((m) => String(m.userId)));

    const normalizedSplit = splitBetween.map((sb) => ({
      userId: String(sb.userId),
      amount: Number(sb.amount),
      percentage: Number(sb.percentage || 0),
    }));

    const uniqueSplitIds = new Set();
    for (const sb of normalizedSplit) {
      if (!groupMemberIds.has(sb.userId)) {
        return NextResponse.json(
          { error: "Split members must belong to the selected group" },
          { status: 400 },
        );
      }
      if (!Number.isFinite(sb.amount) || sb.amount <= 0) {
        return NextResponse.json(
          { error: "Each split amount must be greater than 0" },
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
    }

    const splitTotal = normalizedSplit.reduce((sum, sb) => sum + sb.amount, 0);
    if (Math.abs(splitTotal - amountValue) > 0.01) {
      return NextResponse.json(
        { error: "Split total must match expense amount" },
        { status: 400 },
      );
    }

    const normalizedPaidTo = (paidTo && Array.isArray(paidTo) ? paidTo : normalizedSplit.map((sb) => sb.userId))
      .map((id) => String(id))
      .filter((id) => groupMemberIds.has(id));

    // Create expense
    const expense = await Expense.create({
      description: description.trim(),
      amount: amountValue,
      date: date ? new Date(date) : new Date(),
      groupId,
      paidBy: paidById,
      paidTo: normalizedPaidTo, // Store who the expense was split to
      splitBetween: normalizedSplit.map((sb) => ({
        userId: sb.userId,
        amount: sb.amount,
        percentage: sb.percentage,
        settled: false,
      })),
      category: category || "other",
      isSettled: false,
    });

    // Update group total
    group.totalExpenses = (group.totalExpenses || 0) + amountValue;
    await group.save();

    // Send notifications to involved users (except payer)
    const involvedUsers = normalizedSplit
      .filter((sb) => sb.userId !== paidById)
      .map((sb) => sb.userId);

    for (const userId of involvedUsers) {
      await Notification.create({
        userId,
        type: "expense_added",
        title: "New Expense Added",
        message: `${user.fullName} added expense "${description}" in ${group.name}`,
        data: {
          expenseId: expense._id,
          groupId: group._id,
          groupName: group.name,
          amount: amount,
          paidBy: user.fullName,
          type: "expense_added",
        },
        isRead: false,
      });
    }

    await expense.populate("paidBy", "fullName username email");
    await expense.populate("groupId", "name currency");

    return NextResponse.json(
      {
        message: "Expense added successfully",
        expense,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
