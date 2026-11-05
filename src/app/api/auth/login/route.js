// app/api/auth/login/route.js
import { generateToken } from "@/lib/auth";
import { getEmailValidationError, isMobileClientRequest, normalizeEmail } from "@/lib/authValidation";
import { connectDB } from "@/lib/db";
import { applyEmailVerificationOtp, canSendEmailVerificationOtp } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

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
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");

    const errors = {};
    const emailError = getEmailValidationError(email);
    if (emailError) errors.email = emailError;

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length > 256) {
      errors.password = "Password is too long";
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

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          error: "Email or password is incorrect",
          errors: { password: "Check your credentials and try again" },
        },
        { status: 401 }
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

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          code: "PASSWORD_NOT_SET",
          email: user.email,
          error: "This account uses Google sign-in. Continue with Google or securely set a password.",
          errors: { email: "Use Google or set an email password" },
        },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Email or password is incorrect",
          errors: { password: "Check your credentials and try again" },
        },
        { status: 401 }
      );
    }

    if (user.emailVerified === false) {
      let otpSent = false;
      if (canSendEmailVerificationOtp(user)) {
        const verification = applyEmailVerificationOtp(user);
        await user.save();
        otpSent = true;
        sendVerificationEmail({
          to: user.email,
          fullName: user.fullName,
          otp: verification.otp,
        }).catch((err) => console.error("Login verification email failed:", err.message));
      }

      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          error: otpSent
            ? "Enter the OTP sent to your email to finish signing in"
            : "Enter your verification OTP or request a new one",
          errors: { email: "Email verification is required" },
          email: user.email,
        },
        { status: 403 }
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

    if (isMobileClientRequest(req, body)) {
      responseBody.token = token;
    }

    const response = NextResponse.json(responseBody);

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
