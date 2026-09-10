import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyCustomerToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        { success: false, error: "Authentication required" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const payload = verifyCustomerToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session. Please log in again." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: "CUSTOMER",
            createdAt: user.createdAt.toISOString(),
          },
          addresses: user.addresses,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Customer Me Route Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
