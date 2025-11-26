import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { username } = await req.json();

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ 
        available: false,
        message: "Username is required",
        valid: false
      }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Username validation rules
    if (trimmedUsername.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username must be at least 3 characters",
        valid: false
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json({
        available: false,
        message: "Username can only contain letters, numbers, and underscores",
        valid: false
      });
    }

    if (trimmedUsername.length > 20) {
      return NextResponse.json({
        available: false,
        message: "Username must be less than 20 characters",
        valid: false
      });
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'administrator', 'root', 'support', 'help', 'contact'];
    if (reservedUsernames.includes(trimmedUsername)) {
      return NextResponse.json({
        available: false,
        message: "This username is not available",
        valid: false
      });
    }

    // Check database for existing username
    const existingUser = await User.findOne({ username: trimmedUsername });
    
    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: "Username is already taken",
        valid: true
      });
    }

    return NextResponse.json({
      available: true,
      message: "Username is available!",
      valid: true
    });

  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ 
      available: false,
      message: "Server error. Please try again.",
      valid: false
    }, { status: 500 });
  }
}