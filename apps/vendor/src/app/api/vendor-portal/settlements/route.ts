import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Shared helper: extract & verify vendor from Authorization header */
function getVerifiedVendor(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyVendorToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "লগইন প্রয়োজন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const [commissions, payouts] = await Promise.all([
      prisma.commission.findMany({
        where: { vendorId: payload.sub },
        include: { order: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.vendorPayout.findMany({
        where: { vendorId: payload.sub },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const formattedLedger = commissions.map((c) => {
      const gross = Number(c.order?.total || c.amount);
      const fee = Number(c.amount);
      const net = Math.max(0, gross - fee);
      return {
        id: c.id,
        orderId: c.orderId,
        displayId: c.order?.orderNumber || "ORD-000",
        date: c.createdAt.toISOString().slice(0, 10),
        grossAmount: gross,
        commissionRate: c.rate,
        commissionFee: fee,
        netPayable: net,
        settlementStatus: c.isPaid ? ("SETTLED" as const) : ("PENDING" as const),
      };
    });

    const formattedPayouts = payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: "BKASH" as any,
      accountNumber: p.reference || "",
      status: p.status,
      requestedAt: p.createdAt.toISOString(),
      processedAt: p.processedAt?.toISOString(),
      transactionRef: p.reference || undefined,
      notes: p.note || undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        data: { ledger: formattedLedger, payouts: formattedPayouts },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Settlements Error]:", err);
    return NextResponse.json(
      { success: false, error: "সেটেলমেন্ট তথ্য লোড করা যায়নি।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { amount, method, account } = body;

    const withdrawAmt = Number(amount);
    if (!withdrawAmt || withdrawAmt < 100) {
      return NextResponse.json(
        { success: false, error: "সর্বনিম্ন উত্তোলনের পরিমাণ ৳১০০।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 🔒 BALANCE CHECK: Calculate available balance from DB before creating payout
    const [commissions, existingPayouts] = await Promise.all([
      prisma.commission.findMany({
        where: { vendorId: payload.sub },
        select: { amount: true },
      }),
      prisma.vendorPayout.findMany({
        where: {
          vendorId: payload.sub,
          status: { in: ["COMPLETED", "PENDING"] }, // Count pending too to prevent over-withdrawal
        },
        select: { amount: true },
      }),
    ]);

    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalAllocated = existingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const availableBalance = Math.max(0, totalEarned - totalAllocated);

    if (withdrawAmt > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `অপর্যাপ্ত ব্যালেন্স। উপলব্ধ ব্যালেন্স: ৳${availableBalance.toFixed(2)}। আপনি সর্বোচ্চ ৳${availableBalance.toFixed(2)} উত্তোলন করতে পারবেন।`,
          availableBalance,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const newPayout = await prisma.vendorPayout.create({
      data: {
        vendorId: payload.sub,
        amount: withdrawAmt,
        status: "PENDING",
        reference: `${method || "BKASH"} • ${account || ""}`,
        note: "উইথড্র রিকোয়েস্ট — অ্যাডমিন অনুমোদনের অপেক্ষায়",
      },
    });

    return NextResponse.json(
      { success: true, data: newPayout },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Request Payout Error]:", err);
    return NextResponse.json(
      { success: false, error: "উইথড্র রিকোয়েস্ট তৈরি ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
