// app/api/groups/[groupId]/balances/route.js
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import Settlement from "@/models/Settlement";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract groupId from URL using split method
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const groupId = pathSegments[pathSegments.length - 2]; // Get groupId from /api/groups/[groupId]/balances
    
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const group = await Group.findById(groupId).populate('members.userId', 'fullName username email');
    
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is member of group
    const isMember = group.members.some(member => 
      member.userId && member.userId._id.toString() === user._id.toString()
    );
    
    if (!isMember) {
      return NextResponse.json({ 
        error: "Access denied - You are not a member of this group",
        debug: {
          yourUserId: user._id.toString(),
          groupMembers: group.members.map(m => ({
            userId: m.userId?._id?.toString(),
            name: m.userId?.fullName
          }))
        }
      }, { status: 403 });
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'fullName username email')
      .populate('splitBetween.userId', 'fullName username email');

    // Calculate net balances from expenses
    const balances = {};
    group.members.forEach(member => {
      if (member.userId && member.userId._id) {
        balances[member.userId._id.toString()] = 0;
      }
    });

    expenses.forEach(expense => {
      if (expense.paidBy && expense.paidBy._id) {
        const payerId = expense.paidBy._id.toString();
        balances[payerId] = (balances[payerId] || 0) + expense.amount;
        expense.splitBetween.forEach(split => {
          if (split.userId && split.userId._id) {
            const splitUserId = split.userId._id.toString();
            balances[splitUserId] = (balances[splitUserId] || 0) - split.amount;
          }
        });
      }
    });

    // Adjust balances for completed settlements
    const completedSettlements = await Settlement.find({ groupId, status: 'completed' });
    completedSettlements.forEach(s => {
      const fromId = s.fromUser.toString();
      const toId = s.toUser.toString();
      if (balances[fromId] !== undefined) balances[fromId] += s.amount;
      if (balances[toId] !== undefined) balances[toId] -= s.amount;
    });

    // Recompute memberBalances after settlement adjustment
    const finalMemberBalances = [];
    group.members.forEach(member => {
      if (member.userId && member.userId._id) {
        const memberId = member.userId._id.toString();
        const balance = parseFloat((balances[memberId] || 0).toFixed(2));
        finalMemberBalances.push({
          userId: member.userId._id,
          userName: member.userId.fullName,
          userEmail: member.userId.email,
          balance,
          owes: balance < 0 ? parseFloat(Math.abs(balance).toFixed(2)) : 0,
          owed: balance > 0 ? parseFloat(balance.toFixed(2)) : 0,
          isCurrentUser: memberId === user._id.toString()
        });
      }
    });

    // Greedy algorithm to minimize settlement transactions
    const debtors = finalMemberBalances
      .filter(m => m.balance < -0.01)
      .map(m => ({ ...m, remaining: Math.abs(m.balance) }))
      .sort((a, b) => b.remaining - a.remaining);

    const creditors = finalMemberBalances
      .filter(m => m.balance > 0.01)
      .map(m => ({ ...m, remaining: m.balance }))
      .sort((a, b) => b.remaining - a.remaining);

    const debts = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const settle = Math.min(debtor.remaining, creditor.remaining);
      if (settle > 0.01) {
        debts.push({
          fromUser: debtor.userName,
          fromUserId: debtor.userId,
          toUser: creditor.userName,
          toUserId: creditor.userId,
          amount: parseFloat(settle.toFixed(2))
        });
      }
      debtor.remaining -= settle;
      creditor.remaining -= settle;
      if (debtor.remaining <= 0.01) i++;
      if (creditor.remaining <= 0.01) j++;
    }

    return NextResponse.json({
      balances: finalMemberBalances,
      debts,
      totalExpenses: group.totalExpenses || 0,
      currency: "INR",
      groupName: group.name
    });

  } catch (error) {
    console.error("Balances fetch error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}