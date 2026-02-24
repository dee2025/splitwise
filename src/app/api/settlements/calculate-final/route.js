// app/api/settlements/calculate-final/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Calculate final settlement for a trip AFTER completion
 * GET /api/settlements/calculate-final?groupId=xxx
 *
 * Returns: Total amount each person owes (not individual transactions)
 */
export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "groupId required" }, { status: 400 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get group & check membership
    const group = await Group.findById(groupId).populate("members.userId");
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.members.some(
      (m) => m.userId?._id?.toString() === user._id.toString(),
    );
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all expenses
    const expenses = await Expense.find({ groupId, isSettled: false })
      .populate("paidBy")
      .populate("splitBetween.userId");

    // Calculate net balances for EACH PERSON
    const userBalances = {};
    group.members.forEach((m) => {
      userBalances[m.userId._id.toString()] = {
        id: m.userId._id.toString(),
        name: m.userId.fullName,
        balance: 0,
      };
    });

    // Calculate balances from expenses
    expenses.forEach((exp) => {
      const payerId = exp.paidBy._id.toString();
      userBalances[payerId].balance += exp.amount;

      exp.splitBetween.forEach((split) => {
        const userId = split.userId._id.toString();
        userBalances[userId].balance -= split.amount;
      });
    });

    // Round balances
    Object.keys(userBalances).forEach((id) => {
      userBalances[id].balance =
        Math.round((userBalances[id].balance + Number.EPSILON) * 100) / 100;
    });

    // Get current user's balance
    const currentUserBalance = userBalances[user._id.toString()];

    return NextResponse.json({
      groupId,
      tripStatus: group.tripStatus,
      tripName: group.name,
      allBalances: Object.values(userBalances),
      currentUser: {
        id: user._id,
        name: user.fullName,
        totalBalance: currentUserBalance?.balance || 0,
        owesAmount:
          currentUserBalance?.balance > 0
            ? 0
            : Math.abs(currentUserBalance?.balance || 0),
        isOwedAmount:
          currentUserBalance?.balance > 0 ? currentUserBalance.balance : 0,
      },
    });
  } catch (error) {
    console.error("Settlement calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
