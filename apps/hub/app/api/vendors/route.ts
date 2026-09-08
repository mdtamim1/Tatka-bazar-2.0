import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/hubStore";
import {
  getDbVendors,
  updateDbVendor,
  logDbActivity,
} from "@/lib/hubDb";
import { broadcastToPortals } from "@/lib/crossPortalSync";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/vendors
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const vendors = await getDbVendors();
  return NextResponse.json({ success: true, data: vendors });
}

// PATCH /api/vendors — approve, suspend, commission change, tier, etc.
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const vendors = await getDbVendors();
  const idx = vendors.findIndex((v) => v.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });

  const prev = vendors[idx];
  const updated = { ...prev, ...body };

  if (body.status === "ACTIVE" && prev.status === "PENDING_APPROVAL") {
    updated.approvedAt = new Date().toISOString();
    updated.approvedBy = session.name;
    broadcastToPortals({
      type: "VENDOR_APPROVED",
      targetId: updated.id,
      targetType: "VENDOR",
      payload: { vendorId: updated.id, storeName: updated.storeName },
      timestamp: new Date().toISOString(),
    });
  }
  if (body.status === "SUSPENDED") {
    updated.suspendedAt = new Date().toISOString();
    updated.suspendReason = body.suspendReason || "Hub admin action";
    updated.vacationMode = false;
    broadcastToPortals({
      type: "VENDOR_SUSPENDED",
      targetId: updated.id,
      targetType: "VENDOR",
      payload: {
        vendorId: updated.id,
        storeName: updated.storeName,
        suspendReason: updated.suspendReason,
        suspendedAt: updated.suspendedAt,
      },
      timestamp: new Date().toISOString(),
    });
  }
  if (body.status === "ACTIVE" && prev.status === "SUSPENDED") {
    updated.suspendedAt = undefined;
    updated.suspendReason = undefined;
    broadcastToPortals({
      type: "VENDOR_ACTIVATED",
      targetId: updated.id,
      targetType: "VENDOR",
      payload: { vendorId: updated.id, storeName: updated.storeName },
      timestamp: new Date().toISOString(),
    });
  }
  if (body.status === "REJECTED") {
    updated.rejectionReason = body.rejectionReason || "Requirements not met";
  }

  await updateDbVendor(body.id, updated);

  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `VENDOR_${body.status || (body.commissionRate !== undefined ? "COMMISSION_UPDATED" : "UPDATED")}`,
    targetType: "VENDOR",
    targetId: updated.id,
    targetName: updated.storeName,
    details: body.commissionRate !== undefined
      ? `Commission: ${prev.commissionRate}% → ${body.commissionRate}%`
      : body.suspendReason || body.rejectionReason,
  });

  return NextResponse.json({ success: true, data: updated });
}
