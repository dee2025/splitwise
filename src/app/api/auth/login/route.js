// app/api/auth/login/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Validation
    const errors = {};

    if (!email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        error: "Validation failed",
        errors 
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ 
        error: "No account found with this email address",
        errors: { email: "Email not registered" }
      }, { status: 400 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "Invalid password",
        errors: { password: "Incorrect password" }
      }, { status: 400 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      email: user.email
    });

    // User response without password
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      contact: user.contact,
      createdAt: user.createdAt,
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userResponse,
    });

    // CORRECTED: Set HTTP-only cookie with proper syntax
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log('🍪 Login API: Cookie set successfully');
    console.log('🔐 Token generated for user:', user.email);
    
    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Something went wrong. Please try again later."
    }, { status: 500 });
  }
}