import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/home",
  "/groups",
  "/expenses",
  "/notifications",
  "/profile",
  "/api/users",
  "/api/expenses",
  "/api/groups",
];

const authRoutes = ["/login", "/signup"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Keep dashboard route in code but do not surface it in the app.
  if (pathname.startsWith("/dashboard") && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // For protected routes, require authentication.
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For auth routes, redirect authenticated users away.
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/home/:path*",
    "/groups/:path*",
    "/expenses/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/api/users/:path*",
    "/api/expenses/:path*",
    "/api/groups/:path*",
  ],
};
