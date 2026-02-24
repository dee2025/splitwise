import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { groupId } = await params;
    const body = await request.json();
    const { members } = body;

    // Find group and verify user is admin
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isAdmin = group.members.some(
      (m) =>
        m.userId.toString() === currentUser._id.toString() &&
        m.role === "admin",
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can add members" },
        { status: 403 },
      );
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "At least one member is required" },
        { status: 400 },
      );
    }

    // Add members to group
    const newMembers = members.map((member) => ({
      userId: member.userId,
      name: member.name,
      email: member.email,
      contact: member.contact,
      type: member.type,
      role: "member",
      joinedAt: new Date(),
    }));

    // Filter out existing members
    const existingMemberIds = new Set(
      group.members.map((m) => m.userId?.toString()),
    );
    const membersToAdd = newMembers.filter(
      (m) => !existingMemberIds.has(m.userId?.toString()),
    );

    if (membersToAdd.length === 0) {
      return NextResponse.json(
        { error: "All selected members are already in the group" },
        { status: 400 },
      );
    }

    // Update group
    group.members.push(...membersToAdd);
    await group.save();

    // Send notifications to new members
    for (const member of membersToAdd) {
      if (member.type === "registered" && member.userId) {
        await Notification.create({
          userId: member.userId,
          type: "group_invitation",
          title: "Added to Group",
          message: `You've been added to "${group.name}" by ${currentUser.fullName}`,
          data: {
            groupId: group._id,
            groupName: group.name,
            invitedBy: currentUser.fullName,
            type: "group_invitation",
          },
          isRead: false,
        });
      }
    }

    const populatedGroup = await Group.findById(groupId)
      .populate("createdBy", "fullName username email")
      .populate("members.userId", "fullName username email contact");

    return NextResponse.json(
      {
        message: `Added ${membersToAdd.length} member(s)`,
        group: populatedGroup,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Add members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
