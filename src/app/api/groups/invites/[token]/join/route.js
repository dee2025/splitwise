import { verifyRequestToken } from "@/lib/apiAuth";
import { createActivity } from "@/lib/createActivity";
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

export async function POST(request, { params }) {
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
    });

    if (!group) {
      return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 });
    }

    if (isMember(group, user._id)) {
      return NextResponse.json({
        message: "You are already a member of this group",
        alreadyMember: true,
        groupId: group._id.toString(),
      });
    }

    const member = {
      userId: user._id,
      name: user.fullName,
      email: user.email,
      contact: user.contact,
      type: "registered",
      role: "member",
      joinedAt: new Date(),
    };

    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: group._id,
        isActive: true,
        inviteToken,
        inviteEnabled: true,
        "members.userId": { $ne: user._id },
      },
      { $push: { members: member } },
      { new: true },
    );

    if (!updatedGroup) {
      return NextResponse.json({
        message: "You are already a member of this group",
        alreadyMember: true,
        groupId: group._id.toString(),
      });
    }

    await createActivity({
      groupId: updatedGroup._id,
      userId: user._id,
      type: "member_added",
      message: `${user.fullName || user.email} joined the group using an invite link`,
      metadata: {
        memberId: user._id,
        source: "invite_link",
      },
    });

    return NextResponse.json({
      message: `Joined ${updatedGroup.name}`,
      alreadyMember: false,
      groupId: updatedGroup._id.toString(),
    });
  } catch (error) {
    console.error("Group invite join error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
