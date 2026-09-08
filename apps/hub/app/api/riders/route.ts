import { NextRequest, NextResponse } from "next/server";
import {
  getRiders, logActivity, validateSession,
} from "@/lib/hubStore";
import type { HubRider, RiderStatus, DutyStatus } from "@/types/hub";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/riders
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  const riders = getRiders();
  return NextResponse.json({ success: true, data: riders });
}

// POST /api/riders — add new rider
export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  if (session.role === "SUPPORT_AGENT" || session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
  }
  const body = await req.json();
  const riders = getRiders();
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
  riders.unshift(newRider);
  logActivity({
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
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  if (session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
  }
  const body = await req.json();
  const riders = getRiders();
  const idx = riders.findIndex((r) => r.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "রাইডার পাওয়া যায়নি" }, { status: 404 });

  const prev = riders[idx];
  const updated: HubRider = { ...prev, ...body };

  // Handle suspension
  if (body.status === "SUSPENDED" && prev.status !== "SUSPENDED") {
    updated.suspendedAt = new Date().toISOString();
    updated.suspendReason = body.suspendReason || "Hub admin action";
    updated.dutyStatus = "OFFLINE";
  }
  // Handle activation
  if (body.status === "ACTIVE" && prev.status === "SUSPENDED") {
    updated.suspendedAt = undefined;
    updated.suspendReason = undefined;
  }
  // Balance adjustment
  if (body.balanceDelta !== undefined) {
    updated.balance = (prev.balance || 0) + Number(body.balanceDelta);
  }

  riders[idx] = updated;

  logActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `RIDER_UPDATED_${body.status || (body.balanceDelta !== undefined ? "BALANCE_ADJUST" : "PROFILE")}`,
    targetType: "RIDER",
    targetId: updated.id,
    targetName: updated.name,
    details: body.suspendReason || (body.balanceDelta !== undefined ? `Δ৳${body.balanceDelta}` : undefined),
  });

  return NextResponse.json({ success: true, data: updated });
}
