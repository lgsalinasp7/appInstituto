/**
 * Next.js Middleware for Route Protection
 * Protects routes under (protected) group requiring authentication
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/matriculas",
  "/recaudos",
  "/cartera",
  "/reportes",
  "/prospectos",
  "/admin",
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth storage cookie (set by Zustand persist)
  const authStorage = request.cookies.get("auth-storage");

  // Parse auth state from cookie if exists
  let isAuthenticated = false;
  if (authStorage?.value) {
    try {
      const parsed = JSON.parse(authStorage.value);
      isAuthenticated = parsed?.state?.isAuthenticated === true;
    } catch {
      // Invalid JSON, treat as not authenticated
      isAuthenticated = false;
    }
  }

  // Check if trying to access protected route without auth
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with return URL
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if trying to access auth routes while authenticated
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
