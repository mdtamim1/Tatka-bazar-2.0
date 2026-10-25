import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

/**
 * GET — reviews for this vendor's products.
 * Schema: Review { productId, userId, rating, title, body, isVerified }
 * No direct orderItem relation — we join through product → vendorId.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;

    // Get reviews for products belonging to this vendor
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          product: { vendorId: payload.sub },
        },
        include: {
          product: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: { product: { vendorId: payload.sub } },
      }),
    ]);

    const formatted = reviews.map(r => {
      // Parse vendor reply from body if stored as ---VENDOR_REPLY---
      const body = r.body || "";
      const replyMarker = "\n\n---VENDOR_REPLY---\n";
      const replyIdx = body.indexOf(replyMarker);
      const comment = replyIdx !== -1 ? body.slice(0, replyIdx) : body;
      const vendorReply = replyIdx !== -1 ? body.slice(replyIdx + replyMarker.length) : null;

      return {
        id: r.id,
        rating: r.rating,
        title: r.title || "",
        comment,
        vendorReply,
        productName: r.product?.name || "—",
        customerName: r.user?.name || "গ্রাহক",
        isVerified: r.isVerified,
        createdAt: r.createdAt.toISOString(),
      };
    });

    const avgRating = formatted.length > 0
      ? formatted.reduce((s, r) => s + r.rating, 0) / formatted.length
      : 0;

    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: formatted.filter(r => r.rating === star).length,
    }));

    return NextResponse.json({
      success: true,
      data: { reviews: formatted, totalCount, avgRating: Math.round(avgRating * 10) / 10, page, ratingDist },
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Reviews Error]:", err);
    return NextResponse.json({ success: false, error: "রিভিউ লোড ব্যর্থ।" }, { status: 500, headers: CORS_HEADERS });
  }
}

/** POST — vendor replies to a review (stored appended to body) */
export async function POST(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    const body = await req.json();
    const { reviewId, reply } = body;

    if (!reviewId || !reply?.trim()) {
      return NextResponse.json({ success: false, error: "reviewId এবং reply আবশ্যক।" }, { status: 400, headers: CORS_HEADERS });
    }

    const review = await prisma.review.findFirst({
      where: { id: reviewId, product: { vendorId: payload.sub } },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: "রিভিউটি আপনার অ্যাকাউন্টের নয়।" }, { status: 403, headers: CORS_HEADERS });
    }

    const existingBody = review.body || "";
    const replyMarker = "\n\n---VENDOR_REPLY---\n";
    const baseBody = existingBody.includes(replyMarker)
      ? existingBody.slice(0, existingBody.indexOf(replyMarker))
      : existingBody;

    await prisma.review.update({
      where: { id: reviewId },
      data: { body: `${baseBody}${replyMarker}${reply.trim()}` },
    });

    return NextResponse.json({ success: true, message: "রিপ্লাই সফলভাবে পাঠানো হয়েছে।" }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Review Reply Error]:", err);
    return NextResponse.json({ success: false, error: "রিপ্লাই পাঠানো ব্যর্থ।" }, { status: 500, headers: CORS_HEADERS });
  }
}
