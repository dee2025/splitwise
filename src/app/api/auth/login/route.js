// app/api/auth/login/route.js
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function isMobileClient(req, body = {}) {
  return (
    req.headers.get("x-moneysplit-client")?.toLowerCase() === "flutter" ||
    String(body?.client || "").toLowerCase() === "flutter"
  );
}

export async function POST(req) {
  try {
    const limit = rateLimit(req, {
      keyPrefix: "user-login",
      limit: 10,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many login attempts. Please wait and try again.", limit);
    }

    await connectDB();
    const body = await req.json();
    const { email, password } = body;

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
      return NextResponse.json(
        {
          error: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        {
          error: "No account found with this email address",
          errors: { email: "Email not registered" },
        },
        { status: 400 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        {
          error: "This account has been blocked",
          errors: { email: "Contact support if you believe this is a mistake" },
        },
        { status: 403 }
      );
    }

    if (!user.password || user.authProvider === "google") {
      return NextResponse.json(
        {
          error: "This account uses Google sign in",
          errors: { email: "Use Continue with Google for this account" },
        },
        { status: 400 }
      );
    }

    if (user.emailVerified === false) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          error: "Please verify your email before signing in",
          errors: { email: "Check your inbox for the MoneySplit verification email" },
          email: user.email,
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid password",
          errors: { password: "Incorrect password" },
        },
        { status: 400 }
      );
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      contact: user.contact,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    const responseBody = {
      success: true,
      message: "Login successful",
      user: userResponse,
    };

    if (isMobileClient(req, body)) {
      responseBody.token = token;
    }

    const response = NextResponse.json(responseBody);

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
