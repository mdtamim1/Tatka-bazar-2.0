import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";

/**
 * POST /api/push/subscribe
 * Registers a rider's FCM token for push notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const { riderId, fcmToken, platform = "web" } = await req.json();

    if (!riderId || !fcmToken) {
      return NextResponse.json({ success: false, error: "riderId and fcmToken required" }, { status: 400 });
    }

    // Upsert push token (rider may use multiple devices)
    await prisma.riderPushToken.upsert({
      where: { riderId_fcmToken: { riderId, fcmToken } },
      update: {
        platform,
        updatedAt: new Date(),
        isActive: true,
      },
      create: {
        riderId,
        fcmToken,
        platform,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, message: "Push token registered" });
  } catch (err) {
    console.error("[Push Subscribe] Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Unregisters a rider's FCM token (logout/unsubscribe).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { riderId, fcmToken } = await req.json();
    if (!riderId || !fcmToken) {
      return NextResponse.json({ success: false, error: "riderId and fcmToken required" }, { status: 400 });
    }

    await prisma.riderPushToken.updateMany({
      where: { riderId, fcmToken },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Push Unsubscribe] Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
