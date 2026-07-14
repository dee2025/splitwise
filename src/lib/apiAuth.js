import { verifyToken } from "@/lib/auth";
import { getRequestToken } from "@/lib/requestAuth";
import { NextResponse } from "next/server";

export async function verifyRequestToken(request) {
  const token = getRequestToken(request);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    return {
      decoded: await verifyToken(token),
    };
  } catch {
    const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
    response.cookies.delete("token");
    return { error: response };
  }
}
