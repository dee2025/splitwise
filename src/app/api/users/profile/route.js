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
    const { fullName, contact, bio, avatar } = body;

    if (fullName !== undefined) {
      const trimmed = fullName.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "Full name cannot be empty" },
          { status: 400 }
        );
      }
      user.fullName = trimmed;
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
