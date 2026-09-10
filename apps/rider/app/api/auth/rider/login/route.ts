import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { signRiderToken } from "@/lib/jwt";

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

    // Search real rider in database by email or phone
    const rider = await prisma.deliveryRider.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          ...(cleanPhone.length >= 10 ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: "কোনো রাইডার অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Check account status / suspension (Admin / Hub control logic)
    if (!rider.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "🚫 আপনার রাইডার অ্যাকাউন্টটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। সহায়তার জন্য সাপোর্টে যোগাযোগ করুন: 01700-000000",
          isSuspended: true,
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Verify real password hash
    const isValid = await bcrypt.compare(password, rider.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "পাসওয়ার্ড ভুল হয়েছে। সঠিক পাসওয়ার্ড দিন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Generate real JWT token
    const accessToken = signRiderToken({
      sub: rider.id,
      role: "rider",
      email: rider.email,
      phone: rider.phone,
    });

    const user = {
      id: rider.id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      role: "rider",
      vehicleType: rider.vehicleType,
      kycStatus: rider.kycStatus,
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
    console.error("[Rider Auth Login Error]:", err);
    return NextResponse.json(
      { success: false, error: "ডাটাবেজ সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
