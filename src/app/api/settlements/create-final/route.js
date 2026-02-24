// app/api/settlements/create-final/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Create final settlement for a trip completion
 * POST /api/settlements/create-final
 *
 * Body: {
 *   groupId: string,
 *   toUserId: string,
 *   totalAmount: number,
 *   method?: "cash" | "upi" | "bank_transfer" | "wallet",
 *   paymentDetails?: { upiId, accountNumber, etc },
 *   proof?: string (optional - image URL),
 *   notes?: string
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
    const {
      groupId,
      toUserId,
      totalAmount,
      method,
      paymentDetails,
      proof,
      notes,
    } = body;

    if (!groupId || !toUserId || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

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
      totalAmount,
      tripStatus: group.tripStatus,
      tripEndDate: group.tripEndDate,
      method: method || "cash",
      paymentDetails: paymentDetails || undefined,
      proof: proof || undefined,
      notes,
      status: "pending",
    });

    // Send notification to receiver
    await Notification.create({
      userId: toUser._id,
      type: "settlement_request",
      title: "Trip Settlement Request",
      message: `${fromUser.fullName} sent you a settlement of ₹${totalAmount} from ${group.name}`,
      data: {
        settlementId: settlement._id,
        groupId: group._id,
        groupName: group.name,
        amount: totalAmount,
        fromUser: fromUser.fullName,
      },
      isRead: false,
    });

    await settlement.populate("fromUser", "fullName username email");
    await settlement.populate("toUser", "fullName username email");

    return NextResponse.json(
      {
        message: "Settlement created successfully",
        settlement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Settlement creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
