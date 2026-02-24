// app/api/settlements/summary/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Settlement from "@/models/Settlement";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Get settlement summary for a user in a group
 * GET /api/settlements/summary?groupId=xxx
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

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    let query = {
      $or: [{ fromUser: user._id }, { toUser: user._id }],
    };

    if (groupId) {
      query.groupId = groupId;
    }

    const settlements = await Settlement.find(query)
      .populate("fromUser", "fullName username email avatar")
      .populate("toUser", "fullName username email avatar")
      .populate("groupId", "name currency")
      .sort({ createdAt: -1 });

    const normalizedSettlements = settlements.map((settlement) => {
      const normalized = settlement.toObject();
      normalized.amount = Number(
        normalized.amount ?? normalized.totalAmount ?? 0,
      );
      normalized.status =
        normalized.status === "paid" ? "completed" : normalized.status;
      return normalized;
    });

    // Calculate summary statistics
    const summary = {
      totalSettlements: settlements.length,
      userOweAmount: 0,
      userGetAmount: 0,
      pendingSettlements: [],
      completedSettlements: [],
      breakdown: {
        byStatus: {},
        byMethod: {},
        byGroup: {},
      },
    };

    normalizedSettlements.forEach((settlement) => {
      const settlementAmount = Number(
        settlement.amount ?? settlement.totalAmount ?? 0,
      );
      const normalizedStatus =
        settlement.status === "paid" ? "completed" : settlement.status;

      // Calculate amount owed/to receive
      if (settlement.fromUser._id.toString() === user._id.toString()) {
        summary.userOweAmount += settlementAmount;
      } else {
        summary.userGetAmount += settlementAmount;
      }

      // Group by status
      if (!summary.breakdown.byStatus[normalizedStatus]) {
        summary.breakdown.byStatus[normalizedStatus] = {
          count: 0,
          amount: 0,
          settlements: [],
        };
      }
      summary.breakdown.byStatus[normalizedStatus].count++;
      summary.breakdown.byStatus[normalizedStatus].amount += settlementAmount;
      summary.breakdown.byStatus[normalizedStatus].settlements.push(
        settlement,
      );

      // Group by method
      if (!summary.breakdown.byMethod[settlement.method]) {
        summary.breakdown.byMethod[settlement.method] = {
          count: 0,
          amount: 0,
        };
      }
      summary.breakdown.byMethod[settlement.method].count++;
      summary.breakdown.byMethod[settlement.method].amount += settlementAmount;

      // Categorize by status
      if (["pending", "confirmed"].includes(normalizedStatus)) {
        summary.pendingSettlements.push(settlement);
      } else if (normalizedStatus === "completed") {
        summary.completedSettlements.push(settlement);
      }
    });

    return NextResponse.json({
      summary,
      settlements: normalizedSettlements,
      user: {
        id: user._id,
        name: user.fullName,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Settlement summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
