import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyRiderToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("rider_token")?.value;
    if (token) {
      const payload = verifyRiderToken(token);
      if (payload?.sub) {
        await prisma.deliveryRider.update({
          where: { id: payload.sub },
          data: { status: "OFFLINE" },
        }).catch(() => {});
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "সফলভাবে লগআউট হয়েছে",
    });

    response.cookies.set("rider_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
