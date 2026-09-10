import { NextRequest, NextResponse } from "next/server";

// Store recent cross-portal events in memory on the rider server
declare global {
  var __tatka_rider_server_events__: any[] | undefined;
  var __tatka_rider_suspended_map__: Record<string, { suspendReason?: string; suspendedAt?: string }> | undefined;
}

if (!globalThis.__tatka_rider_server_events__) {
  globalThis.__tatka_rider_server_events__ = [];
}
if (!globalThis.__tatka_rider_suspended_map__) {
  globalThis.__tatka_rider_suspended_map__ = {};
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

    globalThis.__tatka_rider_server_events__!.unshift(event);
    if (globalThis.__tatka_rider_server_events__!.length > 100) {
      globalThis.__tatka_rider_server_events__!.pop();
    }

    // If rider is suspended, record in map
    if (body.type === "RIDER_SUSPENDED") {
      const riderId = body.targetId || body.payload?.riderId;
      if (riderId) {
        globalThis.__tatka_rider_suspended_map__![riderId] = {
          suspendReason: body.payload?.suspendReason || "অ্যাকাউন্ট স্থগিত করা হয়েছে",
          suspendedAt: body.payload?.suspendedAt || new Date().toISOString(),
        };
      }
    }

    // If rider is reactivated, remove from map
    if (body.type === "RIDER_ACTIVATED") {
      const riderId = body.targetId || body.payload?.riderId;
      if (riderId) {
        delete globalThis.__tatka_rider_suspended_map__![riderId];
      }
    }

    return NextResponse.json({ success: true, received: true }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: corsHeaders });
  }
}

// GET /api/sync/events?riderId=... — check if rider has pending events or is suspended
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riderId = searchParams.get("riderId");

  if (riderId) {
    if (globalThis.__tatka_rider_suspended_map__?.[riderId]) {
      return NextResponse.json(
        {
          success: true,
          isSuspended: true,
          data: globalThis.__tatka_rider_suspended_map__[riderId],
        },
        { headers: corsHeaders }
      );
    }

    try {
      const { prisma } = await import("@tatka-bazar/database");
      const rider = await prisma.deliveryRider.findFirst({
        where: {
          OR: [{ id: riderId }, { phone: riderId }],
        },
        select: { id: true, isActive: true, kycStatus: true, status: true },
      });

      if (rider && !rider.isActive) {
        return NextResponse.json(
          {
            success: true,
            isSuspended: true,
            data: {
              suspendReason: "অ্যাকাউন্টটি Hub/Admin কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে।",
              suspendedAt: new Date().toISOString(),
            },
          },
          { headers: corsHeaders }
        );
      }
    } catch {}
  }

  return NextResponse.json(
    {
      success: true,
      isSuspended: false,
      events: (globalThis.__tatka_rider_server_events__ || []).slice(0, 10),
    },
    { headers: corsHeaders }
  );
}
