import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { signCustomerToken } from "@/lib/jwt";

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
    const identifier = String(body.identifier || body.email || body.phone || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 2 characters)." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address or 11-digit mobile number." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const isEmail = identifier.includes("@");
    const cleanPhone = identifier.replace(/[^0-9]/g, "");

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isEmail ? [{ email: identifier }] : []),
          ...(cleanPhone.length >= 10 ? [{ phone: cleanPhone }, { phone: identifier }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account already exists with this email or mobile number. Please log in." },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userEmail = isEmail ? identifier : `customer_${cleanPhone || Date.now()}@tatkabazar.com`;
    const userPhone = !isEmail ? (cleanPhone.length >= 10 ? cleanPhone : identifier) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email: userEmail,
        phone: userPhone,
        passwordHash,
        isVerified: true,
      },
    });

    const accessToken = signCustomerToken({
      sub: user.id,
      role: "CUSTOMER",
      email: user.email || null,
      phone: user.phone || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: "CUSTOMER",
          },
        },
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Customer Register Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Registration failed. Please try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
