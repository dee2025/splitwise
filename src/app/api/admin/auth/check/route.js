import { requireAdmin, serializeAdmin } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = await requireAdmin(req);

  if (auth.error) {
    return NextResponse.json({ authenticated: false }, { status: auth.status === 403 ? 403 : 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: serializeAdmin(auth.admin),
  });
}
