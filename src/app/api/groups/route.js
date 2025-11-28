import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let groups = await Group.find({
      "members.userId": user._id,
      isActive: true
    })
    .populate("createdBy", "fullName username email")
    .populate("members.userId", "fullName username email contact")
    .sort({ createdAt: -1 });

    // 🔥 FIX: clean member structure
    groups = groups.map(group => ({
      ...group.toObject(),
      members: group.members.map(m => ({
        _id: m._id,
        userId: m.userId?._id || null,
        fullName: m.userId?.fullName || m.name,
        username: m.userId?.username || null,
        email: m.userId?.email || m.email,
        contact: m.userId?.contact || m.contact,
        role: m.role,
        type: m.type,
        joinedAt: m.joinedAt
      }))
    }));

    return NextResponse.json({ groups });

  } catch (error) {
    console.error("Groups fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, currency, privacy, members } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ error: "At least one member is required" }, { status: 400 });
    }

    // Create group with creator as admin
    const allMembers = [
      {
        userId: currentUser._id,
        name: currentUser.fullName,
        email: currentUser.email,
        contact: currentUser.contact,
        type: 'registered',
        role: 'admin',
        joinedAt: new Date()
      },
      ...members.map(member => ({
        userId: member.userId,
        name: member.name,
        email: member.email,
        contact: member.contact,
        type: member.type,
        role: 'member',
        joinedAt: new Date()
      }))
    ];

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      currency: currency || 'INR',
      privacy: privacy || 'private',
      createdBy: currentUser._id,
      members: allMembers,
      totalExpenses: 0,
      isActive: true
    });

    // Send notifications to registered users
    const registeredMembers = allMembers.filter(m => 
      m.type === 'registered' && m.userId.toString() !== currentUser._id.toString()
    );
    
    for (const member of registeredMembers) {
      await Notification.create({
        userId: member.userId,
        type: 'group_invitation',
        title: 'New Group Invitation',
        message: `You've been added to the group "${name}" by ${currentUser.fullName}`,
        data: {
          groupId: group._id,
          groupName: name,
          invitedBy: currentUser.fullName,
          type: 'group_invitation'
        },
        isRead: false
      });
    }

    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'fullName username email')
      .populate('members.userId', 'fullName username email contact');

    return NextResponse.json({
      message: "Group created successfully",
      group: populatedGroup
    }, { status: 201 });

  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}