// app/api/settlements/mark-paid/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Mark settlement as paid
 * PUT /api/settlements/mark-paid
 *
 * Body: {
 *   settlementId: string,
 *   proof?: string (optional - image URL),
 *   notes?: string
 * }
 */
export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settlementId, proof, notes } = body;

    if (!settlementId) {
      return NextResponse.json(
        { error: "settlementId required" },
        { status: 400 },
      );
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    const settlement = await Settlement.findById(settlementId)
      .populate("fromUser", "fullName username email")
      .populate("toUser", "fullName username email")
      .populate("groupId", "name");

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 },
      );
    }

    // Only receiver (toUser) can mark as paid
    if (settlement.toUser._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Only receiver can mark as paid" },
        { status: 403 },
      );
    }

    if (settlement.status !== "pending") {
      return NextResponse.json(
        { error: "Settlement already " + settlement.status },
        { status: 400 },
      );
    }

    // Update settlement
    settlement.status = "paid";
    settlement.paidAt = new Date();

    if (proof) {
      settlement.proof = proof;
      settlement.uploadedAt = new Date();
    }

    if (notes) {
      settlement.notes = notes;
    }

    await settlement.save();

    // Notify payer that payment was received
    await Notification.create({
      userId: settlement.fromUser._id,
      type: "settlement_completed",
      title: "Payment Received",
      message: `${settlement.toUser.fullName} confirmed receiving ₹${settlement.totalAmount} from ${settlement.groupId.name}`,
      data: {
        settlementId: settlement._id,
        groupId: settlement.groupId._id,
        amount: settlement.totalAmount,
        toUser: settlement.toUser.fullName,
      },
      isRead: false,
    });

    return NextResponse.json({
      message: "Settlement marked as paid",
      settlement,
    });
  } catch (error) {
    console.error("Settlement mark paid error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
