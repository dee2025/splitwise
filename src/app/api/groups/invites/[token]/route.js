import { verifyRequestToken } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import { NextResponse } from "next/server";

function isMember(group, userId) {
  const userIdString = userId?.toString();
  return (group.members || []).some((member) => {
    const memberUserId = member.userId?._id || member.userId;
    return memberUserId?.toString() === userIdString;
  });
}

function safeInvitePayload(group, user) {
  return {
    groupId: group._id.toString(),
    name: group.name,
    description: group.description || "",
    type: group.type || "other",
    memberCount: group.members?.length || 0,
    alreadyMember: isMember(group, user._id),
  };
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const decoded = auth.decoded;
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const { token: inviteToken } = await params;
    const group = await Group.findOne({
      inviteToken,
      inviteEnabled: true,
      isActive: true,
    }).select("name description type members isActive inviteEnabled");

    if (!group) {
      return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 });
    }

    return NextResponse.json({ invite: safeInvitePayload(group, user) });
  } catch (error) {
    console.error("Group invite fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
