import { connectDB } from "@/lib/db";
import { generateToken, setTokenCookie } from "@/lib/auth";
import { generateUniqueUsername } from "@/lib/username";
import User from "@/models/User";
import { NextResponse } from "next/server";

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

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid Google credential" },
        { status: 400 },
      );
    }

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (!expectedClientId) {
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

    if (googleData.aud !== expectedClientId) {
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
      });
    } else {
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
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Google login successful",
      user: userResponse,
    });

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
