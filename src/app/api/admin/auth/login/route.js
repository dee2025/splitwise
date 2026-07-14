import { ADMIN_COOKIE_NAME, ensureDefaultAdmin, serializeAdmin } from "@/lib/adminAuth";
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const limit = rateLimit(req, {
      keyPrefix: "admin-login",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many admin login attempts. Try again later.", limit);
    }

    await ensureDefaultAdmin();
    await connectDB();

    const { email = "", password = "" } = await req.json();
    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    if (admin.isBlocked) {
      return NextResponse.json({ error: "Admin account is blocked" }, { status: 403 });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken({
      type: "admin",
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: serializeAdmin(admin),
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}
