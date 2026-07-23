import { connectDB } from "@/lib/db";
import { applyEmailVerificationOtp, canSendEmailVerificationOtp } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

function neutralResponse() {
  return NextResponse.json({
    success: true,
    message: "If this email needs verification, a new OTP will be sent shortly.",
  });
}

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "resend-email-verification",
      limit: 5,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many OTP requests. Please wait and try again.", limit);
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return neutralResponse();
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || user.emailVerified !== false || user.authProvider !== "local") {
      return neutralResponse();
    }

    if (!canSendEmailVerificationOtp(user)) {
      return neutralResponse();
    }

    const verification = applyEmailVerificationOtp(user);
    await user.save();

    sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      otp: verification.otp,
    }).catch((err) => console.error("Verification resend email failed:", err.message));

    return neutralResponse();
  } catch (error) {
    console.error("Verification resend error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to resend verification email" },
      { status: 500 },
    );
  }
}
