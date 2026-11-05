import { connectDB } from "@/lib/db";
import { getEmailValidationError, getPasswordValidationError, normalizeEmail } from "@/lib/authValidation";
import {
  matchesPasswordResetOtp,
  normalizePasswordResetOtp,
  PASSWORD_RESET_MAX_ATTEMPTS,
} from "@/lib/passwordReset";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "password-reset-confirm",
      limit: 12,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many attempts. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const otp = normalizePasswordResetOtp(body?.otp || body?.code);
    const newPassword = String(body?.newPassword || "");
    const errors = {};

    const emailError = getEmailValidationError(email);
    if (emailError) errors.email = emailError;
    if (otp.length !== 6) errors.otp = "Enter the 6-digit OTP";
    const passwordError = getPasswordValidationError(newPassword, { requiredLabel: "New password" });
    if (passwordError) errors.newPassword = passwordError;
    if (Object.keys(errors).length) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).select(
      "+passwordResetOtpHash +passwordResetExpiresAt +passwordResetLastSentAt +passwordResetOtpAttempts",
    );
    const resetIsMissing = !user?.passwordResetOtpHash || !user?.passwordResetExpiresAt;
    if (resetIsMissing || user.isBlocked) {
      return NextResponse.json(
        { success: false, error: "Reset code is invalid or expired" },
        { status: 400 },
      );
    }

    if (user.passwordResetExpiresAt <= new Date()) {
      user.passwordResetOtpHash = null;
      user.passwordResetExpiresAt = null;
      user.passwordResetOtpAttempts = 0;
      await user.save();
      return NextResponse.json(
        { success: false, error: "Reset code is invalid or expired" },
        { status: 400 },
      );
    }

    if ((user.passwordResetOtpAttempts || 0) >= PASSWORD_RESET_MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Too many incorrect attempts. Request a new code." },
        { status: 429 },
      );
    }

    if (!matchesPasswordResetOtp(email, otp, user.passwordResetOtpHash)) {
      user.passwordResetOtpAttempts = Number(user.passwordResetOtpAttempts || 0) + 1;
      await user.save();
      return NextResponse.json(
        { success: false, error: "Reset code is invalid or expired" },
        { status: 400 },
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.authProvider = "local";
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    user.passwordResetOtpHash = null;
    user.passwordResetExpiresAt = null;
    user.passwordResetLastSentAt = null;
    user.passwordResetOtpAttempts = 0;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to reset password" },
      { status: 500 },
    );
  }
}
