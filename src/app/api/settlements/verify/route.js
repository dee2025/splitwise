// app/api/settlements/verify/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Verify and confirm settlement payment
 * PUT /api/settlements/verify
 * Body: {
 *   settlementId: string,
 *   action: "confirm" | "complete" | "cancel" | "dispute",
 *   paymentDetails?: { reference, accountNumber, ... },
 *   proof?: string (image URL),
 *   reason?: string (for cancellation/dispute)
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
    const { settlementId, action, paymentDetails, proof, reason } = body;

    if (!settlementId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    const settlement = await Settlement.findById(settlementId)
      .populate("fromUser", "fullName username email")
      .populate("toUser", "fullName username email")
      .populate("groupId", "name currency");

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 },
      );
    }

    // Authorization checks based on action
    if (action === "confirm") {
      // Payer confirms they sent the payment
      if (settlement.fromUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: "Only payer can confirm" },
          { status: 403 },
        );
      }
    } else if (action === "complete") {
      // Receiver confirms they received the payment
      if (settlement.toUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: "Only receiver can complete" },
          { status: 403 },
        );
      }
    } else if (action === "cancel" || action === "dispute") {
      // Either party can cancel or dispute
      if (
        ![
          settlement.fromUser._id.toString(),
          settlement.toUser._id.toString(),
        ].includes(user._id.toString())
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Process action
    switch (action) {
      case "confirm":
        settlement.status = "confirmed";
        settlement.confirmedAt = new Date();
        settlement.confirmedBy = user._id;
        if (paymentDetails) {
          settlement.paymentDetails = paymentDetails;
        }
        break;

      case "complete":
        settlement.status = "completed";
        settlement.completedAt = new Date();
        settlement.paidAt = new Date();
        if (proof) {
          settlement.proof = proof;
          settlement.proofUploadedAt = new Date();
          settlement.proofUploadedBy = user._id;
        }

        // Send notification to payer
        await Notification.create({
          userId: settlement.fromUser._id,
          type: "settlement_completed",
          title: "Payment Received",
          message: `${settlement.toUser.fullName} has confirmed receiving ₹${settlement.amount} payment in ${settlement.groupId.name}`,
          data: {
            settlementId: settlement._id,
            groupId: settlement.groupId._id,
            amount: settlement.amount,
            toUser: settlement.toUser.fullName,
            type: "settlement_completed",
          },
          isRead: false,
        });
        break;

      case "cancel":
        settlement.status = "cancelled";
        settlement.notes = reason || settlement.notes;

        // Notify both parties
        const cancelledToNotify =
          settlement.fromUser._id.toString() === user._id.toString()
            ? settlement.toUser._id
            : settlement.fromUser._id;

        await Notification.create({
          userId: cancelledToNotify,
          type: "settlement_cancelled",
          title: "Settlement Cancelled",
          message: `${user.fullName} has cancelled the settlement of ₹${settlement.amount}`,
          data: {
            settlementId: settlement._id,
            groupId: settlement.groupId._id,
            amount: settlement.amount,
            reason: reason,
          },
          isRead: false,
        });
        break;

      case "dispute":
        settlement.status = "disputed";
        settlement.isDisputed = true;
        settlement.disputeReason = reason;
        settlement.disputedAt = new Date();
        settlement.disputedBy = user._id;

        // Notify both parties and group admins
        const otherUser =
          settlement.fromUser._id.toString() === user._id.toString()
            ? settlement.toUser._id
            : settlement.fromUser._id;

        await Notification.create({
          userId: otherUser,
          type: "settlement_disputed",
          title: "Settlement Dispute",
          message: `${user.fullName} has disputed the settlement of ₹${settlement.amount}`,
          data: {
            settlementId: settlement._id,
            groupId: settlement.groupId._id,
            disputeReason: reason,
          },
          isRead: false,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await settlement.save();
    await settlement.populate("fromUser", "fullName username email avatar");
    await settlement.populate("toUser", "fullName username email avatar");

    return NextResponse.json({
      message: `Settlement ${action}ed successfully`,
      settlement,
    });
  } catch (error) {
    console.error("Settlement verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
