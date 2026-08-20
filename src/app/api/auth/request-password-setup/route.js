import { connectDB } from "@/lib/db";
import { applyEmailVerificationOtp, canSendEmailVerificationOtp } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "password-setup-request",
      limit: 6,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many requests. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address" },
        { status: 404 },
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, error: "This account has been blocked" },
        { status: 403 },
      );
    }

    if (user.password) {
      return NextResponse.json(
        { success: false, error: "This account already has a password. Sign in with email and password." },
        { status: 400 },
      );
    }

    if (!canSendEmailVerificationOtp(user)) {
      return NextResponse.json(
        { success: false, error: "A code was already sent. Please wait before requesting another one." },
        { status: 429 },
      );
    }

    const verification = applyEmailVerificationOtp(user);
    await user.save();

    sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      otp: verification.otp,
    }).catch((err) => console.error("Password setup email failed:", err.message));

    return NextResponse.json({
      success: true,
      message: "Password setup OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Password setup request error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send password setup code" },
      { status: 500 },
    );
  }
}
