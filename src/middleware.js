// middleware.js
import { NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/api/user',
  '/api/expenses', 
  '/api/groups',
];

const authRoutes = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  console.log('🔍 Middleware Debug:');
  console.log('  - Path:', pathname);
  console.log('  - Token exists:', !!token);
  console.log('  - Token value:', token ? '***' + token.slice(-10) : 'none');

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  console.log('  - Is protected route:', isProtectedRoute);
  console.log('  - Is auth route:', isAuthRoute);

  // For protected routes, check if user is authenticated
  if (isProtectedRoute) {
    if (!token) {
      console.log('🚫 No token - Redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Token found - Allowing access to protected route');
    return NextResponse.next();
  }

  // For auth routes, redirect to dashboard if already authenticated
  if (isAuthRoute && token) {
    console.log('🔁 Already authenticated - Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('➡️ Allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/api/user/:path*',
    '/api/expenses/:path*',
    '/api/groups/:path*',
  ],
};