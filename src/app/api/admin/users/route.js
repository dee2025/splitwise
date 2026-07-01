import { requireAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const users = await User.find({})
      .select("fullName username email contact role authProvider googleId avatar bio isBlocked blockedAt blockedReason createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
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
      })),
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }
}
