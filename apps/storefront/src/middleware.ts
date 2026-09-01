import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]?.toLowerCase() || "";

  // 1. Subdomain routing support
  if (hostname.startsWith("admin.") || hostname.startsWith("admin-")) {
    const adminUrl = process.env["ADMIN_URL"] ?? "http://localhost:3001";
    return NextResponse.rewrite(new URL(`${url.pathname}${url.search}`, adminUrl));
  }

  if (hostname.startsWith("vendor.") || hostname.startsWith("vendor-")) {
    const vendorUrl = process.env["VENDOR_URL"] ?? "http://localhost:3002";
    return NextResponse.rewrite(new URL(`${url.pathname}${url.search}`, vendorUrl));
  }

  if (hostname.startsWith("rider.") || hostname.startsWith("rider-")) {
    const riderUrl = process.env["RIDER_URL"] ?? "http://localhost:3003";
    return NextResponse.rewrite(new URL(`${url.pathname}${url.search}`, riderUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
