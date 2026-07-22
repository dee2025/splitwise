import { deleteUserAccountData } from "@/lib/accountDeletion";
import { verifyRequestToken } from "@/lib/apiAuth";
import { clearTokenCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "delete-account",
      limit: 5,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many account deletion attempts. Please wait and try again.", limit);
    }

    await connectDB();

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const confirmation = String(body?.confirmation || "").trim();
    const password = String(body?.password || "");

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { success: false, error: "Type DELETE to confirm account deletion" },
        { status: 400 },
      );
    }

    const user = await User.findById(auth.decoded.userId).select("password authProvider email fullName");

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.authProvider === "local") {
      if (!password) {
        return NextResponse.json(
          { success: false, error: "Password is required to delete this account" },
          { status: 400 },
        );
      }

      const passwordMatches = await bcrypt.compare(password, user.password || "");
      if (!passwordMatches) {
        return NextResponse.json(
          { success: false, error: "Password is incorrect" },
          { status: 403 },
        );
      }
    }

    const result = await deleteUserAccountData(user._id);
    const response = NextResponse.json({
      success: true,
      message: "Your account and associated data have been deleted.",
      result,
    });
    clearTokenCookie(response);
    return response;
  } catch (error) {
    console.error("Self account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to delete account" },
      { status: 500 },
    );
  }
}
