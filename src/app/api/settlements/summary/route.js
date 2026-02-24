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

    settlements.forEach((settlement) => {
      // Calculate amount owed/to receive
      if (settlement.fromUser._id.toString() === user._id.toString()) {
        summary.userOweAmount += settlement.amount;
      } else {
        summary.userGetAmount += settlement.amount;
      }

      // Group by status
      if (!summary.breakdown.byStatus[settlement.status]) {
        summary.breakdown.byStatus[settlement.status] = {
          count: 0,
          amount: 0,
          settlements: [],
        };
      }
      summary.breakdown.byStatus[settlement.status].count++;
      summary.breakdown.byStatus[settlement.status].amount += settlement.amount;
      summary.breakdown.byStatus[settlement.status].settlements.push(
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
      summary.breakdown.byMethod[settlement.method].amount += settlement.amount;

      // Categorize by status
      if (["pending", "confirmed"].includes(settlement.status)) {
        summary.pendingSettlements.push(settlement);
      } else if (settlement.status === "completed") {
        summary.completedSettlements.push(settlement);
      }
    });

    return NextResponse.json({
      summary,
      settlements,
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
