import { ADMIN_COOKIE_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/adminAuth";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function safeEqual(a = "", b = "") {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(req) {
  try {
    const { email = "", password = "" } = await req.json();
    const normalizedEmail = email.toLowerCase().trim();

    if (!safeEqual(normalizedEmail, ADMIN_EMAIL) || !safeEqual(password, ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    const token = generateToken({
      type: "admin",
      email: ADMIN_EMAIL,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        email: ADMIN_EMAIL,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}
