import { NextRequest, NextResponse } from "next/server";

declare global {
  var __tatka_vendor_server_events__: any[] | undefined;
  var __tatka_vendor_suspended_map__: Record<string, { suspendReason?: string; suspendedAt?: string }> | undefined;
}

if (!globalThis.__tatka_vendor_server_events__) {
  globalThis.__tatka_vendor_server_events__ = [];
}
if (!globalThis.__tatka_vendor_suspended_map__) {
  globalThis.__tatka_vendor_suspended_map__ = {};
}

// 🔒 Only trusted Hub/Admin portals may POST events (suspend/activate vendors).
// Set INTERNAL_API_SECRET in .env on both Hub and Vendor portals to the SAME value.
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_HUB_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * POST /api/sync/events — receive events from Hub or Admin portals ONLY.
 * 🔒 SECURITY: Requires X-Internal-Secret header matching INTERNAL_API_SECRET env var.
 * This prevents any random internet user from spoofing VENDOR_SUSPENDED events.
 */
export async function POST(req: NextRequest) {
  // 🔒 Verify caller is a trusted internal portal (Hub / Admin)
  const internalSecret = req.headers.get("x-internal-secret");
  if (!INTERNAL_API_SECRET || internalSecret !== INTERNAL_API_SECRET) {
    return NextResponse.json(
      { success: false, error: "অননুমোদিত উৎস — শুধুমাত্র Hub বা Admin পোর্টাল থেকে সিনক ইভেন্ট পাঠানো যাবে।" },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const event = {
      ...body,
      receivedAt: new Date().toISOString(),
    };

    globalThis.__tatka_vendor_server_events__!.unshift(event);
    if (globalThis.__tatka_vendor_server_events__!.length > 100) {
      globalThis.__tatka_vendor_server_events__!.pop();
    }

    if (body.type === "VENDOR_SUSPENDED") {
      const vendorId = body.targetId || body.payload?.vendorId;
      if (vendorId) {
        globalThis.__tatka_vendor_suspended_map__![vendorId] = {
          suspendReason: body.payload?.suspendReason || "দোকান স্থগিত করা হয়েছে",
          suspendedAt: body.payload?.suspendedAt || new Date().toISOString(),
        };
      }
    }

    if (body.type === "VENDOR_ACTIVATED") {
      const vendorId = body.targetId || body.payload?.vendorId;
      if (vendorId) {
        delete globalThis.__tatka_vendor_suspended_map__![vendorId];
      }
    }

    return NextResponse.json({ success: true, received: true }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/sync/events?vendorId=... — check if a specific vendor is suspended.
 * 🔒 This is read-only and used by the vendor's own browser (heartbeat check).
 * No auth needed here since it only reveals the status of the queried vendorId.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (!vendorId) {
    return NextResponse.json(
      { success: false, error: "vendorId প্যারামিটার অনুপস্থিত।" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (globalThis.__tatka_vendor_suspended_map__?.[vendorId]) {
    return NextResponse.json(
      {
        success: true,
        isSuspended: true,
        data: globalThis.__tatka_vendor_suspended_map__[vendorId],
      },
      { headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { success: true, isSuspended: false },
    { headers: corsHeaders }
  );
}
