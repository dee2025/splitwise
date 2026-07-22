import { connectDB } from "@/lib/db";
import { hashEmailVerificationToken } from "@/lib/emailVerification";
import { sendWelcomeEmail } from "@/lib/mailer";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

async function getToken(request) {
  if (request.method === "GET") {
    return new URL(request.url).searchParams.get("token") || "";
  }

  const body = await request.json().catch(() => ({}));
  return body?.token || "";
}

async function verifyEmail(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "verify-email",
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many verification attempts. Please wait and try again.", limit);
    }

    const token = String(await getToken(request)).trim();
    if (!token || token.length < 32) {
      return NextResponse.json(
        { success: false, error: "Invalid verification link" },
        { status: 400 },
      );
    }

    await connectDB();

    const tokenHash = hashEmailVerificationToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Verification link is invalid or expired" },
        { status: 400 },
      );
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    sendWelcomeEmail({
      to: user.email,
      fullName: user.fullName,
      username: user.username,
    }).catch((err) => console.error("Welcome email failed:", err.message));

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to verify email" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  return verifyEmail(request);
}

export async function POST(request) {
  return verifyEmail(request);
}
