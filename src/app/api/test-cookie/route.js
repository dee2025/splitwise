// app/api/test-cookie/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  
  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    allCookies: Object.fromEntries(request.cookies)
  });
}