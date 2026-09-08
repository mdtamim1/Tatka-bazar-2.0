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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/sync/events — receive events from Hub or other portals
export async function POST(req: NextRequest) {
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
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: corsHeaders });
  }
}

// GET /api/sync/events?vendorId=... — check if vendor is suspended
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  if (vendorId && globalThis.__tatka_vendor_suspended_map__?.[vendorId]) {
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
    {
      success: true,
      isSuspended: false,
      events: (globalThis.__tatka_vendor_server_events__ || []).slice(0, 10),
    },
    { headers: corsHeaders }
  );
}
