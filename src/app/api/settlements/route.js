// app/api/settlements/route.js
import { connectDB } from "@/lib/db";
import Settlement from "@/models/Settlement";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query = {
      $or: [
        { fromUser: user._id },
        { toUser: user._id }
      ]
    };

    if (groupId) {
      query.groupId = groupId;
    }

    const settlements = await Settlement.find(query)
      .populate('fromUser', 'fullName username email')
      .populate('toUser', 'fullName username email')
      .populate('groupId', 'name currency')
      .sort({ createdAt: -1 });

    return NextResponse.json({ settlements });
  } catch (error) {
    console.error("Settlements fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, toUserId, amount, expenseId, method, notes } = body;

    const decoded = await verifyToken(token);
    const fromUser = await User.findById(decoded.userId);
    const toUser = await User.findById(toUserId);
    const group = await Group.findById(groupId);

    if (!fromUser || !toUser || !group) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Create settlement
    const settlement = await Settlement.create({
      groupId,
      fromUser: fromUser._id,
      toUser: toUser._id,
      amount,
      expenseId,
      method: method || 'cash',
      notes,
      status: 'pending'
    });

    // Send notification to receiver
    await Notification.create({
      userId: toUser._id,
      type: 'settlement_request',
      title: 'Settlement Request',
      message: `${fromUser.fullName} has requested ₹${amount} settlement in ${group.name}`,
      data: {
        settlementId: settlement._id,
        groupId: group._id,
        groupName: group.name,
        amount: amount,
        fromUser: fromUser.fullName,
        type: 'settlement_request'
      },
      isRead: false
    });

    await settlement.populate('fromUser', 'fullName username email');
    await settlement.populate('toUser', 'fullName username email');
    await settlement.populate('groupId', 'name currency');

    return NextResponse.json({
      message: "Settlement request sent successfully",
      settlement
    }, { status: 201 });

  } catch (error) {
    console.error("Settlement creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settlementId, status } = body;

    if (!settlementId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    const settlement = await Settlement.findOne({
      _id: settlementId,
      toUser: user._id, // Only the receiver can update status
      status: 'pending'
    });

    if (!settlement) {
      return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
    }

    settlement.status = status;
    if (status === 'completed') {
      settlement.paidAt = new Date();
      
      // Mark expense as settled if it's linked to an expense
      if (settlement.expenseId) {
        await Expense.findOneAndUpdate(
          { 
            _id: settlement.expenseId,
            "splitBetween.userId": settlement.fromUser
          },
          { 
            $set: { 
              "splitBetween.$.settled": true,
              "splitBetween.$.settledAt": new Date()
            } 
          }
        );

        // Check if all splits are settled
        const expense = await Expense.findById(settlement.expenseId);
        const allSettled = expense.splitBetween.every(split => split.settled);
        if (allSettled) {
          expense.isSettled = true;
          expense.settledAt = new Date();
          await expense.save();
        }
      }

      // Send notification to sender
      await Notification.create({
        userId: settlement.fromUser,
        type: 'payment_received',
        title: 'Payment Received',
        message: `${user.fullName} has marked your ₹${settlement.amount} settlement as paid`,
        data: {
          settlementId: settlement._id,
          groupId: settlement.groupId,
          amount: settlement.amount,
          toUser: user.fullName,
          type: 'payment_received'
        },
        isRead: false
      });
    }

    await settlement.save();
    await settlement.populate('fromUser', 'fullName username email');
    await settlement.populate('toUser', 'fullName username email');
    await settlement.populate('groupId', 'name currency');

    return NextResponse.json({
      message: `Settlement ${status} successfully`,
      settlement
    });

  } catch (error) {
    console.error("Settlement update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}