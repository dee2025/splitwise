import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGroupInviteToken } from "@/lib/groupInvites";
import { getRequestToken } from "@/lib/requestAuth";
import Group from "@/models/Group";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function isAdmin(group, userId) {
  const userIdString = userId?.toString();
  return (group.members || []).some((member) => {
    const memberUserId = member.userId?._id || member.userId;
    return memberUserId?.toString() === userIdString && member.role === "admin";
  });
}

export async function POST(request, { params }) {
  try {
    await connectDB();

    const token = getRequestToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const { groupId } = await params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid group ID format" }, { status: 400 });
    }

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (!isAdmin(group, user._id)) {
      return NextResponse.json({ error: "Only group admins can regenerate invite links" }, { status: 403 });
    }

    group.inviteToken = generateGroupInviteToken();
    group.inviteEnabled = true;
    group.inviteUpdatedAt = new Date();
    await group.save();

    return NextResponse.json({
      message: "Invite link regenerated",
      inviteToken: group.inviteToken,
      inviteUpdatedAt: group.inviteUpdatedAt,
    });
  } catch (error) {
    console.error("Group invite regenerate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
