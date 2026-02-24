import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const normalizedNotifications = notifications.map((notification) => {
      const normalized = notification.toObject();

      // Normalize payload field shape (legacy: metadata, current: data)
      const mergedData = {
        ...(normalized.metadata || {}),
        ...(normalized.data || {}),
      };
      normalized.data = mergedData;
      delete normalized.metadata;

      // Normalize legacy notification types to current lifecycle set
      if (normalized.type === "settlement") {
        normalized.type = "settlement_request";
      } else if (normalized.type === "payment_received") {
        normalized.type = "settlement_completed";
      }

      return normalized;
    });

    return NextResponse.json({ notifications: normalizedNotifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await Notification.updateMany(
        { userId: user._id, isRead: false },
        { isRead: true }
      );
    } else if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: user._id },
        { isRead: true }
      );
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ message: "Notifications updated successfully" });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// app/api/notifications/route.js
export async function DELETE(request) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId: user._id
    });

    return NextResponse.json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Notifications delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}