import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy (New Middleware convention)
 * Handles route protection and redirection.
 */
export function proxy(request: NextRequest) {
  const loginCookie = request.cookies.get("login");
  const isAuthenticated = loginCookie && loginCookie.value === "true";
  const { pathname } = request.nextUrl;

  const isGuestRoute = pathname === "/login" || pathname === "/signup";
  // Public routes that anyone can access
  const isPublicRoute = pathname === "/" || pathname === "/welcome" || pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".");

  // 1. Handle Protected Routes
  if (!isGuestRoute && !isPublicRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Handle Guest-only routes
  if (isGuestRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/alumni/:path*",
    "/canteen/:path*",
    "/clubs/:path*",
    "/counseling/:path*",
    "/events/:path*",
    "/gpa-calculator/:path*",
    "/interviews/:path*",
    "/lab/:path*",
    "/laundry/:path*",
    "/library/:path*",
    "/lost-found/:path*",
    "/mess/:path*",
    "/partners/:path*",
    "/performance/:path*",
    "/profile/:path*",
    "/qna/:path*",
    "/research/:path*",
    "/resume/:path*",
    "/room/:path*",
    "/scholarships/:path*",
    "/settings/:path*",
    "/sports/:path*",
    "/syllabus/:path*",
    "/talent/:path*",
    "/timetable/:path*",
    "/visitors/:path*",
    "/wifi/:path*",
    "/login",
    "/signup"
  ],
};
