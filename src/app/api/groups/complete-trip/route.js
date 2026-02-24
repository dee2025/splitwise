// app/api/groups/complete-trip/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Complete a trip and freeze new expenses
 * PUT /api/groups/complete-trip
 *
 * Body: {
 *   groupId: string
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
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: "groupId required" }, { status: 400 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    const group = await Group.findById(groupId)
      .populate("createdBy")
      .populate("members.userId");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Only group creator/admin can complete trip
    if (group.createdBy._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Only group creator can end trip" },
        { status: 403 },
      );
    }

    // Update group status
    group.tripStatus = "completed";
    group.tripEndDate = new Date();
    await group.save();

    // Mark all expenses as settled (final)
    await Expense.updateMany(
      { groupId: group._id, isSettled: false },
      { $set: { isSettled: true } },
    );

    // Notify all members that trip is completed
    for (const member of group.members) {
      if (member.userId._id.toString() !== user._id.toString()) {
        await Notification.create({
          userId: member.userId._id,
          type: "trip_completed",
          title: `${group.name} trip ended`,
          message: "Trip completed. Time to settle outstanding payments!",
          data: {
            groupId: group._id,
            groupName: group.name,
            tripEndDate: group.tripEndDate,
          },
          isRead: false,
        });
      }
    }

    return NextResponse.json({
      message: "Trip completed successfully",
      group,
    });
  } catch (error) {
    console.error("Trip completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
