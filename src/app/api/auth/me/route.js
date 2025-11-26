import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { protect } from "@/lib/protect";

export async function GET(req) {
  await connectDB();
  const decoded = await protect(req);

  if (!decoded) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const user = await User.findById(decoded.id).select("-password");

  return Response.json({ user });
}
