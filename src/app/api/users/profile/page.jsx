// app/api/profile/route.js
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("groups", "name description");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's groups count
    const groupsCount = await Group.countDocuments({ "members.userId": user._id });

    // Get expenses statistics
    const expensesStats = await Expense.aggregate([
      {
        $match: {
          $or: [
            { "paidBy.userId": user._id },
            { "splitAmong.userId": user._id }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          expenseCount: { $sum: 1 }
        }
      }
    ]);

    const profileData = {
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        contact: user.contact,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      stats: {
        groupsCount,
        totalExpenses: expensesStats[0]?.totalExpenses || 0,
        expenseCount: expensesStats[0]?.expenseCount || 0
      }
    };

    return NextResponse.json(profileData);
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
    const { fullName, contact, avatar } = body;

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (contact) user.contact = contact;
    if (avatar) user.avatar = avatar;

    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        contact: user.contact,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}