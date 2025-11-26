import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken, setTokenCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { fullName, username, email, contact, password, confirmPassword } = body;

    // ... (keep your existing validation logic)

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      contact: contact.trim(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id,
      email: newUser.email
    });

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      contact: newUser.contact,
      createdAt: newUser.createdAt,
    };

    // Create response
    const response = NextResponse.json({
      message: "Account created successfully!",
      user: userResponse,
    }, { status: 201 });

    // Set HTTP-only cookie
    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Something went wrong. Please try again later."
    }, { status: 500 });
  }
}