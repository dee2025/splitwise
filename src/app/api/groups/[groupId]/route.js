// app/api/groups/[groupId]/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const groupId = pathSegments[pathSegments.length - 1];

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the groupId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log("❌ Invalid Group ID format");
      return NextResponse.json(
        {
          error: "Invalid group ID format",
          providedId: groupId,
        },
        { status: 400 }
      );
    }

    // Convert to ObjectId
    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // First, check if any group exists with this ID
    const groupExists = await Group.findById(groupObjectId);
    if (!groupExists) {
      // Let's see what groups actually exist for this user
      const userGroups = await Group.find({ "members.userId": user._id })
        .select("_id name")
        .limit(5);

      console.log(
        "  - Your accessible groups:",
        userGroups.map((g) => ({
          id: g._id.toString(),
          name: g.name,
        }))
      );

      return NextResponse.json(
        {
          error: "Group not found",
          debug: {
            requestedId: groupId,
            yourGroups: userGroups.map((g) => ({
              id: g._id.toString(),
              name: g.name,
            })),
          },
        },
        { status: 404 }
      );
    }

    // Now find the group with population
    const group = await Group.findById(groupObjectId)
      .populate("createdBy", "fullName username email")
      .populate("members.userId", "fullName username email contact");

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check membership
    const userIdString = user._id.toString();
    const isMember = group.members.some((member) => {
      if (!member.userId) return false;

      const memberUserId = member.userId._id
        ? member.userId._id.toString()
        : member.userId.toString();

      return memberUserId === userIdString;
    });

    console.log("  - Is user a member?", isMember);
    console.log(
      "  - Group members:",
      group.members.map((m) => ({
        userId: m.userId?._id?.toString() || m.userId?.toString(),
        name: m.name,
        role: m.role,
      }))
    );

    if (!isMember) {
      return NextResponse.json(
        {
          error: "You are not a member of this group",
          debug: {
            yourUserId: userIdString,
            groupMembers: group.members.map((m) => ({
              userId: m.userId?._id?.toString() || m.userId?.toString(),
              name: m.name,
              role: m.role,
            })),
          },
        },
        { status: 403 }
      );
    }

    console.log("✅ Access granted to group:", group.name);
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const groupId = pathSegments[pathSegments.length - 1];

    // Get token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate group ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: "Invalid group ID format" },
        { status: 400 }
      );
    }

    const groupObjectId = new mongoose.Types.ObjectId(groupId);
    const group = await Group.findById(groupObjectId);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is admin of the group
    const isAdmin = group.members.some(
      (member) =>
        (member.userId?._id?.toString() === user._id.toString() ||
          member.userId?.toString() === user._id.toString()) &&
        member.role === "admin"
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group admins can update group settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      currency, 
      privacy, 
      members, // For adding/removing members
      removeMemberId // For removing specific member
    } = body;

    // Update basic group info
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (currency !== undefined) group.currency = currency;
    if (privacy !== undefined) group.privacy = privacy;

    // Handle member operations
    if (members && Array.isArray(members)) {
      // Add new members (similar to create group form logic)
      for (const memberData of members) {
        const existingMember = group.members.find(m => 
          m.email === memberData.email || 
          (memberData.userId && m.userId?.toString() === memberData.userId)
        );

        if (!existingMember) {
          if (memberData.userId) {
            // Registered user
            const userToAdd = await User.findById(memberData.userId);
            if (userToAdd) {
              group.members.push({
                userId: userToAdd._id,
                name: userToAdd.fullName,
                email: userToAdd.email,
                contact: userToAdd.contact,
                role: 'member',
                type: 'registered'
              });
            }
          } else {
            // Custom user
            group.members.push({
              userId: null,
              name: memberData.name,
              email: memberData.email || null,
              contact: memberData.contact || null,
              role: 'member',
              type: 'custom'
            });
          }
        }
      }
    }

    // Handle member removal
    if (removeMemberId) {
      // Prevent removing yourself if you're the only admin
      const memberToRemove = group.members.find(m => 
        m._id?.toString() === removeMemberId || 
        m.userId?.toString() === removeMemberId
      );
      
      if (memberToRemove) {
        // Check if removing the last admin
        const adminCount = group.members.filter(m => m.role === 'admin').length;
        if (memberToRemove.role === 'admin' && adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot remove the only admin from the group" },
            { status: 400 }
          );
        }

        group.members = group.members.filter(m => 
          !(m._id?.toString() === removeMemberId || m.userId?.toString() === removeMemberId)
        );
      }
    }

    // Handle group deletion
    if (body.action === 'delete') {
      await Group.findByIdAndDelete(groupObjectId);
      return NextResponse.json({ message: "Group deleted successfully" });
    }

    await group.save();

    // Populate the updated group
    const updatedGroup = await Group.findById(groupObjectId)
      .populate("createdBy", "fullName username email")
      .populate("members.userId", "fullName username email contact");

    return NextResponse.json({ 
      message: "Group updated successfully",
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Group update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}