import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

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
      .populate('paidBy', 'fullName username email')
      .populate('groupId', 'name currency')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { description, amount, date, groupId, splitBetween, category } = body;

    // Validation
    if (!description?.trim() || !amount || !groupId || !splitBetween || splitBetween.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    const group = await Group.findOne({
      _id: groupId,
      "members.userId": user._id
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found or access denied" }, { status: 404 });
    }

    // Create expense
    const expense = await Expense.create({
      description: description.trim(),
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      groupId,
      paidBy: user._id,
      splitBetween: splitBetween.map(sb => ({
        userId: sb.userId,
        amount: sb.amount,
        percentage: sb.percentage,
        settled: false
      })),
      category: category || 'other',
      isSettled: false
    });

    // Update group total
    group.totalExpenses = (group.totalExpenses || 0) + parseFloat(amount);
    await group.save();

    // Send notifications to involved users (except payer)
    const involvedUsers = splitBetween
      .filter(sb => sb.userId.toString() !== user._id.toString())
      .map(sb => sb.userId);

    for (const userId of involvedUsers) {
      await Notification.create({
        userId,
        type: 'expense_added',
        title: 'New Expense Added',
        message: `${user.fullName} added expense "${description}" in ${group.name}`,
        data: {
          expenseId: expense._id,
          groupId: group._id,
          groupName: group.name,
          amount: amount,
          paidBy: user.fullName,
          type: 'expense_added'
        },
        isRead: false
      });
    }

    await expense.populate('paidBy', 'fullName username email');
    await expense.populate('groupId', 'name currency');

    return NextResponse.json({
      message: "Expense added successfully",
      expense
    }, { status: 201 });

  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}