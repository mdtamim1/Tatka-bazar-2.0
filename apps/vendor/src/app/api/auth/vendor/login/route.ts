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
    const identifier = String(body.email || body.phone || body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanPhone = identifier.replace(/[^0-9]/g, "");

    // Query real PostgreSQL database
    const vendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          ...(cleanPhone.length >= 10 ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "কোনো ভেন্ডর অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Check suspension / status
    if (!vendor.isActive || vendor.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          error: "🚫 আপনার ভেন্ডর শপটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে। সহায়তার জন্য সাপোর্টে যোগাযোগ করুন: 01700-000000",
          isSuspended: true,
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Verify bcrypt password
    const isValid = await bcrypt.compare(password, vendor.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "পাসওয়ার্ড ভুল হয়েছে। সঠিক পাসওয়ার্ড দিন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Generate real JWT token
    const accessToken = signVendorToken({
      sub: vendor.id,
      role: "vendor",
      email: vendor.email,
      phone: vendor.phone,
      businessName: vendor.businessName,
    });

    const user = {
      id: vendor.id,
      storeName: vendor.businessName,
      storeNameBn: vendor.businessName,
      slug: vendor.slug,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
      isActive: vendor.isActive,
      commissionRate: vendor.commissionRate,
      district: vendor.district || "",
      thana: vendor.thana || "",
      bazar: vendor.bazar || "",
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
    console.error("[Vendor Login Error]:", err);
    return NextResponse.json(
      { success: false, error: "লগইন প্রক্রিয়া সম্পন্ন করা যায়নি। সার্ভার এরর।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
