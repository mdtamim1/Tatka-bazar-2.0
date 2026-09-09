import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]?.toLowerCase() || "";

  // 1. Subdomain routing support
  if (hostname.startsWith("admin.") || hostname.startsWith("admin-")) {
    const adminUrl = process.env["ADMIN_URL"] ?? "https://tatka-bazar-2-0-admin.vercel.app";
    return NextResponse.rewrite(new URL(`${url.pathname}${url.search}`, adminUrl));
  }

  if (hostname.startsWith("vendor.") || hostname.startsWith("vendor-")) {
    const vendorUrl = process.env["VENDOR_URL"] ?? "https://tatka-bazar-2-0-vendor.vercel.app";
    return NextResponse.rewrite(new URL(`${url.pathname}${url.search}`, vendorUrl));
  }

  if (hostname.startsWith("rider.") || hostname.startsWith("rider-")) {
    const riderUrl = process.env["RIDER_URL"] ?? "https://tatka-bazar-2-0-rider-seven.vercel.app";
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
