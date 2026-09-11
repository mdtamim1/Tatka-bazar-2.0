import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { signVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim().replace(/[^0-9]/g, "");
    const storeName = String(body.storeName || "").trim();
    const category = String(body.category || "কাঁচাবাজার").trim();
    const password = String(body.password || "");
    const emailInput = String(body.email || "").trim().toLowerCase();

    if (!name || phone.length < 11 || !storeName || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Check duplicate phone
    const existing = await prisma.vendor.findFirst({
      where: {
        OR: [
          { phone },
          ...(emailInput ? [{ email: emailInput }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি ভেন্ডর অ্যাকাউন্ট রয়েছে। সরাসরি লগইন করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const email = emailInput || `vendor_${phone}@tatkabazar.com`;
    const passwordHash = await bcrypt.hash(password, 12);

    // Slug generation
    let baseSlug = storeName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = `shop-${phone.slice(-4)}`;
    }
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVendor = await prisma.vendor.create({
      data: {
        businessName: storeName,
        slug,
        phone,
        email,
        passwordHash,
        status: "PENDING",
        description: `${category} • স্বত্বাধিকারী: ${name}`,
        commissionRate: 10,
        isActive: true,
      },
    });

    const accessToken = signVendorToken({
      sub: newVendor.id,
      role: "vendor",
      email: newVendor.email,
      phone: newVendor.phone,
      businessName: newVendor.businessName,
    });

    const user = {
      id: newVendor.id,
      ownerName: name,
      storeName: newVendor.businessName,
      storeNameBn: newVendor.businessName,
      slug: newVendor.slug,
      email: newVendor.email,
      phone: newVendor.phone,
      status: newVendor.status,
      isActive: newVendor.isActive,
      commissionRate: newVendor.commissionRate,
      role: "OWNER",
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          user,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Register Error]:", err);
    return NextResponse.json(
      { success: false, error: "রেজিস্ট্রেশন সম্পন্ন করা যায়নি। সার্ভার এরর।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
