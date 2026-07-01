import { ADMIN_EMAIL, requireAdmin } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = await requireAdmin(req);

  if (auth.error) {
    return NextResponse.json({ authenticated: false }, { status: auth.status === 403 ? 403 : 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      email: ADMIN_EMAIL,
    },
  });
}
