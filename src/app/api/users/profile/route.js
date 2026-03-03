import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    // select everything except password; User has no "groups" array so no populate needed
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Groups the user belongs to
    const groupsCount = await Group.countDocuments({
      "members.userId": user._id,
    });

    // Expense stats:
    //   Expense.paidBy  → direct ObjectId ref to User
    //   Expense.splitBetween → [{ userId: ObjectId, amount, ... }]
    const expensesStats = await Expense.aggregate([
      {
        $match: {
          $or: [
            { paidBy: user._id },
            { "splitBetween.userId": user._id },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          expenseCount: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        contact: user.contact,
        avatar: user.avatar ?? null,
        bio: user.bio ?? "",
        role: user.role ?? "user",
        createdAt: user.createdAt,
      },
      stats: {
        groupsCount,
        totalExpenses: expensesStats[0]?.totalExpenses ?? 0,
        expenseCount: expensesStats[0]?.expenseCount ?? 0,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { fullName, username, contact, bio, avatar } = body;

    const errors = {};

    if (fullName !== undefined) {
      const trimmed = fullName.trim();
      if (!trimmed) {
        errors.fullName = "Full name cannot be empty";
      } else if (trimmed.length < 2) {
        errors.fullName = "Full name must be at least 2 characters";
      } else {
        user.fullName = trimmed;
      }
    }

    if (username !== undefined) {
      const trimmedUsername = username.trim().toLowerCase();
      if (!trimmedUsername) {
        errors.username = "Username cannot be empty";
      } else if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
        errors.username = "Username must be 3-20 chars (letters, numbers, underscore)";
      } else if (trimmedUsername !== user.username.toLowerCase()) {
        // Only check uniqueness if username changed
        const existingUser = await User.findOne({ username: trimmedUsername }).select("_id");
        if (existingUser) {
          errors.username = "Username is already taken";
        } else {
          user.username = trimmedUsername;
        }
      } else {
        // Username unchanged, just keep it
        user.username = trimmedUsername;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    if (contact !== undefined) user.contact = contact.trim();
    if (bio !== undefined) user.bio = bio.trim().slice(0, 200);
    if (avatar !== undefined) user.avatar = avatar ?? null;

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        contact: user.contact,
        avatar: user.avatar ?? null,
        bio: user.bio ?? "",
        role: user.role ?? "user",
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
