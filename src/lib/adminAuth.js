import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export const ADMIN_COOKIE_NAME = "admin_token";

export function serializeAdmin(admin) {
  return {
    id: admin._id.toString(),
    name: admin.name || "",
    email: admin.email,
    role: admin.role || "admin",
    isBlocked: Boolean(admin.isBlocked),
    blockedAt: admin.blockedAt || null,
    blockedReason: admin.blockedReason || "",
    lastLoginAt: admin.lastLoginAt || null,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

export async function ensureDefaultAdmin() {
  await connectDB();

  const adminCount = await Admin.countDocuments({});
  if (adminCount > 0) return null;

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to create the first admin account");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  return Admin.create({
    email,
    password: hashedPassword,
    name: process.env.ADMIN_NAME?.trim() || "Owner",
    role: "owner",
  });
}

export async function requireAdmin(req) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return { error: "Unauthenticated", status: 401 };
  }

  let decoded;
  try {
    decoded = await verifyToken(token);
  } catch {
    return { error: "Session expired", status: 401 };
  }

  if (decoded.type !== "admin" || !decoded.adminId) {
    return { error: "Admin access required", status: 403 };
  }

  await connectDB();

  const admin = await Admin.findById(decoded.adminId);
  if (!admin || admin.isBlocked) {
    return { error: "Admin access required", status: 403 };
  }

  return {
    admin,
    user: {
      _id: admin._id,
      email: admin.email,
      role: admin.role,
    },
  };
}
