// app/api/users/search/route.js
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { contact: { $regex: query, $options: 'i' } }
      ]
    }).select('_id fullName username email contact').limit(10);

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.fullName,
      username: user.username,
      email: user.email,
      contact: user.contact
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ users: [] });
  }
}