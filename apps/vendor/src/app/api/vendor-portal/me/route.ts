import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Shared helper: extract & verify vendor from Authorization header */
function getVerifiedVendor(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyVendorToken(token); // returns null if role !== "vendor"
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "লগইন প্রয়োজন অথবা সেশনের মেয়াদ শেষ হয়েছে।" },
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
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();

    // Build update data — only include fields that are actually present in the request
    const updateData: Record<string, any> = {};

    // Basic store info
    if (body.storeName !== undefined) updateData.businessName = body.storeName;
    if (body.businessName !== undefined) updateData.businessName = body.businessName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.bannerUrl !== undefined) updateData.bannerUrl = body.bannerUrl;

    // Location
    if (body.district !== undefined) updateData.district = body.district;
    if (body.thana !== undefined) updateData.thana = body.thana;
    if (body.bazar !== undefined) updateData.bazar = body.bazar;

    // Contact
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;

    // KYC fields — stored in the description field as structured metadata
    // OR in vendor metadata JSON field if your schema supports it.
    // We use a structured description prefix to persist KYC info safely.
    const kycFields = ["nidNumber", "tradeLicenseNo", "tinNumber", "binNumber",
                       "bankName", "bankBranch", "bankAccountNo", "bankRoutingNo",
                       "bkashNumber", "nagadNumber", "rocketNumber",
                       "ownerName", "operatingHoursOpen", "operatingHoursClose"];

    const hasKyc = kycFields.some((f) => body[f] !== undefined);
    if (hasKyc) {
      // Encode KYC as structured metadata in the description field
      // We use a JSON block at the end of description to store KYC data
      const currentVendor = await prisma.vendor.findUnique({
        where: { id: payload.sub },
        select: { description: true },
      });

      // Parse existing KYC block if present
      let existingDesc = currentVendor?.description || "";
      let existingKyc: Record<string, any> = {};

      const kycMarker = "\n\n---KYC_DATA---\n";
      const kycIdx = existingDesc.indexOf(kycMarker);
      if (kycIdx !== -1) {
        try {
          existingKyc = JSON.parse(existingDesc.slice(kycIdx + kycMarker.length));
          existingDesc = existingDesc.slice(0, kycIdx);
        } catch {}
      }

      // Merge new KYC fields
      const newKyc = { ...existingKyc };
      kycFields.forEach((f) => {
        if (body[f] !== undefined) newKyc[f] = body[f];
      });

      // If description was also updated in this same request, use the new one
      const baseDesc = body.description !== undefined ? body.description : existingDesc;
      updateData.description = `${baseDesc}${kycMarker}${JSON.stringify(newKyc)}`;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "আপডেট করার জন্য কোনো তথ্য পাঠানো হয়নি।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated = await prisma.vendor.update({
      where: { id: payload.sub },
      data: updateData,
    });

    return NextResponse.json(
      { success: true, data: updated, message: "প্রোফাইল সফলভাবে আপডেট হয়েছে।" },
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

