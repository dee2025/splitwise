import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Activity from "@/models/Activity";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    const activity = await Activity.find({ groupId })
      .populate("userId", "fullName username")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { activity },
      { status: 200 }
    );
  } catch (error) {
    console.error("ACTIVITY_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
