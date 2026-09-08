import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/hubStore";
import {
  getDbRiders,
  updateDbRider,
  createDbRider,
  logDbActivity,
} from "@/lib/hubDb";
import type { HubRider } from "@/types/hub";
import { broadcastToPortals } from "@/lib/crossPortalSync";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/riders
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const riders = await getDbRiders();
  return NextResponse.json({ success: true, data: riders });
}

// POST /api/riders — add new rider
export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "SUPPORT_AGENT" || session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const newRider: HubRider = {
    id: `rider-${Date.now()}`,
    name: body.name,
    nameBn: body.nameBn,
    email: body.email,
    phone: body.phone,
    vehicleType: body.vehicleType || "MOTORCYCLE",
    vehicleNumber: body.vehicleNumber || "N/A",
    zone: body.zone,
    status: "PENDING_KYC",
    tier: "BRONZE",
    kycStatus: "NOT_SUBMITTED",
    balance: 0,
    totalEarned: 0,
    totalDeliveries: 0,
    dutyStatus: "OFFLINE",
    joinedAt: new Date().toISOString(),
  };
  await createDbRider(newRider);
  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: "RIDER_CREATED",
    targetType: "RIDER",
    targetId: newRider.id,
    targetName: newRider.name,
  });
  return NextResponse.json({ success: true, data: newRider });
}

// PATCH /api/riders — update rider (status, balance, duty, tier, etc.)
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const riders = await getDbRiders();
  const idx = riders.findIndex((r) => r.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Rider not found" }, { status: 404 });

  const prev = riders[idx];
  const updated: HubRider = { ...prev, ...body };

  // Handle suspension
  if (body.status === "SUSPENDED" && prev.status !== "SUSPENDED") {
    updated.suspendedAt = new Date().toISOString();
    updated.suspendReason = body.suspendReason || "Hub admin action";
    updated.dutyStatus = "OFFLINE";

    // Broadcast instant suspension to rider portal
    broadcastToPortals({
      type: "RIDER_SUSPENDED",
      targetId: updated.id,
      targetType: "RIDER",
      payload: {
        riderId: updated.id,
        phone: updated.phone,
        email: updated.email,
        suspendReason: updated.suspendReason,
        suspendedAt: updated.suspendedAt,
      },
      timestamp: new Date().toISOString(),
    });
  }
  // Handle activation
  if (body.status === "ACTIVE" && prev.status === "SUSPENDED") {
    updated.suspendedAt = undefined;
    updated.suspendReason = undefined;

    // Broadcast reactivation
    broadcastToPortals({
      type: "RIDER_ACTIVATED",
      targetId: updated.id,
      targetType: "RIDER",
      payload: { riderId: updated.id, phone: updated.phone },
      timestamp: new Date().toISOString(),
    });
  }
  // Balance adjustment
  if (body.balanceDelta !== undefined) {
    updated.balance = (prev.balance || 0) + Number(body.balanceDelta);
  }

  await updateDbRider(body.id, updated);

  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `RIDER_UPDATED_${body.status || (body.balanceDelta !== undefined ? "BALANCE_ADJUST" : "PROFILE")}`,
    targetType: "RIDER",
    targetId: updated.id,
    targetName: updated.name,
    details: body.suspendReason || (body.balanceDelta !== undefined ? `ΔTk.${body.balanceDelta}` : undefined),
  });

  return NextResponse.json({ success: true, data: updated });
}
