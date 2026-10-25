import { NextRequest, NextResponse } from "next/server";

/**
 * Vendor Portal — Next.js Edge Middleware
 *
 * Runs ON THE SERVER (Edge Runtime) before any page or API route is rendered.
 * This eliminates the "flash of unauthenticated content" caused by client-side
 * useEffect redirects and hardens all protected routes server-side.
 *
 * Strategy:
 *   - Public routes (/login, /signup, /register, /onboarding, /api/*): pass through.
 *   - All other routes: check for vendor_token cookie.
 *     If missing → redirect to /login.
 *     If present (cookie exists) → allow through (full JWT verify happens in each API route).
 *
 * NOTE: We only check for the cookie's EXISTENCE in middleware (Edge runtime cannot
 * import jsonwebtoken). Full cryptographic verification is done inside each API route
 * using verifyVendorToken().
 */

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/register",
  "/onboarding",
];

// API routes are always public-path-passed (each route handles its own auth)
const isPublicPath = (pathname: string): boolean => {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public paths through without any checks
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for the vendor auth token (stored as a cookie OR Authorization header).
  // The client also stores it in localStorage but cookies are readable server-side.
  // If cookie not present, we rely on the pattern where the client sets it.
  // For maximum security, we check both the cookie and the Authorization header.
  const tokenFromCookie = req.cookies.get("vendor_token")?.value;
  const authHeader = req.headers.get("authorization") || "";
  const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, "").trim();

  const hasToken = Boolean(tokenFromCookie || tokenFromHeader);

  if (!hasToken) {
    // No token found — redirect to login with the original URL as a return param
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — allow through. The API route will do full JWT verification.
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
