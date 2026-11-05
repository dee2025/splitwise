import { generateToken, setTokenCookie } from "@/lib/auth";
import { getEmailValidationError, getPasswordValidationError, normalizeEmail } from "@/lib/authValidation";
import { connectDB } from "@/lib/db";
import {
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  matchesEmailVerificationOtp,
  normalizeEmailVerificationOtp,
} from "@/lib/emailVerification";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "password-setup-confirm",
      limit: 12,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many attempts. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const otp = normalizeEmailVerificationOtp(body?.otp || body?.code);
    const newPassword = String(body?.newPassword || "");

    const errors = {};
    const emailError = getEmailValidationError(email);
    if (emailError) errors.email = emailError;
    if (otp.length !== 6) {
      errors.otp = "Enter the 6-digit OTP";
    }
    const passwordError = getPasswordValidationError(newPassword, { requiredLabel: "New password" });
    if (passwordError) errors.newPassword = passwordError;

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Password setup failed" },
        { status: 400 },
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

    if (!matchesEmailVerificationOtp(email, otp, user.emailVerificationOtpHash)) {
      user.emailVerificationOtpAttempts = Number(user.emailVerificationOtpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json(
        { success: false, error: "Incorrect OTP" },
        { status: 400 },
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.authProvider = "local";
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    user.emailVerificationOtpHash = null;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    user.emailVerificationOtpAttempts = 0;
    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password set successfully",
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
    });

    setTokenCookie(response, token);
    return response;
  } catch (error) {
    console.error("Password setup confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to set password" },
      { status: 500 },
    );
  }
}
