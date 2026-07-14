import { requireAdmin, serializeAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function assertOwner(auth) {
  return auth.admin?.role === "owner";
}

function validateAdminPayload(body, { isCreate = false } = {}) {
  const errors = {};
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const role = String(body.role || "admin").trim();

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (isCreate && !password) {
    errors.password = "Password is required";
  } else if (password && password.length < 10) {
    errors.password = "Use at least 10 characters";
  }

  if (!["owner", "admin"].includes(role)) {
    errors.role = "Invalid role";
  }

  return { errors, email, password, role };
}

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const admins = await Admin.find({})
      .sort({ role: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      admins: admins.map(serializeAdmin),
      canManageAdmins: assertOwner(auth),
    });
  } catch (error) {
    console.error("Admin list fetch error:", error);
    return NextResponse.json({ error: "Unable to load admins" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!assertOwner(auth)) {
      return NextResponse.json({ error: "Only owners can create admins" }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { errors, email, password, role } = validateAdminPayload(body, { isCreate: true });
    const name = String(body.name || "").trim().slice(0, 80);

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const existing = await Admin.findOne({ email }).select("_id");
    if (existing) {
      return NextResponse.json(
        { error: "Validation failed", errors: { email: "Admin email already exists" } },
        { status: 409 }
      );
    }

    const admin = await Admin.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      createdBy: auth.admin._id,
    });

    return NextResponse.json({ admin: serializeAdmin(admin) }, { status: 201 });
  } catch (error) {
    console.error("Admin create error:", error);
    return NextResponse.json({ error: "Unable to create admin" }, { status: 500 });
  }
}
