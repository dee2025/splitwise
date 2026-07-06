import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getRequestToken } from "@/lib/requestAuth";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { NextResponse } from "next/server";

function isGroupAdmin(group, userId) {
  const userIdString = userId?.toString();
  return (group.members || []).some((member) => {
    const memberUserId = member.userId?._id || member.userId;
    return memberUserId?.toString() === userIdString && member.role === "admin";
  });
}

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

export async function GET(request) {
  try {
    await connectDB();

    const token = getRequestToken(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.isBlocked)
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });

    let groups = await Group.find({
      "members.userId": user._id,
      isActive: true,
    })
      .populate("createdBy", "fullName username email")
      .populate("members.userId", "fullName username email contact")
      .sort({ createdAt: -1 });

    // 🔥 FIX: clean member structure
    groups = groups.map((group) =>
      normalizeGroup(group, { includeInviteToken: isGroupAdmin(group, user._id) }),
    );

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Groups fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Get token from cookies
    const token = getRequestToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, privacy, members, type } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 },
      );
    }

    // Create group with creator as admin (members optional)
    const allMembers = [
      {
        userId: currentUser._id,
        name: currentUser.fullName,
        email: currentUser.email,
        contact: currentUser.contact,
        type: "registered",
        role: "admin",
        joinedAt: new Date(),
      },
    ];

    // Add additional members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      allMembers.push(
        ...members.map((member) => ({
          userId: member.userId,
          name: member.name,
          email: member.email,
          contact: member.contact,
          type: member.type,
          role: "member",
          joinedAt: new Date(),
        })),
      );
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      currency: "INR",
      privacy: privacy || "private",
      type: type || "other",
      createdBy: currentUser._id,
      members: allMembers,
      totalExpenses: 0,
      isActive: true,
    });

    // Send notifications to registered users only
    if (members && Array.isArray(members)) {
      const registeredMembers = members.filter(
        (m) => m.type === "registered" && m.userId,
      );

      for (const member of registeredMembers) {
        await Notification.create({
          userId: member.userId,
          type: "group_invitation",
          title: "New Group Invitation",
          message: `You've been added to the group "${name}" by ${currentUser.fullName}`,
          data: {
            groupId: group._id,
            groupName: name,
            invitedBy: currentUser.fullName,
            type: "group_invitation",
          },
          isRead: false,
        });
      }
    }

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", "fullName username email")
      .populate("members.userId", "fullName username email contact");

    return NextResponse.json(
      {
        message: "Group created successfully",
        group: normalizeGroup(populatedGroup, { includeInviteToken: true }),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
