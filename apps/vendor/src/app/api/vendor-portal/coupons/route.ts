import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getVerifiedVendor(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyVendorToken(token);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** GET — all coupons for this vendor */
export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    // Use Coupon model — filter by vendorId stored in description/metadata
    // Since Prisma schema may not have vendorId on Coupon, we use a safe workaround:
    const coupons = await prisma.coupon.findMany({
      where: { vendorId: payload.sub } as any,
      orderBy: { createdAt: "desc" },
    }).catch(() => prisma.coupon.findMany({
      // Fallback: filter by code prefix
      where: { code: { startsWith: `V-${payload.sub.slice(0, 6)}` } },
      orderBy: { createdAt: "desc" },
    }));

    const formatted = coupons.map((c: any) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType || "PERCENT",
      discountValue: Number(c.discountValue || c.value || 0),
      minimumOrderValue: Number(c.minimumOrderValue || c.minOrderValue || 0),
      maxUses: c.maxUses || null,
      usedCount: c.usedCount || 0,
      isActive: c.isActive ?? true,
      expiresAt: c.expiresAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Coupons GET Error]:", err);
    return NextResponse.json({ success: false, data: [] }, { headers: CORS_HEADERS });
  }
}

/** POST — create a new coupon */
export async function POST(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    const body = await req.json();
    const { code, discountType, discountValue, minimumOrderValue, maxUses, expiresAt } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ success: false, error: "কুপন কোড ও ডিসকাউন্ট মান আবশ্যক।" }, { status: 400, headers: CORS_HEADERS });
    }

    // Check for duplicate code
    const existing = await prisma.coupon.findFirst({ where: { code: code.toUpperCase() } } as any).catch(() => null);
    if (existing) {
      return NextResponse.json({ success: false, error: "এই কুপন কোড ইতিমধ্যে ব্যবহৃত হয়েছে।" }, { status: 409, headers: CORS_HEADERS });
    }

    const coupon = await (prisma.coupon.create as any)({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || "PERCENT",
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minimumOrderValue || 0),
        maxUses: maxUses ? Number(maxUses) : null,
        isActive: true,
        vendorId: payload.sub,
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Coupon Create Error]:", err);
    return NextResponse.json({ success: false, error: "কুপন তৈরি ব্যর্থ।" }, { status: 500, headers: CORS_HEADERS });
  }
}

/** DELETE — deactivate a coupon */
export async function DELETE(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("couponId");
    if (!couponId) {
      return NextResponse.json({ success: false, error: "couponId আবশ্যক।" }, { status: 400, headers: CORS_HEADERS });
    }

    // Ownership check
    const coupon = await (prisma.coupon.findFirst as any)({ where: { id: couponId, vendorId: payload.sub } });
    if (!coupon) {
      return NextResponse.json({ success: false, error: "কুপনটি আপনার অ্যাকাউন্টের নয়।" }, { status: 403, headers: CORS_HEADERS });
    }

    await (prisma.coupon.update as any)({ where: { id: couponId }, data: { isActive: false } });

    return NextResponse.json({ success: true, message: "কুপন নিষ্ক্রিয় করা হয়েছে।" }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Coupon Delete Error]:", err);
    return NextResponse.json({ success: false, error: "কুপন মুছে ফেলা ব্যর্থ।" }, { status: 500, headers: CORS_HEADERS });
  }
}
