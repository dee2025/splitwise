import { connectDB } from "@/lib/db";
import { buildEmailVerificationUrl, createEmailVerificationToken } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

const RESEND_COOLDOWN_MS = 60 * 1000;

function neutralResponse() {
  return NextResponse.json({
    success: true,
    message: "If this email needs verification, a new link will be sent shortly.",
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
      return rateLimitResponse("Too many verification email requests. Please wait and try again.", limit);
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

    const lastSent = user.emailVerificationLastSentAt?.getTime?.() || 0;
    if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
      return neutralResponse();
    }

    const verification = createEmailVerificationToken();
    user.emailVerificationTokenHash = verification.tokenHash;
    user.emailVerificationExpiresAt = verification.expiresAt;
    user.emailVerificationLastSentAt = new Date();
    await user.save();

    sendVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      verificationUrl: buildEmailVerificationUrl(verification.token),
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
