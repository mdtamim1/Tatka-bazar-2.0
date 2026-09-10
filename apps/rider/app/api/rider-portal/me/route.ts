import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyRiderToken } from "@/lib/jwt";

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
        { success: false, error: "লগইন প্রয়োজন। কোনো সেশন পাওয়া যায়নি।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const payload = verifyRiderToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Query real PostgreSQL database
    const rider = await prisma.deliveryRider.findUnique({
      where: { id: payload.sub },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: "রাইডার অ্যাকাউন্ট ডাটাবেজে পাওয়া যায়নি।" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Check suspension (reflects Admin / Hub control logic)
    if (!rider.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "🚫 আপনার অ্যাকাউন্টটি Hub অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে।",
          isSuspended: true,
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const profile = {
      id: rider.id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      vehicleType: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber || "",
      status: rider.status,
      isActive: rider.isActive,
      balance: Number(rider.balance || 0),
      totalEarned: Number(rider.totalEarned || 0),
      due: 0,
      kycStatus: rider.kycStatus,
      kycApprovedAt: rider.kycApprovedAt ? rider.kycApprovedAt.toISOString() : null,
      fatherName: rider.fatherName || "",
      motherName: rider.motherName || "",
      dateOfBirth: rider.dateOfBirth ? rider.dateOfBirth.toISOString() : "",
      presentAddress: rider.presentAddress || "",
      permanentAddress: rider.permanentAddress || "",
      nidNumber: rider.nidNumber || "",
      nidFrontUrl: rider.nidFrontUrl || "",
      nidBackUrl: rider.nidBackUrl || "",
      photoUrl: rider.photoUrl || "",
      paymentMethod: rider.paymentMethod || "BKASH",
      paymentAccount: rider.paymentAccount || "",
      paymentAccountLocked: rider.paymentAccountLocked,
      district: rider.district || "",
      thana: rider.thana || "",
      bazar: rider.bazar || "",
      createdAt: rider.createdAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: profile },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Rider Portal Me Error]:", err);
    return NextResponse.json(
      { success: false, error: "ডাটাবেজ থেকে তথ্য আনা সম্ভব হয়নি।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
