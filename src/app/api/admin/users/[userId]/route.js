import { requireAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";
import Group from "@/models/Group";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function getUserId(req) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    contact: user.contact || "",
    role: user.role || "user",
    authProvider: user.authProvider || "local",
    googleId: user.googleId || "",
    avatar: user.avatar || null,
    bio: user.bio || "",
    isBlocked: Boolean(user.isBlocked),
    blockedAt: user.blockedAt || null,
    blockedReason: user.blockedReason || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function PATCH(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const userId = getUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();
    const isBlocked = Boolean(body.isBlocked);
    const blockedReason = String(body.blockedReason || "").trim().slice(0, 250);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isBlocked = isBlocked;
    user.blockedAt = isBlocked ? new Date() : null;
    user.blockedReason = isBlocked ? blockedReason : "";
    await user.save();

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const userId = getUserId(req);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await User.findById(userId).select("email fullName username");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    await Promise.all([
      Notification.deleteMany({ userId: objectId }),
      Activity.deleteMany({ userId: objectId }),
      Group.updateMany(
        { "members.userId": objectId },
        { $pull: { members: { userId: objectId } } }
      ),
      User.deleteOne({ _id: objectId }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ error: "Unable to delete user" }, { status: 500 });
  }
}
