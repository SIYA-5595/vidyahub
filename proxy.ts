import { NextRequest, NextResponse } from "next/server";

// ─── Routes that don't need authentication ────────────────────────────────────
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/welcome",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

const ADMIN_ROLES = ["admin", "super_admin", "department_admin"];

// ─── Proxy (Middleware replacement for this environment) ────────────────────────
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always pass through Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authToken = req.cookies.get("auth_token")?.value;
  const role      = req.cookies.get("user_role")?.value ?? "";
  const isAuth = !!authToken;
  const isAdmin = ADMIN_ROLES.includes(role);

  // 1. Unauthenticated user on a protected route → redirect to /login
  const isPublic = isPublicRoute(pathname);
  if (!isAuth && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Authenticated user on a public page (like / or /login) → redirect to their dashboard
  if (isAuth && (pathname === "/" || pathname === "/login" || pathname === "/welcome")) {
    const dest = isAdmin ? "/admin/dashboard" : "/user/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // 3. Block a non-admin from /admin/* routes
  if (isAuth && pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  // Final check: All good — let the request through
  return NextResponse.next();
}

// Ensure the matcher catches all relevant paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
