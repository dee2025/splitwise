// app/api/groups/[groupId]/balances/route.js
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
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
    
    console.log("🔍 Balances API Debug:");
    console.log("  - Request URL:", request.url);
    console.log("  - Path segments:", pathSegments);
    console.log("  - Extracted groupId:", groupId);

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

    console.log("  - Found expenses:", expenses.length);

    // Calculate balances
    const balances = {};
    const memberBalances = [];

    // Initialize balances for all members
    group.members.forEach(member => {
      if (member.userId && member.userId._id) {
        balances[member.userId._id.toString()] = 0;
      }
    });

    // Calculate net balances
    expenses.forEach(expense => {
      if (expense.paidBy && expense.paidBy._id) {
        // Add amount to payer (they paid, so they are owed money)
        const payerId = expense.paidBy._id.toString();
        balances[payerId] = (balances[payerId] || 0) + expense.amount;

        // Subtract amounts from people who owe
        expense.splitBetween.forEach(split => {
          if (split.userId && split.userId._id) {
            const splitUserId = split.userId._id.toString();
            balances[splitUserId] = (balances[splitUserId] || 0) - split.amount;
          }
        });
      }
    });

    // Format balances for response
    group.members.forEach(member => {
      if (member.userId && member.userId._id) {
        const memberId = member.userId._id.toString();
        const balance = balances[memberId] || 0;
        memberBalances.push({
          userId: member.userId._id,
          userName: member.userId.fullName,
          userEmail: member.userId.email,
          balance: parseFloat(balance.toFixed(2)),
          owes: balance < 0 ? Math.abs(balance) : 0,
          owed: balance > 0 ? balance : 0,
          isCurrentUser: memberId === user._id.toString()
        });
      }
    });

    console.log("  - Calculated balances:", memberBalances);

    // Calculate who owes whom (simplified debt calculation)
    const debts = [];
    const positiveBalances = memberBalances.filter(m => m.balance > 0.01);
    const negativeBalances = memberBalances.filter(m => m.balance < -0.01);

    positiveBalances.forEach(creditor => {
      negativeBalances.forEach(debtor => {
        if (creditor.balance > 0.01 && debtor.balance < -0.01) {
          const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
          if (amount > 0.01) {
            debts.push({
              fromUser: debtor.userName,
              fromUserId: debtor.userId,
              toUser: creditor.userName,
              toUserId: creditor.userId,
              amount: parseFloat(amount.toFixed(2))
            });
            
            // Update balances for this pairing
            creditor.balance -= amount;
            debtor.balance += amount;
          }
        }
      });
    });

    console.log("  - Calculated debts:", debts);

    return NextResponse.json({
      balances: memberBalances,
      debts,
      totalExpenses: group.totalExpenses || 0,
      currency: group.currency,
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