import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyRiderToken } from "@/lib/jwt";
import { verifyBangladeshNID, callExternalNidService } from "@tatka-bazar/shared";

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
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "অননুমোদিত। অনুগ্রহ করে লগইন করুন।" },
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

    const rider = await prisma.deliveryRider.findUnique({
      where: { id: payload.sub },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: "রাইডার অ্যাকাউন্ট পাওয়া যায়নি।" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // If KYC is already approved, it cannot be edited without admin
    if (rider.kycStatus === "APPROVED") {
      return NextResponse.json(
        { success: false, error: "আপনার KYC ইতিমধ্যে যাচাই সম্পন্ন (Approved) হয়েছে। এটি পরিবর্তন করা যাবে না।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const {
      fatherName,
      motherName,
      dateOfBirth,
      presentAddress,
      permanentAddress,
      nidNumber,
      nidFrontUrl,
      nidBackUrl,
      photoUrl,
    } = body;

    if (!nidNumber || String(nidNumber).trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "সঠিক NID নম্বর প্রদান করুন (১০, ১৩ বা ১৭ ডিজিট)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // ─── Real Bangladesh NID Verification Engine ───
    const nidVerification = verifyBangladeshNID({
      nidNumber: String(nidNumber).trim(),
      dateOfBirth: dateOfBirth || null,
      fullName: rider.name,
      nidFrontUrl: nidFrontUrl || null,
      nidBackUrl: nidBackUrl || null,
    });

    if (!nidVerification.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `⚠️ NID যাচাই ব্যর্থ: ${nidVerification.error}`,
          details: nidVerification.details,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Optional External API verification (if configured in env)
    let externalData: any = null;
    if (dateOfBirth) {
      const extRes = await callExternalNidService(String(nidNumber).trim(), String(dateOfBirth).split("T")[0] || "");
      if (extRes.success) {
        externalData = extRes.externalData;
        nidVerification.details.externalVerified = true;
      }
    }

    // ─── Google Gemini 1.5 Vision Biometric Face Match & OCR ───
    let geminiAiResult: any = null;
    if (photoUrl && nidFrontUrl) {
      const { verifyWithGeminiVision } = await import("@tatka-bazar/shared");
      geminiAiResult = await verifyWithGeminiVision({
        nidFrontImage: String(nidFrontUrl),
        liveSelfieImage: String(photoUrl),
        claimedName: rider.name,
        claimedNid: String(nidNumber),
        claimedDob: dateOfBirth ? String(dateOfBirth) : undefined,
      });
    }

    let parsedDob: Date | null = null;
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) {
        parsedDob = d;
      }
    }

    // Update real record in Supabase PostgreSQL
    const updated = await prisma.deliveryRider.update({
      where: { id: rider.id },
      data: {
        fatherName: fatherName ? String(fatherName).trim() : rider.fatherName,
        motherName: motherName ? String(motherName).trim() : rider.motherName,
        dateOfBirth: parsedDob || rider.dateOfBirth,
        presentAddress: presentAddress ? String(presentAddress).trim() : rider.presentAddress,
        permanentAddress: permanentAddress ? String(permanentAddress).trim() : rider.permanentAddress,
        nidNumber: nidVerification.canonicalNid || String(nidNumber).trim(),
        nidFrontUrl: nidFrontUrl ? String(nidFrontUrl).trim() : rider.nidFrontUrl,
        nidBackUrl: nidBackUrl ? String(nidBackUrl).trim() : rider.nidBackUrl,
        photoUrl: photoUrl ? String(photoUrl).trim() : rider.photoUrl,
        kycStatus: "SUBMITTED",
        kycSubmittedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "NID ভেরিফিকেশন সফল! আপনার তথ্য Hub ও Admin অনুমোদনের জন্য জমা হয়েছে।",
        data: {
          kycStatus: "SUBMITTED",
          nidType: nidVerification.nidType,
          confidenceScore: nidVerification.confidenceScore,
          isAdult: nidVerification.isAdult,
          calculatedAge: nidVerification.calculatedAge,
          details: nidVerification.details,
          externalData,
          geminiAi: geminiAiResult,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Rider KYC Submit Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "KYC সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
