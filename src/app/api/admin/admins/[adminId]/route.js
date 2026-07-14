import { requireAdmin, serializeAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function getAdminId(req) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

async function countActiveOwners(excludingId = null) {
  const query = { role: "owner", isBlocked: { $ne: true } };
  if (excludingId) {
    query._id = { $ne: excludingId };
  }
  return Admin.countDocuments(query);
}

export async function PATCH(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (auth.admin?.role !== "owner") {
      return NextResponse.json({ error: "Only owners can manage admins" }, { status: 403 });
    }

    await connectDB();

    const adminId = getAdminId(req);
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json({ error: "Invalid admin id" }, { status: 400 });
    }

    const target = await Admin.findById(adminId).select("+password");
    if (!target) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const body = await req.json();
    const updates = {};
    const errors = {};
    const isSelf = target._id.toString() === auth.admin._id.toString();

    if (body.email !== undefined) {
      const email = String(body.email || "").toLowerCase().trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address";
      } else {
        const existing = await Admin.findOne({ email, _id: { $ne: target._id } }).select("_id");
        if (existing) errors.email = "Admin email already exists";
        updates.email = email;
      }
    }

    if (body.name !== undefined) {
      updates.name = String(body.name || "").trim().slice(0, 80);
    }

    if (body.role !== undefined) {
      const nextRole = String(body.role || "admin").trim();
      if (!["owner", "admin"].includes(nextRole)) {
        errors.role = "Invalid role";
      } else if (target.role === "owner" && nextRole !== "owner" && (await countActiveOwners(target._id)) === 0) {
        errors.role = "At least one active owner is required";
      } else {
        updates.role = nextRole;
      }
    }

    if (body.password) {
      const password = String(body.password);
      if (password.length < 10) {
        errors.password = "Use at least 10 characters";
      } else {
        updates.password = await bcrypt.hash(password, 12);
      }
    }

    if (body.isBlocked !== undefined) {
      const nextBlocked = Boolean(body.isBlocked);
      if (isSelf && nextBlocked) {
        errors.isBlocked = "You cannot block your own admin account";
      } else if (target.role === "owner" && nextBlocked && (await countActiveOwners(target._id)) === 0) {
        errors.isBlocked = "At least one active owner is required";
      } else {
        updates.isBlocked = nextBlocked;
        updates.blockedAt = nextBlocked ? new Date() : null;
        updates.blockedReason = nextBlocked ? String(body.blockedReason || "").trim().slice(0, 250) : "";
      }
    }

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    target.set(updates);
    await target.save();

    return NextResponse.json({ admin: serializeAdmin(target) });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Unable to update admin" }, { status: 500 });
  }
}
