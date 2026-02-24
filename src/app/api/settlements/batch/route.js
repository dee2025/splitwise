// app/api/settlements/batch/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import Settlement from "@/models/Settlement";
import SettlementBatch from "@/models/SettlementBatch";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Create multiple settlements at once (batch operation)
 * POST /api/settlements/batch
 * Body: {
 *   groupId: string,
 *   settlements: [{ toUserId, amount, method?, notes? }, ...]
 * }
 */
export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, settlements: settlementsList } = body;

    if (!groupId || !settlementsList?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const decoded = await verifyToken(token);
    const fromUser = await User.findById(decoded.userId);
    const group = await Group.findById(groupId);

    if (!fromUser || !group) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Create batch
    const batch = await SettlementBatch.create({
      groupId,
      createdBy: fromUser._id,
      settlementCount: settlementsList.length,
      totalAmount: settlementsList.reduce((sum, s) => sum + s.amount, 0),
      status: "ready",
    });

    const createdSettlements = [];

    // Create individual settlements
    for (const item of settlementsList) {
      const { toUserId, amount, method, notes } = item;

      const toUser = await User.findById(toUserId);
      if (!toUser) continue;

      const settlement = await Settlement.create({
        groupId,
        fromUser: fromUser._id,
        toUser: toUser._id,
        amount,
        totalAmount: amount,
        method: method || "cash",
        notes,
        status: "pending",
        batchId: batch._id,
        requestedAt: new Date(),
      });

      createdSettlements.push(settlement);

      // Send notification
      await Notification.create({
        userId: toUser._id,
        type: "settlement_request",
        title: "Settlement Request",
        message: `${fromUser.fullName} has requested ₹${amount} settlement in ${group.name}`,
        data: {
          settlementId: settlement._id,
          groupId: group._id,
          batchId: batch._id,
          amount,
          fromUser: fromUser.fullName,
        },
        isRead: false,
      });
    }

    // Update batch with settlement IDs
    batch.settlementIds = createdSettlements.map((s) => s._id);
    batch.stats.totalPending = createdSettlements.length;
    await batch.save();

    await batch.populate("settlementIds");

    return NextResponse.json(
      {
        message: "Batch settlements created successfully",
        batch,
        settlements: createdSettlements,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Batch settlement creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Get batch settlements
 * GET /api/settlements/batch?groupId=xxx
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

    const batches = await SettlementBatch.find({ groupId })
      .populate("createdBy", "fullName username email")
      .populate("settlementIds")
      .sort({ createdAt: -1 });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("Batch fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
