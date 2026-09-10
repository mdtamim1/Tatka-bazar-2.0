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
    const identifier = String(body.identifier || body.email || body.phone || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or mobile number and password." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const cleanPhone = identifier.replace(/[^0-9]/g, "");

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          ...(cleanPhone.length >= 10 ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found with this email or mobile number." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (!user.passwordHash || user.passwordHash === "GOOGLE_OAUTH") {
      return NextResponse.json(
        { success: false, error: "This account was registered with Google. Please use Google Sign In." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password. Please check your credentials and try again." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

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
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Customer Login Route Error]:", err);
    return NextResponse.json(
      { success: false, error: "Server connection failed. Please try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
