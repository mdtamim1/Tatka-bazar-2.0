import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "লগইন প্রয়োজন। কোনো সেশন পাওয়া যায়নি।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const payload = verifyVendorToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Query real PostgreSQL database
    const vendor = await prisma.vendor.findUnique({
      where: { id: payload.sub },
      include: {
        _count: {
          select: {
            products: true,
            orderItems: true,
            payouts: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "ভেন্ডর অ্যাকাউন্ট ডাটাবেজে পাওয়া যায়নি।" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Check suspension
    if (!vendor.isActive || vendor.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          error: "🚫 আপনার ভেন্ডর শপটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে।",
          isSuspended: true,
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Calculate gross sales & commissions
    const commissions = await prisma.commission.findMany({
      where: { vendorId: vendor.id },
    });
    const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId: vendor.id, status: "COMPLETED" },
    });
    const totalWithdrawn = payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const profile = {
      id: vendor.id,
      storeName: vendor.businessName,
      storeNameBn: vendor.businessName,
      slug: vendor.slug,
      ownerName: vendor.description?.match(/স্বত্বাধিকারী:\s*([^\n•]+)/)?.[1]?.trim() || "ভেন্ডর স্বত্বাধিকারী",
      phone: vendor.phone,
      email: vendor.email,
      description: vendor.description || "",
      logoUrl: vendor.logoUrl || "",
      bannerUrl: vendor.bannerUrl || "",
      status: vendor.status,
      isActive: vendor.isActive,
      commissionRate: vendor.commissionRate,
      rating: 4.9,
      kycStatus: vendor.status === "APPROVED" ? "APPROVED" : "PENDING",
      district: vendor.district || "ঢাকা",
      thana: vendor.thana || "মিরপুর",
      bazar: vendor.bazar || "মিরপুর কাঁচাবাজার",
      totalProducts: vendor._count.products,
      totalOrders: vendor._count.orderItems,
      totalCommissions,
      totalWithdrawn,
      availableBalance: Math.max(0, totalCommissions - totalWithdrawn),
      operatingHours: { open: "08:00", close: "22:00" },
      vacationMode: false,
      createdAt: vendor.createdAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: profile },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Portal Me Error]:", err);
    return NextResponse.json(
      { success: false, error: "ডাটাবেজ থেকে তথ্য লোড করা যায়নি।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const payload = verifyVendorToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();

    const updated = await prisma.vendor.update({
      where: { id: payload.sub },
      data: {
        ...(body.storeName ? { businessName: body.storeName } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
        ...(body.district ? { district: body.district } : {}),
        ...(body.thana ? { thana: body.thana } : {}),
        ...(body.bazar ? { bazar: body.bazar } : {}),
      },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Profile Update Error]:", err);
    return NextResponse.json(
      { success: false, error: "প্রোফাইল আপডেট ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
