import { verifyRequestToken } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

function normalizeGroup(groupDoc, options = {}) {
  const group = groupDoc?.toObject ? groupDoc.toObject() : groupDoc;

  const normalized = {
    ...group,
    members: (group.members || []).map((m) => ({
      _id: m._id,
      userId: m.userId?._id || m.userId || null,
      name: m.userId?.fullName || m.name || "Unknown",
      fullName: m.userId?.fullName || m.name || "Unknown",
      username: m.userId?.username || null,
      email: m.userId?.email || m.email || null,
      contact: m.userId?.contact || m.contact || null,
      role: m.role,
      type: m.type,
      joinedAt: m.joinedAt,
    })),
  };

  if (!options.includeInviteToken) {
    delete normalized.inviteToken;
    delete normalized.inviteEnabled;
    delete normalized.inviteUpdatedAt;
  }

  return normalized;
}

export async function POST(request, { params }) {
  try {
    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const decoded = auth.decoded;
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
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
        m.userId?.toString() === currentUser._id.toString() &&
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

    const newMembers = members
      .map((member) => {
        const type = member.type === "custom" ? "custom" : "registered";
        const name = String(member.name || "").trim();
        const email = String(member.email || "").trim().toLowerCase();
        const contact = String(member.contact || "").trim();

        if (type === "registered" && !member.userId) return null;
        if (type === "custom" && !name) return null;

        return {
          userId: type === "registered" ? member.userId : null,
          name,
          email: email || null,
          contact: contact || null,
          type,
          role: "member",
          joinedAt: new Date(),
        };
      })
      .filter(Boolean);

    if (newMembers.length === 0) {
      return NextResponse.json(
        { error: "Enter a valid member" },
        { status: 400 },
      );
    }

    const existingMemberIds = new Set(
      group.members
        .map((m) => m.userId?.toString())
        .filter(Boolean),
    );
    const existingCustomKeys = new Set(
      group.members
        .filter((m) => m.type === "custom")
        .map((m) =>
          [
            String(m.name || "").trim().toLowerCase(),
            String(m.email || "").trim().toLowerCase(),
            String(m.contact || "").trim().toLowerCase(),
          ].join("|"),
        ),
    );
    const membersToAdd = newMembers.filter(
      (m) => {
        if (m.type === "registered") {
          return !existingMemberIds.has(m.userId?.toString());
        }

        const customKey = [
          String(m.name || "").trim().toLowerCase(),
          String(m.email || "").trim().toLowerCase(),
          String(m.contact || "").trim().toLowerCase(),
        ].join("|");
        return !existingCustomKeys.has(customKey);
      },
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
        group: normalizeGroup(populatedGroup, { includeInviteToken: true }),
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
