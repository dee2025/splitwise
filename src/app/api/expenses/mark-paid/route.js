import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";

export async function POST(request) {
  try {
    await connectDB();

    const { expenseId, userId, method = "cash", notes = "" } = await request.json();

    if (!expenseId || !userId) {
      return NextResponse.json(
        { error: "expenseId and userId are required" },
        { status: 400 }
      );
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Find user's split entry
    const splitEntry = expense.splitBetween.find(
      (item) => String(item.userId) === String(userId)
    );

    if (!splitEntry) {
      return NextResponse.json(
        { error: "User is not part of this expense split" },
        { status: 400 }
      );
    }

    if (splitEntry.settled) {
      return NextResponse.json(
        { error: "This share is already settled" },
        { status: 400 }
      );
    }

    // Mark this user's portion as paid
    splitEntry.settled = true;
    splitEntry.settledAt = new Date();

    // Check if all participants have settled
    const allSettled = expense.splitBetween.every((p) => p.settled);

    if (allSettled) {
      expense.isSettled = true;
      expense.settledAt = new Date();
    }

    await expense.save();

    // Create a record in Settlement collection
    const settlement = await Settlement.create({
      groupId: expense.groupId,
      fromUser: userId,
      toUser: expense.paidBy,
      amount: splitEntry.amount,
      expenseId: expense._id,
      paidAt: new Date(),
      method,
      notes,
      status: "completed",
    });

    return NextResponse.json(
      {
        message: "Payment marked as settled",
        expense,
        settlement,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MARK_PAID_ERROR", error);
    return NextResponse.json(
      { error: "Server error while marking paid" },
      { status: 500 }
    );
  }
}
