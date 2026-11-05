import { connectDB } from "@/lib/db";
import { getEmailValidationError, normalizeEmail } from "@/lib/authValidation";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { applyPasswordResetOtp, canSendPasswordResetOtp } from "@/lib/passwordReset";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

const successResponse = () =>
  NextResponse.json({
    success: true,
    message: "If an account exists for this email, a reset code has been sent.",
  });

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "password-reset-request",
      limit: 6,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many requests. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    if (getEmailValidationError(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).select(
      "+passwordResetOtpHash +passwordResetExpiresAt +passwordResetLastSentAt +passwordResetOtpAttempts",
    );
    if (!user || user.isBlocked || !canSendPasswordResetOtp(user)) {
      return successResponse();
    }

    const reset = applyPasswordResetOtp(user);
    await user.save();
    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        otp: reset.otp,
      });
    } catch (error) {
      console.error("Password reset email failed:", error);
      user.passwordResetOtpHash = null;
      user.passwordResetExpiresAt = null;
      user.passwordResetLastSentAt = null;
      user.passwordResetOtpAttempts = 0;
      await user.save();
    }

    return successResponse();
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send password reset code" },
      { status: 500 },
    );
  }
}
