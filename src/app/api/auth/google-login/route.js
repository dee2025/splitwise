import { connectDB } from "@/lib/db";
import { generateToken, setTokenCookie } from "@/lib/auth";
import { generateUniqueUsername } from "@/lib/username";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

function getEmailLocalPart(email) {
  return (email || "").split("@")[0] || "user";
}

function getDisplayNameFromEmail(email) {
  const localPart = getEmailLocalPart(email);
  const words = localPart
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  if (!words.length) {
    return "User";
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function verifyGoogleCredential(credential) {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const response = await fetch(url, { method: "GET", cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!data?.sub || !data?.email || !data?.aud) {
    return null;
  }

  return data;
}

function getAllowedClientIds() {
  return [
    process.env.GOOGLE_CLIENT_ID,
    ...(process.env.GOOGLE_CLIENT_IDS || "")
      .split(",")
      .map((clientId) => clientId.trim())
      .filter(Boolean),
  ].filter(Boolean);
}

function isMobileClient(request, body = {}) {
  return (
    request.headers.get("x-moneysplit-client")?.toLowerCase() === "flutter" ||
    String(body?.client || "").toLowerCase() === "flutter"
  );
}

export async function POST(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "google-login",
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many login attempts. Please wait and try again.", limit);
    }

    const body = await request.json();
    const { credential } = body;

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid Google credential" },
        { status: 400 },
      );
    }

    const allowedClientIds = getAllowedClientIds();
    if (!allowedClientIds.length) {
      return NextResponse.json(
        { success: false, error: "Google login is not configured on server" },
        { status: 500 },
      );
    }

    const googleData = await verifyGoogleCredential(credential);
    if (!googleData) {
      return NextResponse.json(
        { success: false, error: "Google credential verification failed" },
        { status: 401 },
      );
    }

    if (!allowedClientIds.includes(googleData.aud)) {
      return NextResponse.json(
        { success: false, error: "Google token audience mismatch" },
        { status: 401 },
      );
    }

    if (googleData.email_verified !== "true") {
      return NextResponse.json(
        { success: false, error: "Google email is not verified" },
        { status: 401 },
      );
    }

    await connectDB();

    const normalizedEmail = googleData.email.toLowerCase().trim();
    const emailLocalPart = getEmailLocalPart(normalizedEmail);
    const fullNameFromEmail = getDisplayNameFromEmail(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const usernameSeed = emailLocalPart;
      const username = await generateUniqueUsername(usernameSeed);

      user = await User.create({
        fullName: fullNameFromEmail,
        email: normalizedEmail,
        username,
        password: null,
        avatar: googleData.picture || null,
        authProvider: "google",
        googleId: googleData.sub,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
    } else {
      if (user.isBlocked) {
        return NextResponse.json(
          {
            success: false,
            error: "This account has been blocked",
          },
          { status: 403 },
        );
      }

      let shouldSave = false;

      if (!user.username) {
        user.username = await generateUniqueUsername(emailLocalPart);
        shouldSave = true;
      }

      if (!user.googleId) {
        user.googleId = googleData.sub;
        shouldSave = true;
      }

      if (!user.avatar && googleData.picture) {
        user.avatar = googleData.picture;
        shouldSave = true;
      }

      if (!user.fullName && fullNameFromEmail) {
        user.fullName = fullNameFromEmail;
        shouldSave = true;
      }

      if (user.emailVerified !== true) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        user.emailVerificationTokenHash = null;
        user.emailVerificationOtpHash = null;
        user.emailVerificationExpiresAt = null;
        user.emailVerificationOtpAttempts = 0;
        shouldSave = true;
      }

      if (user.authProvider !== "local") {
        user.authProvider = "google";
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
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
      emailVerified: user.emailVerified !== false,
      createdAt: user.createdAt,
    };

    const responseBody = {
      success: true,
      message: "Google login successful",
      user: userResponse,
    };

    if (isMobileClient(request, body)) {
      responseBody.token = token;
    }

    const response = NextResponse.json(responseBody);

    setTokenCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
