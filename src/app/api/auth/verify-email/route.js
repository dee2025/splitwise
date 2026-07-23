import { generateToken, setTokenCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  hashEmailVerificationOtp,
  normalizeEmailVerificationOtp,
} from "@/lib/emailVerification";
import { sendWelcomeEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

function isMobileClient(request, body = {}) {
  return (
    request.headers.get("x-moneysplit-client")?.toLowerCase() === "flutter" ||
    String(body?.client || "").toLowerCase() === "flutter"
  );
}

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "verify-email",
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many verification attempts. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").toLowerCase().trim();
    const otp = normalizeEmailVerificationOtp(body?.otp || body?.code);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Enter the 6-digit OTP" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || user.authProvider !== "local") {
      return NextResponse.json(
        { success: false, error: "Verification failed" },
        { status: 400 },
      );
    }

    if (user.emailVerified !== false) {
      const token = generateToken({
        userId: user._id,
        email: user.email,
      });
      const responseBody = {
        success: true,
        message: "Email is already verified.",
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          contact: user.contact,
          avatar: user.avatar,
          emailVerified: true,
          createdAt: user.createdAt,
        },
      };
      if (isMobileClient(request, body)) {
        responseBody.token = token;
      }
      const response = NextResponse.json(responseBody);
      setTokenCookie(response, token);
      return response;
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationExpiresAt) {
      return NextResponse.json(
        { success: false, error: "OTP expired. Request a new code." },
        { status: 400 },
      );
    }

    if (user.emailVerificationExpiresAt <= new Date()) {
      user.emailVerificationOtpHash = null;
      user.emailVerificationExpiresAt = null;
      user.emailVerificationOtpAttempts = 0;
      await user.save();
      return NextResponse.json(
        { success: false, error: "OTP expired. Request a new code." },
        { status: 400 },
      );
    }

    if ((user.emailVerificationOtpAttempts || 0) >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Too many incorrect OTP attempts. Request a new code." },
        { status: 429 },
      );
    }

    const otpHash = hashEmailVerificationOtp(email, otp);
    if (otpHash !== user.emailVerificationOtpHash) {
      user.emailVerificationOtpAttempts = Number(user.emailVerificationOtpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json(
        { success: false, error: "Incorrect OTP" },
        { status: 400 },
      );
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationOtpHash = null;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    user.emailVerificationOtpAttempts = 0;
    await user.save();

    sendWelcomeEmail({
      to: user.email,
      fullName: user.fullName,
      username: user.username,
    }).catch((err) => console.error("Welcome email failed:", err.message));

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
      emailVerified: true,
      createdAt: user.createdAt,
    };

    const responseBody = {
      success: true,
      message: "Email verified successfully",
      user: userResponse,
    };

    if (isMobileClient(request, body)) {
      responseBody.token = token;
    }

    const response = NextResponse.json(responseBody);
    setTokenCookie(response, token);
    return response;
  } catch (error) {
    console.error("Email OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify email" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Email verification now uses OTP. Enter your code in the app." },
    { status: 405 },
  );
}
