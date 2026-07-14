// app/api/users/search/route.js
import { verifyRequestToken } from "@/lib/apiAuth";
import { connectDB } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const limit = rateLimit(request, {
      keyPrefix: "user-search",
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (limit.limited) {
      return rateLimitResponse("Too many searches. Please wait and try again.", limit);
    }

    const auth = await verifyRequestToken(request);
    if (auth.error) return auth.error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = String(searchParams.get("q") || "").trim();

    if (
      !query ||
      query.length < 3 ||
      query.length > 80 ||
      !query.includes("@")
    ) {
      return NextResponse.json({ users: [] });
    }

    const safeQuery = escapeRegex(query);
    const users = await User.find({
      isBlocked: { $ne: true },
      email: { $regex: safeQuery, $options: "i" },
    })
      .select("_id fullName username email contact")
      .limit(10);

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      name: user.fullName,
      username: user.username,
      email: user.email,
      contact: user.contact,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
