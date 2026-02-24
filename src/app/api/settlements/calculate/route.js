// app/api/settlements/calculate/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Calculate optimal settlement plan for a group
 * Uses greedy algorithm to minimize number of transactions
 * GET /api/settlements/calculate?groupId=xxx
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

    // Verify user is member of group
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

    // Calculate balances
    const balances = {};
    group.members.forEach((m) => {
      balances[m.userId._id.toString()] = 0;
    });

    expenses.forEach((exp) => {
      const payerId = exp.paidBy._id.toString();
      balances[payerId] = (balances[payerId] || 0) + exp.amount;

      exp.splitBetween.forEach((split) => {
        const userId = split.userId._id.toString();
        balances[userId] = (balances[userId] || 0) - split.amount;
      });
    });

    // Get existing pending settlements
    const existingSettlements = await Settlement.find({
      groupId,
      status: { $in: ["pending", "confirmed"] },
    });

    // Apply existing pending settlements to balances
    existingSettlements.forEach((s) => {
      const fromId = s.fromUser.toString();
      const toId = s.toUser.toString();
      balances[fromId] = (balances[fromId] || 0) - s.amount;
      balances[toId] = (balances[toId] || 0) + s.amount;
    });

    // Split into creditors and debtors
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([id, amt]) => {
      const rounded = Math.round((amt + Number.EPSILON) * 100) / 100;
      if (rounded > 0.01) {
        creditors.push({ id, amount: rounded });
      } else if (rounded < -0.01) {
        debtors.push({ id, amount: -rounded });
      }
    });

    // Greedy algorithm to match debtors and creditors
    const settlements = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      const settle = Math.min(d.amount, c.amount);

      settlements.push({
        from: d.id,
        to: c.id,
        amount: Math.round(settle * 100) / 100,
        optimized: true,
      });

      d.amount -= settle;
      c.amount -= settle;

      if (d.amount <= 0.01) i++;
      if (c.amount <= 0.01) j++;
    }

    // Get member details for settlement display
    const memberMap = {};
    group.members.forEach((m) => {
      memberMap[m.userId._id.toString()] = m.userId;
    });

    const settlementsWithDetails = settlements.map((s) => ({
      ...s,
      fromUser: memberMap[s.from],
      toUser: memberMap[s.to],
    }));

    return NextResponse.json({
      groupId,
      balances,
      settlements: settlementsWithDetails,
      summary: {
        totalSettlements: settlements.length,
        totalAmount: settlements.reduce((sum, s) => sum + s.amount, 0),
        creditorsCount: creditors.length,
        debtorsCount: debtors.length,
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
