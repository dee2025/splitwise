import { verifyRequestToken } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Group from "@/models/Group";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const decoded = auth.decoded;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Valid groupId is required" }, { status: 400 });
    }

    const group = await Group.findOne({
      _id: groupId,
      "members.userId": decoded.userId,
      isActive: { $ne: false },
    }).select("_id");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const activity = await Activity.find({ groupId })
      .populate("userId", "fullName username")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ activity }, { status: 200 });
  } catch (error) {
    console.error("ACTIVITY_FETCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
