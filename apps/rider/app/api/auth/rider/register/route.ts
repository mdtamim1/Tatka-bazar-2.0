import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { signRiderToken } from "@/lib/jwt";
import { verifyBangladeshNID } from "@tatka-bazar/shared";

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
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const vehicleType = body.vehicleType === "BICYCLE" || body.vehicleType === "VAN" ? body.vehicleType : "MOTORCYCLE";
    const nidNumber = body.nidNumber ? String(body.nidNumber).trim() : null;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "আপনার পুরো নাম লিখুন (কমপক্ষে ২ অক্ষর)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!phone || phone.length < 11) {
      return NextResponse.json(
        { success: false, error: "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Optional Real NID verification if provided during registration
    if (nidNumber) {
      const nidCheck = verifyBangladeshNID({ nidNumber, fullName: name });
      if (!nidCheck.isValid) {
        return NextResponse.json(
          { success: false, error: `NID যাচাই ব্যর্থ: ${nidCheck.error}` },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    const cleanEmail = email && email.includes("@") ? email : `rider_${phone}@tatkabazar.com`;

    // Check existing rider
    const existing = await prisma.deliveryRider.findFirst({
      where: {
        OR: [{ phone }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি রাইডার একাউন্ট রয়েছে। লগইন করুন।" },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Save directly to PostgreSQL Database
    const rider = await prisma.deliveryRider.create({
      data: {
        name,
        phone,
        email: cleanEmail,
        passwordHash,
        vehicleType,
        nidNumber,
        status: "OFFLINE",
        isActive: true,
        kycStatus: "PENDING",
        balance: 0,
        totalEarned: 0,
      },
    });

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
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Rider Auth Register Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
